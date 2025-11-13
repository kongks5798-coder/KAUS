import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Award, ShieldCheck, Lock, Vote, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-slate-900" />
            <span className="text-xl font-bold text-slate-900">K-AUS</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/products"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              상품
            </Link>
            <Link
              to="/verify"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center space-x-1"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>정품 인증</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/orders"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center space-x-1"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>주문 내역</span>
                </Link>
                <Link
                  to="/my-nfts"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center space-x-1"
                >
                  <Award className="h-5 w-5" />
                  <span>내 인증서</span>
                </Link>
                <Link
                  to="/staking"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center space-x-1"
                >
                  <Lock className="h-5 w-5" />
                  <span>스테이킹</span>
                </Link>
                <Link
                  to="/governance"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center space-x-1"
                >
                  <Vote className="h-5 w-5" />
                  <span>거버넌스</span>
                </Link>
                <Link
                  to="/metaverse"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center space-x-1"
                >
                  <Building2 className="h-5 w-5" />
                  <span>메타버스</span>
                </Link>
                <Link
                  to="/my-page"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
