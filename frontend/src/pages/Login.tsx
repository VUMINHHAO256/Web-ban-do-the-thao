import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-12 px-4 bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 animate-slide-up">

        {/* Header */}
        <div className="text-center mb-7">
          <Link to="/" className="text-3xl font-extrabold text-primary">MHShop</Link>
          <h2 className="mt-3 text-2xl font-bold text-dark">Đăng nhập</h2>
          <p className="mt-1 text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">Đăng ký ngay</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1" htmlFor="login-email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                className="form-input pl-10"
                placeholder="nhapemail@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1" htmlFor="login-password">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                className="form-input pl-10"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary w-4 h-4" id="remember-me" />
              <span className="text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline font-medium">Quên mật khẩu?</Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Đang xử lý...</> : <>Đăng nhập <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <Link to="/terms" className="underline hover:text-primary">Điều khoản dịch vụ</Link> của MHShop.
        </p>
      </div>
    </div>
  );
};

export default Login;
