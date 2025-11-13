import { useState, useEffect } from 'react';
import { Lock, TrendingUp, Coins, Calendar, Award } from 'lucide-react';
import { stakingService, LOCK_PERIODS, LOCK_PERIOD_LABELS } from '../services/staking';
import { StakingStats, TokenStake } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function StakingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StakingStats | null>(null);
  const [stakes, setStakes] = useState<TokenStake[]>([]);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(LOCK_PERIODS['90_DAYS']);
  const [processing, setProcessing] = useState(false);

  const walletAddress = user?.user_metadata?.wallet_address;

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const loadData = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      const [stakesData, statsData, balance] = await Promise.all([
        stakingService.getMyStakes(),
        stakingService.getStakingStats(walletAddress),
        stakingService.getTokenBalance(walletAddress),
      ]);

      setStakes(stakesData);
      setStats(statsData);
      setTokenBalance(balance);
    } catch (error) {
      console.error('Failed to load staking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!walletAddress || !stakeAmount || parseFloat(stakeAmount) <= 0) return;

    try {
      setProcessing(true);
      await stakingService.stake(stakeAmount, selectedPeriod, walletAddress);
      alert('스테이킹이 완료되었습니다!');
      setStakeAmount('');
      await loadData();
    } catch (error: any) {
      console.error('Staking failed:', error);
      alert(`스테이킹 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleClaimReward = async () => {
    if (!walletAddress) return;

    try {
      setProcessing(true);
      await stakingService.claimReward(walletAddress);
      alert('리워드가 청구되었습니다!');
      await loadData();
    } catch (error: any) {
      console.error('Claim failed:', error);
      alert(`리워드 청구 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnstake = async () => {
    if (!walletAddress) return;
    if (!confirm('스테이킹을 해제하시겠습니까?')) return;

    try {
      setProcessing(true);
      await stakingService.unstake();
      alert('스테이킹이 해제되었습니다!');
      await loadData();
    } catch (error: any) {
      console.error('Unstake failed:', error);
      alert(`스테이킹 해제 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">로딩 중...</div>
      </div>
    );
  }

  const activeStake = stakes.find(s => s.status === 'active');
  const unlockDate = activeStake ? new Date(activeStake.start_time).getTime() + (activeStake.lock_period * 1000) : null;
  const canUnstake = unlockDate && Date.now() >= unlockDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">K-AUS 스테이킹</h1>
          <p className="text-slate-600">토큰을 스테이킹하고 리워드를 받으세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">내 잔액</span>
              <Coins className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{parseFloat(tokenBalance).toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">KAUS</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">스테이킹 중</span>
              <Lock className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{parseFloat(stats?.myStake || '0').toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">KAUS</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">예상 리워드</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{parseFloat(stats?.estimatedReward || '0').toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">KAUS</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">투표권</span>
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{parseFloat(stats?.votingPower || '0').toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">VP</p>
          </div>
        </div>

        {!activeStake ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">새 스테이킹</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  스테이킹 수량
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-slate-500 mt-1">
                  사용 가능: {parseFloat(tokenBalance).toLocaleString()} KAUS
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  락업 기간
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(LOCK_PERIODS).map(([key, period]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-3 rounded-lg border-2 transition ${
                        selectedPeriod === period
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {LOCK_PERIOD_LABELS[period]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStake}
                disabled={processing || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed font-medium"
              >
                {processing ? '처리 중...' : '스테이킹하기'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">활성 스테이킹</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600">스테이킹 수량</span>
                <span className="font-semibold text-slate-900">
                  {parseFloat(stats?.myStake || '0').toLocaleString()} KAUS
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600">락업 기간</span>
                <span className="font-semibold text-slate-900">
                  {LOCK_PERIOD_LABELS[activeStake.lock_period]}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600">예상 리워드</span>
                <span className="font-semibold text-green-600">
                  {parseFloat(stats?.estimatedReward || '0').toLocaleString()} KAUS
                </span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600">잠금 해제</span>
                <span className="font-semibold text-slate-900">
                  {unlockDate && new Date(unlockDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleClaimReward}
                disabled={processing || parseFloat(stats?.estimatedReward || '0') === 0}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed font-medium"
              >
                {processing ? '처리 중...' : '리워드 청구'}
              </button>

              <button
                onClick={handleUnstake}
                disabled={processing || !canUnstake}
                className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed font-medium"
              >
                {processing ? '처리 중...' : canUnstake ? '스테이킹 해제' : '잠금 기간 중'}
              </button>
            </div>
          </div>
        )}

        {stakes.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">스테이킹 내역</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">수량</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">기간</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">시작일</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {stakes.map((stake) => (
                    <tr key={stake.id} className="border-b border-slate-100">
                      <td className="py-3 px-4">{parseFloat(stake.amount).toLocaleString()} KAUS</td>
                      <td className="py-3 px-4">{LOCK_PERIOD_LABELS[stake.lock_period]}</td>
                      <td className="py-3 px-4">{new Date(stake.start_time).toLocaleDateString('ko-KR')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          stake.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {stake.status === 'active' ? '활성' : '해제됨'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
