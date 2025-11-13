import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Award } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    character: '관우',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const { user } = await authService.signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      });

      if (user) {
        const characterColors: { [key: string]: string } = {
          '관우': '#8B0000',
          '장비': '#000000',
          '조조': '#4169E1',
          '유비': '#228B22',
          '제갈량': '#9370DB',
          '손권': '#FF8C00',
        };

        await authService.saveCharacterSelection(
          user.id,
          formData.character,
          characterColors[formData.character]
        );
      }

      alert('회원가입이 완료되었습니다! 블록체인 지갑 생성 중입니다.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Award className="h-12 w-12 text-slate-900" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">K-AUS 회원가입</h1>
        <p className="text-slate-600 text-center mb-8">
          명품 정품 인증 시스템에 가입하세요
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              이름
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              비밀번호 확인
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              메타버스 캐릭터 선택
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: '관우', color: '#8B0000', icon: '⚔️' },
                { name: '장비', color: '#000000', icon: '🗡️' },
                { name: '조조', color: '#4169E1', icon: '👑' },
                { name: '유비', color: '#228B22', icon: '🛡️' },
                { name: '제갈량', color: '#9370DB', icon: '📜' },
                { name: '손권', color: '#FF8C00', icon: '🏹' },
              ].map((char) => (
                <button
                  key={char.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, character: char.name })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.character === char.name
                      ? 'border-slate-900 bg-slate-100 shadow-md'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="text-3xl mb-1">{char.icon}</div>
                  <div className="text-sm font-medium text-slate-800">{char.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-600">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-slate-900 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
