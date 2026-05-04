import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const Wishlist: React.FC = () => {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Heart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Danh sách yêu thích trống</h2>
        <p className="text-gray-400 mb-6">Hãy thêm sản phẩm yêu thích của bạn</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          Khám phá sản phẩm <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-dark font-semibold">Yêu thích</span>
      </nav>

      <h1 className="section-title">SẢN PHẨM YÊU THÍCH ({items.length})</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map(item => (
          <div key={item.id} className="product-card group">
            <Link to={`/products/${item.id}`}>
              <div className="relative h-44 overflow-hidden bg-gray-50">
                <img
                  src={item.image || `https://via.placeholder.com/200x180?text=SP`}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x180?text=SP'; }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-dark line-clamp-2 mb-2 min-h-[40px]">{item.name}</h3>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-primary font-bold text-sm">{formatCurrency(item.price)}</span>
                  {item.oldPrice && (
                    <span className="text-gray-400 text-xs line-through">{formatCurrency(item.oldPrice)}</span>
                  )}
                </div>
              </div>
            </Link>
            <div className="px-3 pb-3 flex gap-2">
              <button
                onClick={() => handleAddToCart(item)}
                className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded hover:bg-primary-hover transition-colors flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-3 h-3" /> Thêm vào giỏ
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 border border-red-300 text-red-400 rounded hover:bg-red-50 flex items-center justify-center transition-colors"
                title="Xóa khỏi yêu thích"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
