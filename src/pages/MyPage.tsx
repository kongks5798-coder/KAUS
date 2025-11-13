import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Customer, BlockchainJob } from '../types';
import { Loader2, User, Wallet, Activity } from 'lucide-react';

export function MyPage() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<BlockchainJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCustomerData();
      loadJobs();
    }
  }, [user]);

  const loadCustomerData = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setCustomer(data);
    } catch (err) {
      console.error('Error loading customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_jobs')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    );
  }

  const getJobStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700';
  };

  const getJobTypeText = (type: string) => {
    return type === 'CREATE_WALLET' ? '지갑 생성' : 'NFT 발급';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">마이페이지</h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-slate-100 rounded-full p-4">
              <User className="h-8 w-8 text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{customer?.name}</h2>
              <p className="text-slate-600">{customer?.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">전화번호</div>
              <div className="font-medium">{customer?.phone || '미등록'}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1 flex items-center space-x-1">
                <Wallet className="h-4 w-4" />
                <span>블록체인 지갑</span>
              </div>
              {customer?.wallet_address ? (
                <div className="font-mono text-xs break-all">
                  {customer.wallet_address}
                </div>
              ) : (
                <div className="text-slate-500">생성 중...</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="h-5 w-5 text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900">블록체인 작업 내역</h2>
          </div>

          {jobs.length === 0 ? (
            <p className="text-slate-600 text-center py-8">작업 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-slate-900">
                      {getJobTypeText(job.job_type)}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getJobStatusBadge(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600">
                    생성일: {new Date(job.created_at).toLocaleString('ko-KR')}
                  </div>

                  {job.completed_at && (
                    <div className="text-sm text-slate-600">
                      완료일: {new Date(job.completed_at).toLocaleString('ko-KR')}
                    </div>
                  )}

                  {job.error_message && (
                    <div className="text-sm text-red-600 mt-2">
                      오류: {job.error_message}
                    </div>
                  )}

                  {job.retry_count > 0 && (
                    <div className="text-sm text-amber-600 mt-2">
                      재시도 횟수: {job.retry_count}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
