import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Package, LogOut, Mail, Calendar, Loader,
  Edit2, Save, X, Lock, MapPin, Phone, CheckCircle, Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// ── Types ────────────────────────────────────────────────────────────
interface Order {
  id: number;
  totalAmount: number;   // DB column name
  status: string;
  createdAt: string;     // DB column name
  items?: { productName?: string; name?: string; quantity: number; price: number }[];
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const formatDate = (raw: string | null | undefined) => {
  if (!raw) return '—';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Đang xử lý',   color: 'bg-blue-100 text-blue-600'   },
  confirmed:  { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700'   },
  shipping:   { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Đã nhận',      color: 'bg-green-100 text-green-700' },
  completed:  { label: 'Hoàn thành',   color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Đã huỷ',       color: 'bg-red-100 text-red-700'     },
};

// ── Profile Component ─────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState<'profile' | 'orders' | 'address' | 'password'>('profile');

  // ── Profile edit state ──
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', phone: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Address state ──
  const [addressForm, setAddressForm] = useState({ address: '' });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Password state ──
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Auth guard: chờ hydration xong mới redirect ──
  useEffect(() => {
    if (!isLoading && !isAuthenticated) { navigate('/login'); }
  }, [isLoading, isAuthenticated, navigate]);

  // ── Fetch orders ──
  useEffect(() => {
    const fetch = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get('/orders/my');
        const raw = res.data?.data || res.data || [];
        setOrders(raw);
      } catch { setOrders([]); }
      finally { setLoadingOrders(false); }
    };
    if (isAuthenticated) fetch();
  }, [isAuthenticated]);

  // ── Fetch latest profile (phone, address) on mount ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        const u = res.data;
        const name = (u.firstName || '') + (u.lastName ? ' ' + u.lastName : '');
        updateUser({ phone: u.phone || '', address: u.address || '', name: name.trim() || user?.name || '' });
        setAddressForm({ address: u.address || '' });
        setProfileForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });
      } catch { /* use stored values */ }
    };
    if (isAuthenticated) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
  if (!user) return null;

  // ── Handlers ──
  const handleProfileSave = async () => {
    setProfileLoading(true); setProfileMsg(null);
    try {
      await api.put('/users/profile', profileForm);
      const fullName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ');
      updateUser({ name: fullName, phone: profileForm.phone });
      setProfileMsg({ type: 'ok', text: 'Cập nhật thông tin thành công!' });
      setEditMode(false);
    } catch (e: any) {
      setProfileMsg({ type: 'err', text: e.response?.data?.message || 'Cập nhật thất bại.' });
    } finally { setProfileLoading(false); }
  };

  const handleAddressSave = async () => {
    setAddressLoading(true); setAddressMsg(null);
    try {
      await api.put('/users/profile', {
        firstName: profileForm.firstName || user.name,
        lastName:  profileForm.lastName  || '',
        phone:     profileForm.phone     || user.phone || '',
        address:   addressForm.address,
      });
      updateUser({ address: addressForm.address });
      setAddressMsg({ type: 'ok', text: 'Đã lưu địa chỉ thành công!' });
    } catch (e: any) {
      setAddressMsg({ type: 'err', text: e.response?.data?.message || 'Lưu địa chỉ thất bại.' });
    } finally { setAddressLoading(false); }
  };

  const handlePwChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'err', text: 'Mật khẩu mới không khớp.' }); return;
    }
    setPwLoading(true); setPwMsg(null);
    try {
      await api.put('/users/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'ok', text: 'Đổi mật khẩu thành công!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      setPwMsg({ type: 'err', text: e.response?.data?.message || 'Đổi mật khẩu thất bại.' });
    } finally { setPwLoading(false); }
  };

  // ── Sidebar nav items ──
  const navItems = [
    { key: 'profile',  icon: <User className="w-4 h-4" />,    label: 'Hồ sơ cá nhân' },
    { key: 'address',  icon: <MapPin className="w-4 h-4" />,  label: 'Địa chỉ giao hàng' },
    { key: 'orders',   icon: <Package className="w-4 h-4" />, label: 'Đơn hàng của tôi', badge: orders.length },
    { key: 'password', icon: <Lock className="w-4 h-4" />,    label: 'Đổi mật khẩu' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-dark font-semibold">Tài khoản của tôi</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ── Sidebar ── */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-bold text-dark">{user.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                Quản trị viên
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 mt-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                  ${tab === item.key ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {item.icon} {item.label}
                {'badge' in item && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            {user.role === 'admin' && (
              <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" /> Trang quản trị
              </Link>
            )}
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="md:col-span-3 space-y-4">

          {/* ══ Profile Tab ══ */}
          {tab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Thông tin tài khoản
                </h2>
                {!editMode ? (
                  <button onClick={() => { setEditMode(true); setProfileMsg(null); }}
                    className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                ) : (
                  <button onClick={() => setEditMode(false)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-dark">
                    <X className="w-4 h-4" /> Huỷ
                  </button>
                )}
              </div>

              {profileMsg && (
                <div className={`rounded-lg p-3 text-sm mb-4 ${profileMsg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {profileMsg.text}
                </div>
              )}

              {!editMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                      <p className="font-semibold text-dark">{user.name || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                      <p className="font-semibold text-dark break-all">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Số điện thoại</p>
                      <p className="font-semibold text-dark">{user.phone || <span className="text-gray-400 font-normal text-sm">Chưa cập nhật</span>}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                      <p className="font-semibold text-dark">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-1">Họ *</label>
                      <input className="form-input" placeholder="Nguyễn" value={profileForm.firstName}
                        onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-1">Tên *</label>
                      <input className="form-input" placeholder="Văn A" value={profileForm.lastName}
                        onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Số điện thoại
                    </label>
                    <input className="form-input" placeholder="0912 345 678" value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="pt-2">
                    <button onClick={handleProfileSave} disabled={profileLoading}
                      className="btn-primary flex items-center gap-2 disabled:opacity-60">
                      {profileLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ Address Tab ══ */}
          {tab === 'address' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-dark mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Địa chỉ giao hàng
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Địa chỉ này sẽ được tự động điền khi bạn đặt hàng.
              </p>

              {addressMsg && (
                <div className={`rounded-lg p-3 text-sm mb-4 ${addressMsg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {addressMsg.type === 'ok' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                  {addressMsg.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Địa chỉ giao hàng *</label>
                  <textarea
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={addressForm.address}
                    onChange={e => setAddressForm({ address: e.target.value })}
                  />
                </div>
                <button onClick={handleAddressSave} disabled={addressLoading || !addressForm.address.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {addressLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu địa chỉ
                </button>
              </div>

              {user.address && (
                <div className="mt-6 p-4 bg-primary-light border border-primary/20 rounded-lg">
                  <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Địa chỉ đã lưu
                  </p>
                  <p className="text-sm text-dark">{user.address}</p>
                </div>
              )}
            </div>
          )}

          {/* ══ Orders Tab ══ */}
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
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-dark">Đơn #{order.id}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <span className="text-primary font-bold text-base">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-gray-100 pt-3 space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                {/* Ảnh sản phẩm */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                  {item.productImage ? (
                                    <img
                                      src={item.productImage.startsWith('http') ? item.productImage : `/assets/${item.productImage}`}
                                      alt={item.productName || item.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).src = '/assets/axforce90.jpg'; }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                {/* Thông tin */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-dark truncate">
                                    {item.productName || item.name || 'Sản phẩm'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Số lượng: <span className="font-medium">× {item.quantity}</span>
                                  </p>
                                </div>
                                {/* Giá */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-bold text-primary">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatCurrency(item.price)} / cái
                                  </p>
                                </div>
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

          {/* ══ Password Tab ══ */}
          {tab === 'password' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-dark mb-5 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Đổi mật khẩu
              </h2>

              {pwMsg && (
                <div className={`rounded-lg p-3 text-sm mb-4 ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {pwMsg.text}
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Mật khẩu hiện tại *</label>
                  <input type="password" className="form-input" placeholder="••••••••"
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Mật khẩu mới * (ít nhất 8 ký tự)</label>
                  <input type="password" className="form-input" placeholder="••••••••"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Xác nhận mật khẩu mới *</label>
                  <input type="password" className="form-input" placeholder="••••••••"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                </div>
                <button onClick={handlePwChange} disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {pwLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
