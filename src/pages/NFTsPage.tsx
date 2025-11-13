import { useEffect, useState } from 'react';
import { nftsService } from '../services/nfts';
import { NFTWithDetails } from '../types';
import { Loader2, Award, ExternalLink, QrCode } from 'lucide-react';

export function NFTsPage() {
  const [nfts, setNfts] = useState<NFTWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    try {
      setLoading(true);
      const data = await nftsService.getMyNFTs();
      setNfts(data);
    } catch (err: any) {
      setError(err.message || 'NFT 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">내 정품 인증서</h1>

        {nfts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">보유한 NFT 인증서가 없습니다.</p>
            <p className="text-sm text-slate-500">
              명품을 구매하면 자동으로 NFT 정품 인증서가 발급됩니다.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  {nft.product?.image_url ? (
                    <img
                      src={nft.product.image_url}
                      alt={nft.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Award className="h-3 w-3" />
                      <span>NFT #{nft.nft_id}</span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 mb-1">
                    {nft.product?.brand}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {nft.product?.name}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">발급일</span>
                      <span className="font-medium">
                        {new Date(nft.minted_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">블록 번호</span>
                      <span className="font-medium font-mono text-xs">
                        #{nft.block_number}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-slate-600 mb-1">소유자 주소</div>
                      <div className="font-mono text-xs text-slate-900 break-all">
                        {nft.owner_address}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-slate-600 mb-1">트랜잭션 해시</div>
                      <div className="font-mono text-xs text-slate-900 break-all">
                        {nft.transaction_hash}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <a
                      href={`/verify?nft=${nft.nft_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>정품 인증서 보기</span>
                    </a>
                    <a
                      href={`https://etherscan.io/tx/${nft.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-100 text-slate-900 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2 text-sm"
                    >
                      <span>블록체인에서 확인</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
