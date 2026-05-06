import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronRight, Search, Mail } from 'lucide-react';
import api from '../services/api';

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image?: string;
  emoji?: string;
  bgColor?: string;
  readTime: number;
  isHot?: boolean;
}

// ── Ánh xạ slug → ảnh assets ────────────────────────────────────────
const SLUG_IMAGE_MAP: Record<string, string> = {
  'cach-chon-vot-cau-long-phu-hop':      '/assets/axforce90.jpg',
  'top-5-giay-yonex-2026':               '/assets/Giay65z3.jpg',
  'ky-thuat-co-ban-cho-nguoi-moi':       '/assets/new2.jpg',
  'bao-quan-vot-dung-cach':              '/assets/duora10.jpg',
  'loi-ich-choi-cau-long-buoi-sang':     '/assets/giaidau.jpg',
  'chon-cuoc-vot-phu-hop':               '/assets/news3.jpg',
  'giai-cau-long-viet-nam-2026':         '/assets/news4.jpg',
  'victor-thruster-k-pro-2026':          '/assets/news5.jpg',
  'su-khac-biet-giua-cac-thuong-hieu':   '/assets/news6.jpg',
};

// Fallback images tuần hoàn cho bài viết API không có ảnh
const FALLBACK_IMAGES = [
  '/assets/axforce90.jpg',
  '/assets/GiayAce.jpg',
  '/assets/aovictor1.jpg',
  '/assets/tuivictor1.jpg',
  '/assets/duora10.jpg',
  '/assets/ryuga.jpg',
  '/assets/jetspeed12.jpg',
  '/assets/waveclaw3.jpg',
  '/assets/LiningAYT.jpg',
  '/assets/fortius50.jpg',
  '/assets/new2.jpg',
  '/assets/news3.jpg',
  '/assets/news4.jpg',
  '/assets/news5.jpg',
  '/assets/news6.jpg',
  '/assets/giaidau.jpg',
];

/** Lấy ảnh cho bài viết: ưu tiên image → slug map → fallback theo index */
const getArticleImage = (article: Article, index: number): string => {
  if (article.image && !article.image.includes('placeholder')) return article.image;
  if (SLUG_IMAGE_MAP[article.slug]) return SLUG_IMAGE_MAP[article.slug];
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
};

// ── Dữ liệu tĩnh fallback ────────────────────────────────────────────
const STATIC_ARTICLES: Article[] = [
  {
    id: 1, slug: 'cach-chon-vot-cau-long-phu-hop',
    title: 'Hướng Dẫn Chọn Vợt Cầu Lông Phù Hợp Với Trình Độ',
    excerpt: 'Việc chọn vợt cầu lông không chỉ dựa vào thương hiệu mà còn phụ thuộc vào trình độ, phong cách chơi và ngân sách. Bài viết này giúp bạn tìm được chiếc vợt ưng ý nhất.',
    category: 'Hướng dẫn', author: 'MHShop Expert', date: '15/04/2026',
    readTime: 5, isHot: true,
  },
  {
    id: 2, slug: 'top-5-giay-yonex-2026',
    title: 'Top 5 Giày Cầu Lông Yonex Được Ưa Chuộng Nhất Năm 2026',
    excerpt: 'Yonex vẫn là thương hiệu giày cầu lông đỉnh cao. Cùng điểm qua 5 mẫu giày được vận động viên chuyên nghiệp và người chơi phong trào yêu thích nhất năm 2026.',
    category: 'Review sản phẩm', author: 'Admin MHShop', date: '12/04/2026',
    readTime: 7,
  },
  {
    id: 3, slug: 'ky-thuat-co-ban-cho-nguoi-moi',
    title: 'Kỹ Thuật Đánh Cầu Lông Cơ Bản Cho Người Mới Bắt Đầu',
    excerpt: 'Bạn mới bắt đầu chơi cầu lông và không biết bắt đầu từ đâu? Phần hướng dẫn này đưa bạn qua từng bước: cầm vợt, di chuyển và đánh cầu cơ bản.',
    category: 'Kỹ thuật', author: 'Coach Minh', date: '10/04/2026',
    readTime: 8,
  },
  {
    id: 4, slug: 'bao-quan-vot-dung-cach',
    title: 'Cách Bảo Quản Vợt Cầu Lông Đúng Cách Để Dùng Bền Lâu',
    excerpt: 'Vợt cầu lông cần được bảo quản cẩn thận để giữ hiệu suất tốt nhất. Những lưu ý về lưu trữ, vệ sinh và bảo dưỡng giúp vợt của bạn luôn trong trạng thái tối ưu.',
    category: 'Mẹo hay', author: 'MHShop Expert', date: '08/04/2026',
    readTime: 4,
  },
  {
    id: 5, slug: 'loi-ich-choi-cau-long-buoi-sang',
    title: 'Tại Sao Nên Chơi Cầu Lông Buổi Sáng? Lợi Ích Bất Ngờ!',
    excerpt: 'Chơi cầu lông buổi sáng không chỉ tốt cho sức khỏe thể chất mà còn cải thiện tinh thần, độ tập trung và năng suất làm việc.',
    category: 'Sức khỏe', author: 'BS. Sport', date: '05/04/2026',
    readTime: 6,
  },
  {
    id: 6, slug: 'chon-cuoc-vot-phu-hop',
    title: 'Cách Chọn Cước Vợt Phù Hợp Với Phong Cách Chơi Của Bạn',
    excerpt: 'Cước vợt ảnh hưởng lớn đến hiệu suất chơi cầu lông. Từ độ căng, vật liệu đến thương hiệu — tất cả đều cần cân nhắc kỹ trước khi đan lại vợt.',
    category: 'Hướng dẫn', author: 'Admin MHShop', date: '02/04/2026',
    readTime: 5,
  },
  {
    id: 7, slug: 'giai-cau-long-viet-nam-2026',
    title: 'Giải Cầu Lông Vô Địch Quốc Gia 2026 — Kết Quả & Highlights',
    excerpt: 'Giải Cầu Lông Vô Địch Quốc Gia 2026 vừa khép lại với nhiều bất ngờ thú vị. Điểm lại những trận đấu đáng nhớ nhất và gương mặt vô địch mới.',
    category: 'Tin thể thao', author: 'Sport Reporter', date: '01/04/2026',
    readTime: 6, isHot: true,
  },
  {
    id: 8, slug: 'victor-thruster-k-pro-2026',
    title: 'Victor Ra Mắt Vợt Thruster K Pro 2026 — Đột Phá Công Nghệ!',
    excerpt: 'Victor vừa giới thiệu dòng vợt Thruster K Pro 2026 với công nghệ carbon nano tiên tiến nhất. Chiếc vợt mới hứa hẹn smash mạnh mẽ và kiểm soát hoàn hảo.',
    category: 'Tin sản phẩm', author: 'MHShop Expert', date: '28/03/2026',
    readTime: 4,
  },
  {
    id: 9, slug: 'su-khac-biet-giua-cac-thuong-hieu',
    title: 'Yonex vs Victor vs Li-Ning: Chọn Thương Hiệu Nào Cho Bạn?',
    excerpt: 'Ba thương hiệu cầu lông hàng đầu châu Á với công nghệ và triết lý thiết kế khác nhau. Phân tích chi tiết ưu nhược điểm để bạn đưa ra lựa chọn phù hợp nhất.',
    category: 'So sánh', author: 'MHShop Expert', date: '25/03/2026',
    readTime: 9,
  },
];

// ── Article Card ─────────────────────────────────────────────────────
const ArticleCard: React.FC<{ article: Article; index: number; featured?: boolean }> = ({ article, index, featured }) => {
  const imgSrc = getArticleImage(article, index);

  if (featured) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
        <div className="md:flex">
          <div className="md:w-2/5 h-56 md:h-auto flex-shrink-0 overflow-hidden">
            <img
              src={imgSrc}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0]; }}
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">NỔI BẬT</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">{article.category}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-dark mb-3 group-hover:text-primary transition-colors leading-snug">
              {article.title}
            </h2>
            <p className="text-gray-500 text-sm mb-5 line-clamp-2">{article.excerpt}</p>
            <div className="flex items-center gap-5 text-xs text-gray-400 mb-5">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
              <span>⏱ {article.readTime} phút đọc</span>
            </div>
            <Link to={`/news/${article.slug}`} className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
              Đọc tiếp <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
      <div className="h-44 overflow-hidden">
        <img
          src={imgSrc}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]; }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">{article.category}</span>
          {article.isHot && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-bold">🔥 HOT</span>
          )}
        </div>
        <h3 className="font-bold text-dark text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug min-h-[40px]">
          {article.title}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
            <span>⏱ {article.readTime} phút</span>
          </div>
          <Link to={`/news/${article.slug}`} className="text-primary font-bold flex items-center gap-0.5 hover:underline">
            Đọc <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────────────
const ArticleSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────
const News: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await api.get('/news');
        const data: Article[] = res.data?.data || res.data || [];
        setArticles(data.length > 0 ? data : STATIC_ARTICLES);
      } catch {
        setArticles(STATIC_ARTICLES);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filtered = articles.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const featured = filtered[0];
  const showFeatured = !search;
  const gridArticles = showFeatured && featured ? filtered.filter((a) => a.id !== featured.id) : filtered;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  return (
    <div>
      {/* ── Banner Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 260 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/giaidau.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-800/70 to-gray-900/40" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 text-white animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/90 px-4 py-1.5 rounded-full mb-4 text-sm font-bold tracking-wide">
            📰 TIN TỨC & BLOG
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
            Thế Giới Cầu Lông
          </h1>
          <p className="text-gray-200 text-base md:text-lg max-w-2xl drop-shadow">
            Cập nhật tin tức thể thao cầu lông, hướng dẫn kỹ thuật, review sản phẩm và nhiều nội dung hữu ích
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-dark font-semibold">Tin tức</span>
        </nav>

        {/* ── Search only (bỏ bộ lọc category) ── */}
        <div className="mb-8">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              className="form-input pr-9"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* ── Count ── */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} bài viết
          </p>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">Không tìm thấy bài viết nào</p>
            <p className="text-sm mt-1">Thử thay đổi từ khoá tìm kiếm</p>
            <button onClick={() => setSearch('')} className="btn-outline text-sm mt-4">
              Xóa tìm kiếm
            </button>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {showFeatured && featured && (
              <section className="mb-10">
                <ArticleCard article={featured} index={0} featured />
              </section>
            )}

            {/* Grid */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i + 1} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Newsletter ── */}
        <section className="mt-14 bg-gradient-to-r from-secondary to-blue-600 rounded-2xl p-10 text-white text-center">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h2 className="text-2xl font-extrabold mb-2">Đăng Ký Nhận Tin</h2>
          <p className="text-white/80 mb-6 text-sm">
            Nhận bài viết mới nhất và ưu đãi độc quyền trực tiếp vào hộp thư của bạn
          </p>
          {subscribed ? (
            <p className="bg-white/20 inline-block px-6 py-3 rounded-full font-semibold text-sm">
              ✅ Cảm ơn bạn đã đăng ký!
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                className="flex-1 px-4 py-2.5 rounded-lg text-dark text-sm outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover transition-colors font-bold px-5 py-2.5 rounded-lg text-sm whitespace-nowrap"
              >
                Đăng ký
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default News;
