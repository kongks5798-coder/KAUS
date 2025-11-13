import { useState, useEffect } from 'react';
import { Vote, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { governanceService } from '../services/governance';
import { ProposalWithVotes } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function GovernancePage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<ProposalWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    votingPeriodDays: 7,
  });

  const walletAddress = user?.user_metadata?.wallet_address;

  useEffect(() => {
    loadProposals();
    checkVotingEligibility();
  }, [walletAddress]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await governanceService.getAllProposals();
      setProposals(data);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkVotingEligibility = async () => {
    if (!walletAddress) {
      setCanVote(false);
      return;
    }

    try {
      const eligible = await governanceService.canVote(walletAddress);
      setCanVote(eligible);
    } catch (error) {
      console.error('Failed to check voting eligibility:', error);
      setCanVote(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!walletAddress || !newProposal.title || !newProposal.description) return;

    try {
      setProcessing(true);
      await governanceService.createProposal(
        newProposal.title,
        newProposal.description,
        newProposal.votingPeriodDays,
        walletAddress
      );
      alert('제안이 생성되었습니다!');
      setShowCreateModal(false);
      setNewProposal({ title: '', description: '', votingPeriodDays: 7 });
      await loadProposals();
    } catch (error: any) {
      console.error('Failed to create proposal:', error);
      alert(`제안 생성 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleVote = async (proposalId: string, support: boolean) => {
    if (!walletAddress) return;
    if (!canVote) {
      alert('투표하려면 NFT와 투표권이 필요합니다.');
      return;
    }

    try {
      setProcessing(true);
      await governanceService.vote(proposalId, support, walletAddress);
      alert('투표가 완료되었습니다!');
      await loadProposals();
    } catch (error: any) {
      console.error('Failed to vote:', error);
      alert(`투표 실패: ${error.message}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">거버넌스</h1>
            <p className="text-slate-600">K-AUS 커뮤니티 투표에 참여하세요</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            새 제안
          </button>
        </div>

        {!canVote && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
            <p className="text-orange-800 text-sm">
              투표하려면 NFT를 보유하고 토큰을 스테이킹해야 합니다.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {proposals.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <Vote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">아직 제안이 없습니다.</p>
              <p className="text-slate-500 text-sm mt-2">첫 번째 제안을 만들어보세요!</p>
            </div>
          ) : (
            proposals.map((proposal) => {
              const totalVotes = BigInt(proposal.votes_for) + BigInt(proposal.votes_against);
              const forPercentage = totalVotes > 0n
                ? Number((BigInt(proposal.votes_for) * 100n) / totalVotes)
                : 0;
              const againstPercentage = 100 - forPercentage;

              return (
                <div key={proposal.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{proposal.title}</h3>
                      <p className="text-slate-600 mb-4">{proposal.description}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>제안자: {proposal.proposer?.name || '알 수 없음'}</span>
                        <span>•</span>
                        <span>
                          {proposal.votingEnded ? '투표 종료' : '투표 진행 중'}
                        </span>
                        <span>•</span>
                        <span>{new Date(proposal.end_time).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>

                    {proposal.executed && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        실행됨
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-600 font-medium">찬성 {forPercentage}%</span>
                      <span className="text-red-600 font-medium">반대 {againstPercentage}%</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-green-500"
                        style={{ width: `${forPercentage}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${againstPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{Number(proposal.votes_for).toLocaleString()} VP</span>
                      <span>{Number(proposal.votes_against).toLocaleString()} VP</span>
                    </div>
                  </div>

                  {!proposal.votingEnded && !proposal.hasVoted && canVote && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote(proposal.id, true)}
                        disabled={processing}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-slate-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        찬성
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, false)}
                        disabled={processing}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-slate-300 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        반대
                      </button>
                    </div>
                  )}

                  {proposal.hasVoted && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-blue-800 text-sm font-medium">
                        투표 완료: {proposal.userVote ? '찬성' : '반대'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">새 제안 만들기</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">제목</label>
                  <input
                    type="text"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="제안 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">설명</label>
                  <textarea
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="제안 내용을 자세히 설명하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">투표 기간 (일)</label>
                  <input
                    type="number"
                    value={newProposal.votingPeriodDays}
                    onChange={(e) => setNewProposal({ ...newProposal, votingPeriodDays: parseInt(e.target.value) })}
                    min={1}
                    max={30}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateProposal}
                    disabled={processing || !newProposal.title || !newProposal.description}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-300"
                  >
                    {processing ? '생성 중...' : '제안 생성'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
