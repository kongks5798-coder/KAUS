import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsService } from '../services/products';
import { ordersService } from '../services/orders';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Award, ShoppingBag } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const data = await productsService.getById(productId);
      setProduct(data);
    } catch (err: any) {
      setError(err.message || '상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    if (!product || !shippingAddress.trim()) {
      alert('배송지를 입력해주세요.');
      return;
    }

    setPurchasing(true);

    try {
      await ordersService.create({
        product_id: product.id,
        shipping_address: shippingAddress,
      });

      setShowModal(false);
      setShowSuccessMessage(true);

      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (err: any) {
      alert(err.message || '구매에 실패했습니다.');
      setPurchasing(false);
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-600">{error || '상품을 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No Image
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">{product.brand}</div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {product.name}
            </h1>

            {product.requires_nft && (
              <div className="flex items-center space-x-2 text-slate-700 mb-6">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">
                  블록체인 NFT 정품 인증서 포함
                </span>
              </div>
            )}

            <div className="text-3xl font-bold text-slate-900 mb-6">
              ₩{product.price.toLocaleString()}
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="bg-slate-100 rounded-lg p-4 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">재고</span>
                <span className="font-medium text-slate-900">{product.stock}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">정품 인증</span>
                <span className="font-medium text-slate-900">
                  {product.requires_nft ? 'NFT 발급' : '미지원'}
                </span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={product.stock === 0}
              className="w-full bg-slate-900 text-white py-4 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{product.stock === 0 ? '품절' : '구매하기'}</span>
            </button>

            <div className="mt-6 text-sm text-slate-500">
              구매 시 자동으로 블록체인 정품 인증서(NFT)가 발급됩니다.
            </div>
          </div>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">구매 완료!</h2>
            <p className="text-slate-600 mb-4">
              주문이 정상적으로 접수되었습니다.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    NFT 정품 인증서 발급 중
                  </p>
                  <p className="text-xs text-blue-700">
                    블록체인에 NFT를 발급하고 있습니다.
                    일반적으로 1-5초 내에 완료됩니다.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              주문 페이지로 이동합니다...
            </p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">구매 확인</h2>
            <p className="text-slate-600 mb-6">
              {product.name}을(를) 구매하시겠습니까?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                배송지 주소
              </label>
              <textarea
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                rows={3}
                placeholder="배송받으실 주소를 입력해주세요"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>

            <div className="bg-slate-100 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">상품 가격</span>
                <span className="font-medium">₩{product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-300">
                <span>총 금액</span>
                <span>₩{product.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmPurchase}
                disabled={purchasing}
                className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {purchasing ? '처리 중...' : '구매 확정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
