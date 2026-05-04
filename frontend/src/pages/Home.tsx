import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, CheckCircle, Truck, Headphones, Shield } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  image_url?: string;
  category_id?: number;
  is_featured?: boolean;
  is_new?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const BANNER_SLIDES = [
  {
    bg: 'from-secondary to-blue-900',
    title: 'Đẳng Cấp Cầu Lông Chuyên Nghiệp',
    sub: 'Vợt Yonex, Victor, Li-Ning chính hãng - Giá tốt nhất thị trường',
    cta: 'Mua vợt ngay',
    link: '/products?category=rackets',
  },
  {
    bg: 'from-primary to-orange-700',
    title: 'Giày Cầu Lông Cao Cấp',
    sub: 'Giày chuyên dụng bảo vệ mắt cá, êm ái, thoáng khí',
    cta: 'Xem giày',
    link: '/products?category=shoes',
  },
  {
    bg: 'from-green-700 to-teal-800',
    title: 'Khuyến Mãi Hấp Dẫn',
    sub: 'Giảm đến 30% cho nhiều sản phẩm — Chỉ trong tuần này!',
    cta: 'Xem ưu đãi',
    link: '/promotions',
  },
];

const CATEGORIES = [
  { name: 'Vợt cầu lông', query: 'rackets', emoji: '🏸' },
  { name: 'Giày cầu lông', query: 'shoes', emoji: '👟' },
  { name: 'Áo cầu lông', query: 'clothing', emoji: '👕' },
  { name: 'Quần cầu lông', query: 'pants', emoji: '🩳' },
  { name: 'Phụ kiện', query: 'accessories', emoji: '🎒' },
];

const BRANDS = ['Yonex', 'Victor', 'Li-Ning', 'VS', 'Babolat', 'Adidas'];

const BENEFITS = [
  { icon: <CheckCircle className="w-8 h-8" />, title: 'Sản Phẩm Chính Hãng', desc: 'Cam kết 100% hàng hiệu chính thức, bảo hành theo nhà sản xuất.' },
  { icon: <Truck className="w-8 h-8" />, title: 'Giao Hàng Nhanh Chóng', desc: 'Miễn phí giao hàng toàn quốc với đơn hàng trên 2 triệu VNĐ.' },
  { icon: <Headphones className="w-8 h-8" />, title: 'Hỗ Trợ 24/7', desc: 'Đội ngũ tư vấn luôn sẵn sàng giúp bạn chọn được vợt phù hợp.' },
  { icon: <Shield className="w-8 h-8" />, title: 'Bảo Hành Uy Tín', desc: 'Chính sách đổi trả trong 30 ngày nếu sản phẩm lỗi từ nhà sản xuất.' },
];

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const wished = isInWishlist(String(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image_url || '',
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      oldPrice: product.old_price,
    });
  };

  return (
    <div className="product-card group">
      <Link to={`/products/${product.id}`}>
        <div className="relative h-48 overflow-hidden bg-gray-50">
          <img
            src={product.image_url || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200?text=No+Image`; }}
          />
          {product.old_price && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{Math.round((1 - product.price / product.old_price) * 100)}%
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-dark line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary font-bold text-base">{formatCurrency(product.price)}</span>
            {product.old_price && (
              <span className="text-gray-400 text-xs line-through">{formatCurrency(product.old_price)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded hover:bg-primary-hover transition-colors flex items-center justify-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" /> Thêm vào giỏ
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`w-8 h-8 border rounded flex items-center justify-center transition-colors ${wished ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-400'}`}
            >
              <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

// ── Home Page ─────────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  // Auto-slide banner
  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % BANNER_SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setSlide(s => (s - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  const nextSlide = () => setSlide(s => (s + 1) % BANNER_SLIDES.length);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const all: Product[] = res.data?.data || res.data || [];
        setFeaturedProducts(all.filter((p: Product) => p.is_featured).slice(0, 8));
        setNewProducts(all.filter((p: Product) => p.is_new).slice(0, 8));
        if (!all.some((p: Product) => p.is_featured)) setFeaturedProducts(all.slice(0, 8));
        if (!all.some((p: Product) => p.is_new)) setNewProducts(all.slice(8, 16));
      } catch {
        // Backend chưa chạy — hiển thị placeholder
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const currentBanner = BANNER_SLIDES[slide];

  return (
    <div>
      {/* ── Banner Slider ── */}
      <section className={`relative bg-gradient-to-r ${currentBanner.bg} text-white overflow-hidden`} style={{ minHeight: 300 }}>
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center relative z-10 animate-fade-in" key={slide}>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow">{currentBanner.title}</h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">{currentBanner.sub}</p>
          <Link to={currentBanner.link} className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg text-base">
            {currentBanner.cta} →
          </Link>
        </div>

        {/* Prev / Next */}
        <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {BANNER_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === slide ? 'bg-white scale-125' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* ── Benefits Bar ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-white rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary mb-2">{b.icon}</div>
              <h3 className="font-bold text-sm text-dark mb-1">{b.title}</h3>
              <p className="text-xs text-gray-500">{b.desc}</p>
            </div>
          ))}
        </section>

        {/* ── Danh mục ── */}
        <section>
          <h2 className="section-title">DANH MỤC SẢN PHẨM</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.query} to={`/products?category=${cat.query}`} className="category-card">
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <span className="font-bold text-sm text-dark">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Sản phẩm nổi bật ── */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title mb-0">SẢN PHẨM NỔI BẬT</h2>
            <Link to="/products" className="text-primary hover:underline text-sm font-semibold">Xem tất cả →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-10 text-center text-gray-400">
              Chưa có sản phẩm nổi bật. Hãy thêm sản phẩm từ trang admin.
            </div>
          )}
        </section>

        {/* ── Sản phẩm mới ── */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title mb-0">SẢN PHẨM MỚI</h2>
            <Link to="/products" className="text-primary hover:underline text-sm font-semibold">Xem tất cả →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-10 text-center text-gray-400">
              Chưa có sản phẩm mới.
            </div>
          )}
        </section>

        {/* ── Thương hiệu ── */}
        <section>
          <h2 className="section-title">THƯƠNG HIỆU</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {BRANDS.map(brand => (
              <Link key={brand} to={`/products?brand=${encodeURIComponent(brand)}`}
                className="bg-white rounded-lg h-20 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all font-bold text-gray-600 text-sm"
              >
                {brand}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
