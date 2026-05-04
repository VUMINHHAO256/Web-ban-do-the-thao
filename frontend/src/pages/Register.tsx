import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, User, Phone, ArrowRight, Loader, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { fullName, email, password, phone });
      setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi đăng ký. Email có thể đã được sử dụng.');
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
          <h2 className="mt-3 text-2xl font-bold text-dark">Tạo tài khoản</h2>
          <p className="mt-1 text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">Đăng nhập ngay</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />{success}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1" htmlFor="reg-name">Họ và tên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="reg-name"
                type="text"
                required
                className="form-input pl-10"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1" htmlFor="reg-email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="reg-email"
                type="email"
                required
                className="form-input pl-10"
                placeholder="nhapemail@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1" htmlFor="reg-phone">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="reg-phone"
                type="tel"
                className="form-input pl-10"
                placeholder="0912345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1" htmlFor="reg-password">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                className="form-input pl-10"
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Đang xử lý...</> : <>Đăng ký <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <Link to="/terms" className="underline hover:text-primary">Điều khoản dịch vụ</Link> của MHShop.
        </p>
      </div>
    </div>
  );
};

export default Register;
