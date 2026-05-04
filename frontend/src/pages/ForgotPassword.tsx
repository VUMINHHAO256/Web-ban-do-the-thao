import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage('Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn (kể cả thư mục spam).');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-12 px-4 bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-dark">Quên mật khẩu?</h1>
          <p className="text-gray-500 text-sm mt-2">
            Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-5">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 text-sm font-medium">{message}</p>
            </div>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm text-center">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-dark mb-1" htmlFor="forgot-email">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  className="form-input pl-10"
                  placeholder="nhapemail@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {status === 'loading' ? (
                <><Loader className="w-4 h-4 animate-spin" /> Đang gửi...</>
              ) : (
                'Gửi link khôi phục'
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
