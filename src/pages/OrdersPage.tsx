import { useEffect, useState } from 'react';
import { ordersService } from '../services/orders';
import { OrderWithDetails } from '../types';
import { Loader2, Package, CheckCircle, Clock } from 'lucide-react';

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || '주문 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'cancelled':
        return <Package className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'pending':
        return 'NFT 발급 중';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">주문 내역</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">주문 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start space-x-4">
                  {order.product?.image_url && (
                    <img
                      src={order.product.image_url}
                      alt={order.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">
                          {order.product?.brand}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {order.product?.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-medium text-sm">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-slate-600">주문 금액: </span>
                        <span className="font-medium">
                          ₩{order.total_price.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">주문일: </span>
                        <span className="font-medium">
                          {new Date(order.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    {order.shipping_address && (
                      <div className="text-sm text-slate-600">
                        배송지: {order.shipping_address}
                      </div>
                    )}

                    {order.status === 'pending' && (
                      <div className="mt-3 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        블록체인 NFT 정품 인증서를 발급 중입니다. 잠시만 기다려주세요.
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="mt-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        NFT 정품 인증서가 발급되었습니다. 마이페이지에서 확인하세요.
                      </div>
                    )}
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
