import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import type { Product } from '../components/products/ProductCard';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

interface CategoryConfig {
  key: string;
  name: string;
  description: string;
  gradient: string;
  icon: string;
  features: FeatureItem[];
  brands: string[];
}

const CONFIGS: Record<string, CategoryConfig> = {
  rackets: {
    key: 'rackets',
    name: 'Vợt Cầu Lông',
    description:
      'Vợt chính hãng Yonex, Victor, Li-Ning — Công nghệ tiên tiến, phù hợp mọi trình độ',
    gradient: 'from-blue-900 to-indigo-800',
    icon: '🏸',
    features: [
      { icon: '⚡', title: 'Siêu Nhẹ', desc: 'Khung carbon cao cấp, trọng lượng từ 80–90g' },
      { icon: '🎯', title: 'Điểm Ngọt Lớn', desc: 'Kiểm soát cầu tốt trong mọi tình huống' },
      { icon: '💪', title: 'Độ Bền Cao', desc: 'Chịu lực tốt, bền lâu theo thời gian' },
      { icon: '🏆', title: 'Chính Hãng 100%', desc: 'Bảo hành theo NSX, có tem xác thực' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'Babolat', 'VS'],
  },
  shoes: {
    key: 'shoes',
    name: 'Giày Cầu Lông',
    description:
      'Giày chuyên dụng bảo vệ mắt cá chân — Đế chống trơn, êm ái và thoáng khí',
    gradient: 'from-orange-700 to-red-700',
    icon: '👟',
    features: [
      { icon: '🛡️', title: 'Bảo Vệ Mắt Cá', desc: 'Cổ giày hỗ trợ và bảo vệ khớp mắt cá' },
      { icon: '🌬️', title: 'Thoáng Khí', desc: 'Vải lưới cao cấp thông thoáng suốt trận đấu' },
      { icon: '🔒', title: 'Chống Trơn Trượt', desc: 'Đế cao su đặc biệt, bám sàn hoàn hảo' },
      { icon: '☁️', title: 'Đệm Êm Ái', desc: 'Lớp đệm giảm chấn bảo vệ bàn chân toàn diện' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'Adidas', 'Asics'],
  },
  clothing: {
    key: 'clothing',
    name: 'Quần Áo Cầu Lông',
    description:
      'Trang phục cầu lông chính hãng — Nhanh khô, thoáng mát, tự do vận động',
    gradient: 'from-green-700 to-teal-700',
    icon: '👕',
    features: [
      { icon: '💨', title: 'Thấm Hút Tốt', desc: 'Vải thể thao cao cấp thấm mồ hôi nhanh' },
      { icon: '🌀', title: 'Co Giãn 4 Chiều', desc: 'Tự do di chuyển trong mọi tình huống' },
      { icon: '☀️', title: 'Chống UV', desc: 'Bảo vệ da khỏi tia UV khi thi đấu ngoài trời' },
      { icon: '🎨', title: 'Nhiều Mẫu Đẹp', desc: 'Đa dạng màu sắc, phong cách thời trang' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'Adidas', 'Lining'],
  },
  accessories: {
    key: 'accessories',
    name: 'Phụ Kiện Cầu Lông',
    description:
      'Đầy đủ phụ kiện cầu lông — Cước vợt, túi, bao tay, băng đầu, cầu lông',
    gradient: 'from-purple-800 to-violet-700',
    icon: '🎒',
    features: [
      { icon: '🧵', title: 'Cước Vợt Cao Cấp', desc: 'Nhiều loại cước phù hợp mọi phong cách chơi' },
      { icon: '🎒', title: 'Túi & Balo', desc: 'Túi đựng vợt chính hãng, bền đẹp nhiều ngăn' },
      { icon: '🧤', title: 'Đồ Bảo Hộ', desc: 'Găng tay, đai cổ tay, đai đầu gối chính hãng' },
      { icon: '🪶', title: 'Cầu Lông', desc: 'Cầu lông vũ và nhựa đạt tiêu chuẩn thi đấu' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'VS', 'RSL'],
  },
};

const SORT_OPTIONS = [
  { value: '', label: 'Mặc định' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name_asc', label: 'Tên A → Z' },
];

const PAGE_SIZE = 12;

interface Props {
  categoryKey: string;
}

const CategoryProductsPage: React.FC<Props> = ({ categoryKey }) => {
  const config = CONFIGS[categoryKey];
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch('');
    setBrand('');
    setSort('');
    setPage(1);
  }, [categoryKey]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { category: categoryKey };
        if (brand) params.brand = brand;
        if (search) params.search = search;
        const res = await api.get('/products', { params });
        setAllProducts(res.data?.data || res.data || []);
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryKey, brand, search]);

  const sorted = [...allProducts].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const displayed = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!config) {
    return (
      <div className="text-center py-20 text-gray-500">
        Danh mục không tồn tại.
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className={`bg-gradient-to-r ${config.gradient} text-white`} style={{ minHeight: 220 }}>
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col items-center text-center animate-fade-in">
          <div className="text-6xl mb-3">{config.icon}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{config.name}</h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl">{config.description}</p>
        </div>
      </section>

      {/* Features Bar */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {config.features.map((f, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl mb-1">{f.icon}</div>
              <h3 className="font-bold text-sm text-dark">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-5">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-dark font-semibold">{config.name}</span>
        </nav>

        {/* Filters & Sort */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-5">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Brand chips */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-sm font-semibold text-dark whitespace-nowrap">Thương hiệu:</span>
              {['', ...config.brands].map((b) => (
                <button
                  key={b}
                  onClick={() => { setBrand(b); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    brand === b
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  {b || 'Tất cả'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-semibold text-dark whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="form-input w-auto text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <input
            type="text"
            className="form-input pr-9"
            placeholder={`Tìm kiếm trong ${config.name}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Đang tải sản phẩm...' : `${allProducts.length} sản phẩm`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-72 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center text-gray-400 shadow-sm">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">Không tìm thấy sản phẩm nào</p>
            <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
            <button
              onClick={() => { setSearch(''); setBrand(''); setSort(''); setPage(1); }}
              className="btn-outline text-sm mt-4"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded text-sm font-semibold border transition-colors ${
                  n === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
