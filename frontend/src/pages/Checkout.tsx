import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Loader, MapPin, Phone, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const Checkout: React.FC = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  const shipping = totalPrice >= 2_000_000 ? 0 : 30_000;
  const total = totalPrice + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Vui lòng nhập họ và tên.'); return; }
    if (!form.phone.trim()) { setError('Vui lòng nhập số điện thoại.'); return; }
    if (!form.address.trim()) { setError('Vui lòng nhập địa chỉ giao hàng.'); return; }
    if (items.length === 0) { setError('Giỏ hàng của bạn đang trống.'); return; }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        customer_name: form.fullName,
        customer_phone: form.phone,
        shipping_address: form.address,
        note: form.note,
        payment_method: form.paymentMethod,
        total_price: total,
        items: items.map(item => ({
          product_id: Number(item.id),
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      };
      const res = await api.post('/orders', orderPayload);
      const newOrderId = res.data?.id || res.data?.orderId || null;
      setOrderId(newOrderId);
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Thành công ──
  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark mb-2">Đặt hàng thành công! 🎉</h1>
          {orderId && <p className="text-gray-500 text-sm mb-1">Mã đơn hàng: <strong className="text-primary">#{orderId}</strong></p>}
          <p className="text-gray-500 text-sm mb-6">
            Cảm ơn bạn đã mua hàng tại MHShop! Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated && (
              <Link to="/profile" onClick={() => (document as any)._tab = 'orders'} className="btn-primary flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Xem đơn hàng
              </Link>
            )}
            <Link to="/" className="btn-outline flex items-center justify-center gap-2">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Giỏ trống ──
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">Giỏ hàng trống</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/cart" className="hover:text-primary">Giỏ hàng</Link>
        <span className="mx-2">/</span>
        <span className="text-dark font-semibold">Thanh toán</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Form thông tin ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-xl font-bold text-dark mb-5 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Thông tin giao hàng
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Họ và tên *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input name="fullName" type="text" required className="form-input pl-9"
                    placeholder="Nguyễn Văn A" value={form.fullName} onChange={handleChange} />
                </div>
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Số điện thoại *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input name="phone" type="tel" required className="form-input pl-9"
                    placeholder="0912345678" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Địa chỉ giao hàng *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input name="address" type="text" required className="form-input pl-9"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                    value={form.address} onChange={handleChange} />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Ghi chú (tùy chọn)</label>
                <textarea name="note" rows={3} className="form-input resize-none"
                  placeholder="Giao giờ hành chính, không gọi điện..."
                  value={form.note} onChange={handleChange} />
              </div>

              {/* Phương thức thanh toán */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Phương thức thanh toán</label>
                <div className="space-y-2">
                  {[
                    { value: 'cod', label: '💵 Thanh toán khi nhận hàng (COD)' },
                    { value: 'bank', label: '🏦 Chuyển khoản ngân hàng' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input type="radio" name="paymentMethod" value={opt.value}
                        checked={form.paymentMethod === opt.value} onChange={handleChange}
                        className="accent-primary" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link to="/cart" className="flex items-center gap-1 text-gray-500 hover:text-primary text-sm transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
                </Link>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                  {loading
                    ? <><Loader className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                    : <><CheckCircle className="w-4 h-4" /> Đặt hàng ngay</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Tóm tắt đơn hàng ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
            <h3 className="text-base font-bold text-dark mb-4 pb-2 border-b border-gray-100">
              Đơn hàng ({totalItems} sản phẩm)
            </h3>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name}
                      className="w-full h-full object-contain"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-primary flex-shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                  {shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                <span>Tổng cộng</span>
                <span className="text-primary text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Hàng chính hãng 100% • Đổi trả 30 ngày nếu lỗi sản xuất</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
