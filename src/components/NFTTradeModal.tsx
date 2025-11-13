import { useState } from 'react';
import { metaverseService } from '../services/metaverse';
import { NFTWithDetails } from '../types';
import { DollarSign, X } from 'lucide-react';

interface NFTTradeModalProps {
  nft: NFTWithDetails;
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NFTTradeModal({
  nft,
  customerId,
  onClose,
  onSuccess,
}: NFTTradeModalProps) {
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('올바른 가격을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await metaverseService.createNFTTrade(nft.nft_id, customerId, priceNum);
      alert('거래 제안이 등록되었습니다!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create trade:', error);
      alert('거래 제안 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-900 to-red-800 text-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <DollarSign size={24} />
            NFT 거래 등록
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-yellow-300 mb-2">NFT 정보</h3>
          <div className="space-y-1 text-sm text-amber-100">
            <p>제품: {nft.product?.name}</p>
            <p>브랜드: {nft.product?.brand}</p>
            <p>NFT ID: {nft.nft_id.slice(0, 16)}...</p>
          </div>
        </div>

        <form onSubmit={handleCreateTrade} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">
              판매 희망 가격 (₩)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="예: 5000000"
              min="0"
              step="1000"
              required
              className="w-full bg-black/30 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-yellow-600"
            />
            <p className="text-xs text-amber-300 mt-1">
              다른 사용자가 이 가격에 구매할 수 있습니다
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition font-bold"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 text-red-900 py-2 rounded-lg hover:bg-yellow-400 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '등록 중...' : '거래 등록'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-amber-900/30 rounded-lg border border-amber-600">
          <p className="text-xs text-amber-200">
            💡 거래가 등록되면 메타버스에 접속한 다른 사용자들이 구매 제안을 할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
