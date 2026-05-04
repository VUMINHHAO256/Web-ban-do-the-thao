import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const Cart: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-400 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" /> Mua sắm ngay
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-dark font-semibold">Giỏ hàng</span>
      </nav>

      <h1 className="section-title">GIỎ HÀNG ({totalItems} sản phẩm)</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Thành tiền</div>
            </div>

            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-4 md:px-6 py-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
                {/* Image + Name */}
                <div className="col-span-12 md:col-span-6 flex items-center gap-3">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={item.image || `https://via.placeholder.com/80?text=SP`}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=SP'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.id}`} className="text-sm font-semibold text-dark hover:text-primary line-clamp-2">{item.name}</Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mt-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="col-span-4 md:col-span-2 text-center">
                  <span className="text-sm text-primary font-semibold">{formatCurrency(item.price)}</span>
                </div>

                {/* Quantity */}
                <div className="col-span-4 md:col-span-2 flex justify-center">
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1 text-sm font-bold border-x border-gray-300 min-w-[36px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-4 md:col-span-2 text-right">
                  <span className="font-bold text-primary">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}

            {/* Clear */}
            <div className="px-6 py-3 flex justify-end">
              <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                <Trash2 className="w-4 h-4" /> Xóa tất cả
              </button>
            </div>
          </div>

          <div className="mt-4">
            <Link to="/products" className="text-primary hover:underline text-sm flex items-center gap-1">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
            <h3 className="text-lg font-bold text-dark mb-4 pb-2 border-b border-gray-100">Tóm tắt đơn hàng</h3>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({totalItems} sản phẩm)</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-semibold">
                  {totalPrice >= 2000000 ? 'Miễn phí' : formatCurrency(30000)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mb-5">
              <div className="flex justify-between font-bold text-base">
                <span>Tổng cộng</span>
                <span className="text-primary text-xl">
                  {formatCurrency(totalPrice + (totalPrice >= 2000000 ? 0 : 30000))}
                </span>
              </div>
              {totalPrice < 2000000 && (
                <p className="text-xs text-gray-400 mt-1">
                  Mua thêm {formatCurrency(2000000 - totalPrice)} để được miễn phí ship
                </p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Thanh toán <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-3 text-center text-xs text-gray-400">
              🔒 Thanh toán an toàn & bảo mật
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
