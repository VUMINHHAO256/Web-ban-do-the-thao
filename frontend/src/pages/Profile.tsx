import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, Mail, Calendar, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items?: { name: string; quantity: number; price: number }[];
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:   { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Đã nhận',      color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Đã huỷ',       color: 'bg-red-100 text-red-700' },
};

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        setOrders(res.data?.data || res.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-dark font-semibold">Tài khoản của tôi</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-bold text-dark">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                Quản trị viên
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 mt-4 space-y-1">
            <button
              onClick={() => setTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${tab === 'profile' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" /> Hồ sơ cá nhân
            </button>
            <button
              onClick={() => setTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${tab === 'orders' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="w-4 h-4" /> Đơn hàng của tôi
              {orders.length > 0 && (
                <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </button>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ⚙️ Trang quản trị
              </Link>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-dark mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Thông tin tài khoản
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                    <p className="font-semibold text-dark">{user.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                    <p className="font-semibold text-dark break-all">{user.email}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                  <p className="font-semibold text-dark capitalize">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-400 italic">Tính năng chỉnh sửa thông tin sẽ sớm được cập nhật.</p>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-dark mb-5 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Đơn hàng của tôi
              </h2>

              {loadingOrders ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">Chưa có đơn hàng nào</p>
                  <Link to="/products" className="mt-4 inline-block btn-primary text-sm">Mua sắm ngay</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
                    return (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-dark">Đơn #{order.id}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <span className="text-primary font-bold">{formatCurrency(order.total_price)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-600 space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name} × {item.quantity}</span>
                                <span>{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
