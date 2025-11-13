import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Search, Package, User, Calendar, Hash, ExternalLink, AlertTriangle } from 'lucide-react';
import { nftsService } from '../services/nfts';
import { reportsService } from '../services/reports';
import { NFTWithDetails } from '../types';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const nftIdFromUrl = searchParams.get('nft');

  const [nftId, setNftId] = useState(nftIdFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [nft, setNft] = useState<NFTWithDetails | null>(null);
  const [searched, setSearched] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: '',
    email: '',
    description: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if (nftIdFromUrl) {
      handleVerify();
    }
  }, []);

  const handleVerify = async () => {
    if (!nftId.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const result = await nftsService.verifyByNftId(nftId.trim());
      setNft(result);
    } catch (error) {
      console.error('Verification error:', error);
      setNft(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nftId || !reportForm.name || !reportForm.email || !reportForm.description) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setSubmittingReport(true);
    try {
      await reportsService.submitFakeProductReport({
        nftId: nftId.trim(),
        reporterName: reportForm.name,
        reporterEmail: reportForm.email,
        description: reportForm.description
      });
      alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
      setShowReportForm(false);
      setReportForm({ name: '', email: '', description: '' });
    } catch (error) {
      console.error('Report submission error:', error);
      alert('신고 접수에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            정품 인증 확인
          </h1>
          <p className="text-lg text-slate-600">
            NFT ID를 입력하거나 QR 코드를 스캔하여 정품 여부를 확인하세요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong> "내 인증서" 페이지에서 보이는 <strong>NFT #번호</strong>를 입력하세요.
              (블록 번호가 아닙니다!)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              예시: NFT #1, NFT #693358 → 입력: 1 또는 693358
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={nftId}
                onChange={(e) => setNftId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="NFT ID를 입력하세요 (예: 1, 693358, 359557...)"
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || !nftId.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              <Search className="w-5 h-5" />
              {loading ? '확인 중...' : '확인'}
            </button>
          </div>
        </div>

        {searched && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {nft ? (
              <div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="w-10 h-10" />
                    <div>
                      <h2 className="text-2xl font-bold">정품 인증 완료</h2>
                      <p className="text-green-50">블록체인에 등록된 정품입니다</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex gap-6">
                    {nft.product?.image_url && (
                      <img
                        src={nft.product.image_url}
                        alt={nft.product.name}
                        className="w-48 h-48 object-cover rounded-lg shadow-md"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-4">
                        <Package className="w-6 h-6 text-slate-600 mt-1" />
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            {nft.product?.name}
                          </h3>
                          <p className="text-lg text-slate-600">{nft.product?.brand}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-start gap-2">
                          <Hash className="w-5 h-5 text-slate-500 mt-1" />
                          <div>
                            <p className="text-sm text-slate-500">NFT ID</p>
                            <p className="font-semibold text-slate-900">{nft.nft_id}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar className="w-5 h-5 text-slate-500 mt-1" />
                          <div>
                            <p className="text-sm text-slate-500">발행일</p>
                            <p className="font-semibold text-slate-900">
                              {new Date(nft.minted_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <User className="w-5 h-5 text-slate-500 mt-1" />
                          <div>
                            <p className="text-sm text-slate-500">소유자</p>
                            <p className="font-semibold text-slate-900">
                              {nft.customer?.name || '비공개'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Package className="w-5 h-5 text-slate-500 mt-1" />
                          <div>
                            <p className="text-sm text-slate-500">가격</p>
                            <p className="font-semibold text-slate-900">
                              {nft.product?.price.toLocaleString()}원
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-slate-900 mb-3">블록체인 정보</h4>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 font-mono text-sm">
                      <div>
                        <span className="text-slate-500">트랜잭션: </span>
                        <span className="text-slate-900 break-all">{nft.transaction_hash}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">블록 번호: </span>
                        <span className="text-slate-900">{nft.block_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">소유자 주소: </span>
                        <span className="text-slate-900 break-all">{nft.owner_address}</span>
                      </div>
                    </div>

                    <a
                      href={`https://sepolia.etherscan.io/tx/${nft.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      블록체인에서 확인하기
                    </a>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">
                      <strong>인증 완료:</strong> 이 제품은 블록체인에 등록된 정품입니다.
                      위 정보가 판매자 정보와 일치하는지 확인하세요.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-6">
                  <div className="flex items-center gap-3 text-white">
                    <XCircle className="w-10 h-10" />
                    <div>
                      <h2 className="text-2xl font-bold">정품 인증 실패</h2>
                      <p className="text-red-50">등록되지 않은 제품입니다</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                      <strong>경고:</strong> 이 NFT ID는 시스템에 등록되어 있지 않습니다.
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">가능한 원인:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      <li>잘못된 NFT ID를 입력했습니다</li>
                      <li>위조 제품일 수 있습니다</li>
                      <li>아직 NFT가 발행되지 않은 제품입니다</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-3">
                      구매처에 문의하거나 위조품 의심 시 신고해주세요.
                    </p>
                    <button
                      onClick={() => setShowReportForm(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      위조품 신고하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowReportForm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-2xl font-bold text-slate-900">위조품 신고</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  위조품 의심 제품을 신고해주시면 검토 후 조치하겠습니다.
                </p>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    NFT ID
                  </label>
                  <input
                    type="text"
                    value={nftId}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reportForm.name}
                    onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={reportForm.email}
                    onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    상세 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="위조품으로 의심되는 이유를 자세히 작성해주세요..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-red-400 transition-colors"
                >
                  {submittingReport ? '신고 접수 중...' : '신고 접수하기'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-xl shadow-lg p-8 max-w-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              QR 코드로 확인하는 방법
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <p className="text-sm text-slate-600">
                  제품에 부착된 QR 코드를 스마트폰 카메라로 스캔하세요
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <p className="text-sm text-slate-600">
                  자동으로 이 페이지로 이동하여 정품 여부를 확인합니다
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <p className="text-sm text-slate-600">
                  소유자 정보가 판매자 정보와 일치하는지 확인하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
