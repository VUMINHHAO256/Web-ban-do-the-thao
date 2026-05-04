import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react';
import api from '../services/api';

// Static fallback articles (same as in News.tsx)
const STATIC_ARTICLES = [
  { id: 1, slug: 'cach-chon-vot-cau-long-phu-hop', title: 'Hướng Dẫn Chọn Vợt Cầu Lông Phù Hợp Với Trình Độ', excerpt: 'Việc chọn vợt cầu lông không chỉ dựa vào thương hiệu mà còn phụ thuộc vào trình độ, phong cách chơi và ngân sách.', category: 'Hướng dẫn', author: 'MHShop Expert', date: '15/04/2026', bgColor: '#1e3a5f', emoji: '🏸', readTime: 5, isHot: true },
  { id: 2, slug: 'top-5-giay-yonex-2026', title: 'Top 5 Giày Cầu Lông Yonex Được Ưa Chuộng Nhất Năm 2026', excerpt: 'Yonex vẫn là thương hiệu giày cầu lông đỉnh cao. Cùng điểm qua 5 mẫu giày được yêu thích nhất 2026.', category: 'Review sản phẩm', author: 'Admin MHShop', date: '12/04/2026', bgColor: '#9a3412', emoji: '👟', readTime: 7 },
  { id: 3, slug: 'ky-thuat-co-ban-cho-nguoi-moi', title: 'Kỹ Thuật Đánh Cầu Lông Cơ Bản Cho Người Mới Bắt Đầu', excerpt: 'Bạn mới bắt đầu chơi cầu lông? Hướng dẫn này đưa bạn qua từng bước cơ bản.', category: 'Kỹ thuật', author: 'Coach Minh', date: '10/04/2026', bgColor: '#15803d', emoji: '🎯', readTime: 8 },
  { id: 7, slug: 'giai-cau-long-viet-nam-2026', title: 'Giải Cầu Lông Vô Địch Quốc Gia 2026 — Kết Quả & Highlights', excerpt: 'Giải đấu 2026 vừa khép lại với nhiều bất ngờ thú vị. Điểm lại những trận đấu đáng nhớ.', category: 'Tin thể thao', author: 'Sport Reporter', date: '01/04/2026', bgColor: '#dc2626', emoji: '🏆', readTime: 6, isHot: true },
  { id: 9, slug: 'su-khac-biet-giua-cac-thuong-hieu', title: 'Yonex vs Victor vs Li-Ning: Chọn Thương Hiệu Nào?', excerpt: 'Ba thương hiệu cầu lông hàng đầu châu Á. Phân tích ưu nhược điểm để bạn chọn đúng.', category: 'So sánh', author: 'MHShop Expert', date: '25/03/2026', bgColor: '#374151', emoji: '⚖️', readTime: 9 },
];

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  author?: string;
  date?: string;
  bgColor?: string;
  emoji?: string;
  readTime?: number;
  isHot?: boolean;
}

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');

    const fetchArticle = async () => {
      try {
        // Try API first
        const res = await api.get(`/news/${slug}`);
        const data = res.data;
        setArticle(data);

        // Fetch related articles
        const relRes = await api.get('/news', {
          params: { category: data.category },
        });
        const allRelated: Article[] = relRes.data?.data || relRes.data || [];
        setRelated(allRelated.filter((a) => a.slug !== slug).slice(0, 3));
      } catch {
        // Fallback to static data
        const found = STATIC_ARTICLES.find((a) => a.slug === slug);
        if (found) {
          setArticle(found);
          setRelated(STATIC_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3));
        } else {
          setError('Bài viết không tồn tại.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">📰</div>
        <h1 className="text-2xl font-bold text-dark mb-2">Bài viết không tồn tại</h1>
        <p className="text-gray-500 mb-6">{error || 'Bài viết bạn tìm không tồn tại hoặc đã bị xóa.'}</p>
        <button onClick={() => navigate('/news')} className="btn-primary">
          ← Quay lại Tin tức
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div
        className="text-white py-16 flex items-center justify-center"
        style={{ background: article.bgColor || '#1e3a5f', minHeight: 220 }}
      >
        <div className="text-center animate-fade-in px-4">
          <div className="text-7xl mb-4">{article.emoji || '📰'}</div>
          {article.category && (
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              {article.category}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold max-w-3xl mx-auto leading-snug">
            {article.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/news" className="hover:text-primary transition-colors">Tin tức</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-dark font-semibold line-clamp-1">{article.title}</span>
        </nav>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          {article.author && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-dark">{article.author}</span>
            </span>
          )}
          {article.date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {article.date}
            </span>
          )}
          {article.readTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              {article.readTime} phút đọc
            </span>
          )}
          {article.category && (
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              {article.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-10">
          {article.content ? (
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              style={{ lineHeight: 1.9 }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="text-gray-700 leading-relaxed text-base" style={{ lineHeight: 1.9 }}>
              <p>{article.excerpt}</p>
              <p className="mt-4 text-gray-400 text-sm italic">
                Nội dung đầy đủ đang được cập nhật. Vui lòng quay lại sau.
              </p>
            </div>
          )}
        </div>

        {/* Share & Back */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại Tin tức
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Chia sẻ:</span>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="border border-gray-300 rounded px-3 py-1 hover:border-primary hover:text-primary transition-colors"
            >
              📋 Sao chép link
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section>
            <h2 className="section-title mb-6">BÀI VIẾT LIÊN QUAN</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/news/${rel.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div
                    className="h-32 flex items-center justify-center text-5xl"
                    style={{ background: rel.bgColor || '#1e3a5f' }}
                  >
                    {rel.emoji || '📰'}
                  </div>
                  <div className="p-4">
                    {rel.category && (
                      <span className="text-xs text-gray-500 font-medium">{rel.category}</span>
                    )}
                    <h3 className="font-bold text-dark text-sm line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                      {rel.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-3">
                      Đọc tiếp <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
