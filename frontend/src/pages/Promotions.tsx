import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Zap, Clock, Percent, Gift, Copy, Check } from 'lucide-react';
import api from '../services/api';
import ProductCard, { formatCurrency } from '../components/products/ProductCard';
import type { Product } from '../components/products/ProductCard';

// ── Countdown Hook ──────────────────────────────────────────────────
const useCountdown = (targetDate: Date) => {
  const calc = () => {
    const distance = targetDate.getTime() - Date.now();
    if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };
  const [timeLeft, setTimeLeft] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  });
  return timeLeft;
};

// ── Types ─────────────────────────────────────────────────────────────
interface Coupon {
  id?: number;
  code: string;
  discount: string;
  desc: string;
  min: number;
  discountType?: string;
  discountValue?: number;
}

// ── Static fallback coupons (nếu API chưa có dữ liệu) ─────────────────
const STATIC_COUPONS: Coupon[] = [
  { code: 'BADMINTON10', discount: 'Giảm 10%',      desc: 'Áp dụng cho toàn bộ đơn hàng',       min: 500_000 },
  { code: 'YONEX20',     discount: 'Giảm 20%',      desc: 'Chỉ dành cho sản phẩm Yonex',         min: 1_000_000 },
  { code: 'FREESHIP',    discount: 'Miễn phí ship',  desc: 'Miễn phí vận chuyển toàn quốc',       min: 300_000 },
  { code: 'NEWUSER15',   discount: 'Giảm 15%',      desc: 'Ưu đãi dành cho khách hàng mới',      min: 200_000 },
];

const SALE_CATS = [
  { label: 'Vợt Giảm Giá',  icon: '🏸', link: '/rackets',     colorClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { label: 'Giày Sale',     icon: '👟', link: '/shoes',       colorClass: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { label: 'Quần Áo Giảm', icon: '👕', link: '/clothing',    colorClass: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { label: 'Phụ Kiện KM',  icon: '🎒', link: '/accessories', colorClass: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
];

const TIERS = [
  { label: 'Đơn trên 2 triệu',  reward: '−5%',  color: 'text-blue-600' },
  { label: 'Đơn trên 5 triệu',  reward: '−10%', color: 'text-orange-600' },
  { label: 'Đơn trên 10 triệu', reward: '−15%', color: 'text-red-600' },
];

// ── TimeBox ──────────────────────────────────────────────────────────
const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white text-primary rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-extrabold shadow-lg tabular-nums">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-white/75 text-xs mt-1 font-medium">{label}</span>
  </div>
);

// ── Coupon Skeleton ───────────────────────────────────────────────────
const CouponSkeleton = () => (
  <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-5 animate-pulse">
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="flex-shrink-0 space-y-2">
        <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────
const Promotions: React.FC = () => {
  const [targetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setHours(23, 59, 59, 0);
    return d;
  });
  const timeLeft = useCountdown(targetDate);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch mã giảm giá từ API
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/promotions');
        const data: Coupon[] = (res.data?.data || res.data || []).map((p: any) => ({
          id:            p.id,
          code:          p.code,
          discount:      p.discount,
          desc:          p.desc || p.description || '',
          min:           p.min || p.minOrderAmount || 0,
          discountType:  p.discountType,
          discountValue: p.discountValue,
        }));
        setCoupons(data.length > 0 ? data : STATIC_COUPONS);
      } catch {
        setCoupons(STATIC_COUPONS);
      } finally {
        setLoadingCoupons(false);
      }
    })();
  }, []);

  // Fetch sản phẩm
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/products');
        const all: Product[] = res.data?.data || res.data || [];
        setAllProducts(all);
        const sale = all
          .filter((p) => p.old_price && p.old_price > p.price)
          .sort((a, b) => {
            const dA = a.old_price ? (1 - a.price / a.old_price) : 0;
            const dB = b.old_price ? (1 - b.price / b.old_price) : 0;
            return dB - dA;
          });
        setSaleProducts(sale);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div>
      {/* ── Hero with Countdown ───────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full mb-4 text-sm font-bold tracking-wide">
            <Zap className="w-4 h-4" /> FLASH SALE ĐẶC BIỆT
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-1 drop-shadow">KHUYẾN MÃI LỚN</h1>
          <p className="text-2xl font-extrabold text-yellow-200 mb-2">GIẢM ĐẾN 50%</p>
          <p className="text-white/80 mb-8 text-base">Ưu đãi chưa từng có — Nhanh tay kẻo lỡ!</p>

          {/* Countdown */}
          <div>
            <p className="text-sm text-white/70 mb-4 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" /> Kết thúc sau:
            </p>
            <div className="flex justify-center gap-3 md:gap-5">
              <TimeBox value={timeLeft.days}    label="Ngày" />
              <span className="text-white text-2xl font-extrabold self-center mb-5">:</span>
              <TimeBox value={timeLeft.hours}   label="Giờ" />
              <span className="text-white text-2xl font-extrabold self-center mb-5">:</span>
              <TimeBox value={timeLeft.minutes} label="Phút" />
              <span className="text-white text-2xl font-extrabold self-center mb-5">:</span>
              <TimeBox value={timeLeft.seconds} label="Giây" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-dark font-semibold">Khuyến mãi</span>
        </nav>

        {/* ── Sale Categories ───────────────────────────────────────── */}
        <section>
          <h2 className="section-title">DANH MỤC ĐANG GIẢM GIÁ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SALE_CATS.map((cat) => (
              <Link
                key={cat.label}
                to={cat.link}
                className={`${cat.colorClass} rounded-xl p-6 text-center font-bold transition-colors block`}
              >
                <div className="text-4xl mb-2">{cat.icon}</div>
                <div className="text-sm">{cat.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Coupon Codes ─────────────────────────────────────────── */}
        <section>
          <h2 className="section-title flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> MÃ GIẢM GIÁ ĐỘC QUYỀN
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loadingCoupons
              ? Array.from({ length: 4 }).map((_, i) => <CouponSkeleton key={i} />)
              : coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="bg-white border-2 border-dashed border-primary rounded-xl p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Percent className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-extrabold text-lg text-primary">{coupon.discount}</span>
                    </div>
                    <p className="text-sm text-dark font-semibold truncate">{coupon.desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Đơn tối thiểu: {formatCurrency(coupon.min)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="bg-orange-50 border border-primary/30 rounded-lg px-3 py-1.5 font-bold text-primary text-sm tracking-wider mb-2">
                      {coupon.code}
                    </div>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors ml-auto"
                    >
                      {copiedCode === coupon.code ? (
                        <><Check className="w-3 h-3 text-green-500" /><span className="text-green-500">Đã sao chép</span></>
                      ) : (
                        <><Copy className="w-3 h-3" /> Sao chép</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ── Tiered Discount Banner ───────────────────────────────── */}
        <section className="bg-gradient-to-r from-secondary to-blue-600 text-white rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold mb-1">💸 Mua Nhiều Giảm Sâu!</h2>
            <p className="text-white/80 text-sm">Giảm thêm theo tổng giá trị đơn hàng</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <div key={tier.label} className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-yellow-300">{tier.reward}</p>
                <p className="text-white/80 text-sm mt-1">{tier.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              to="/products"
              className="bg-white text-secondary font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors inline-block text-sm"
            >
              Mua sắm ngay →
            </Link>
          </div>
        </section>

        {/* ── Sale Products ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">🔥 SẢN PHẨM ĐANG GIẢM GIÁ</h2>
            <Link to="/products" className="text-primary hover:underline text-sm font-semibold">
              Xem tất cả →
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-72 animate-pulse" />
              ))}
            </div>
          ) : saleProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {saleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : allProducts.length > 0 ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Hiện chưa có sản phẩm giảm giá. Đây là một số sản phẩm nổi bật:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {allProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm">
              <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-500">Chưa có sản phẩm khuyến mãi</p>
              <p className="text-sm text-gray-400 mt-1">Hãy quay lại sau để xem các ưu đãi mới nhất!</p>
              <Link to="/products" className="btn-primary mt-4 inline-block text-sm">
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Promotions;
