import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  image_url?: string;
  description?: string;
  brand?: string;
  category_id?: number;
  stock?: number;
  is_featured?: boolean;
  is_new?: boolean;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const p: Product = res.data?.data || res.data;
        setProduct(p);
        // Related products
        const allRes = await api.get('/products');
        const all: Product[] = allRes.data?.data || allRes.data || [];
        setRelated(all.filter(r => r.id !== p.id).slice(0, 4));
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({ id: String(product.id), name: product.name, price: product.price, image: product.image_url || '' });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 animate-pulse rounded-lg h-96" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded h-6" style={{ width: `${85 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="btn-primary">Quay lại danh sách</Link>
      </div>
    );
  }

  const wished = isInWishlist(String(product.id));
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary">Sản phẩm</Link>
        <span>/</span>
        <span className="text-dark font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Image */}
          <div className="relative">
            {discount > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded z-10">
                -{discount}%
              </span>
            )}
            <div className="bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 380 }}>
              <img
                src={product.image_url || `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="max-h-96 w-full object-contain"
                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x400?text=No+Image'; }}
              />
            </div>
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <span className="inline-block bg-secondary-light text-secondary text-xs font-bold px-3 py-1 rounded-full mb-3">
                {product.brand}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-dark mb-3 leading-tight">{product.name}</h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              <span className="text-sm text-gray-500">(5.0) • 12 đánh giá</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="text-3xl font-extrabold text-primary">{formatCurrency(product.price)}</span>
              {product.old_price && (
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.old_price)}</span>
              )}
              {discount > 0 && (
                <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold">Tiết kiệm {formatCurrency(product.old_price! - product.price)}</span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-semibold">
                {product.stock !== undefined && product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Còn hàng'}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-semibold text-dark">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-bold border-x border-gray-300 min-w-[48px] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all shadow-sm ${added ? 'bg-green-500' : 'bg-primary hover:bg-primary-hover'}`}
              >
                {added ? <><CheckCircle className="w-5 h-5" /> Đã thêm!</> : <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ hàng</>}
              </button>
              <button
                onClick={() => toggleItem({ id: String(product.id), name: product.name, price: product.price, image: product.image_url || '' })}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold border-2 transition-colors ${wished ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-400'}`}
              >
                <Heart className="w-5 h-5" fill={wished ? 'currentColor' : 'none'} />
                {wished ? 'Đã thích' : 'Yêu thích'}
              </button>
            </div>

            {/* Benefits */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Hàng chính hãng 100%</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Miễn phí ship đơn trên 2 triệu</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Đổi trả trong 30 ngày</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-xl font-bold text-dark mb-3">Mô tả sản phẩm</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title">SẢN PHẨM LIÊN QUAN</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="product-card group block">
                <div className="h-36 bg-gray-50 overflow-hidden">
                  <img
                    src={p.image_url || `https://via.placeholder.com/200x150?text=${encodeURIComponent(p.name)}`}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-dark line-clamp-2 mb-1">{p.name}</h3>
                  <span className="text-primary font-bold text-sm">{formatCurrency(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
