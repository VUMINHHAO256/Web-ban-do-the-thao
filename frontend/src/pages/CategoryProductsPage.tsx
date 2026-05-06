import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ChevronLeft, ChevronRight, SlidersHorizontal, X, Check,
  Zap, Target, Shield, Award, Wind, Lock, Cloud, RefreshCw, Sun,
  Palette, Layers, ShoppingBag, Feather,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import type { Product } from '../components/products/ProductCard';

interface FeatureItem {
  icon: React.ElementType;   // Lucide icon component
  title: string;
  desc: string;
}
interface CategoryConfig {
  key: string; name: string; description: string;
  gradient: string; bannerImage: string;
  features: FeatureItem[]; brands: string[];
}

const CONFIGS: Record<string, CategoryConfig> = {
  rackets: {
    key: 'rackets', name: 'Vợt Cầu Lông',
    description: 'Vợt chính hãng Yonex, Victor, Li-Ning — Công nghệ tiên tiến, phù hợp mọi trình độ',
    gradient: 'from-blue-900/75 to-indigo-900/75', bannerImage: '/assets/axforce90.jpg',
    features: [
      { icon: Zap,    title: 'Siêu Nhẹ',        desc: 'Khung carbon cao cấp, trọng lượng từ 80–90g' },
      { icon: Target, title: 'Điểm Ngọt Lớn',   desc: 'Kiểm soát cầu tốt trong mọi tình huống' },
      { icon: Shield, title: 'Độ Bền Cao',       desc: 'Chịu lực tốt, bền lâu theo thời gian' },
      { icon: Award,  title: 'Chính Hãng 100%',  desc: 'Bảo hành theo NSX, có tem xác thực' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'Babolat', 'VS'],
  },
  shoes: {
    key: 'shoes', name: 'Giày Cầu Lông',
    description: 'Giày chuyên dụng bảo vệ mắt cá chân — Đế chống trơn, êm ái và thoáng khí',
    gradient: 'from-orange-900/75 to-red-900/75', bannerImage: '/assets/GiayAce.jpg',
    features: [
      { icon: Shield, title: 'Bảo Vệ Mắt Cá',    desc: 'Cổ giày hỗ trợ và bảo vệ khớp mắt cá' },
      { icon: Wind,   title: 'Thoáng Khí',         desc: 'Vải lưới cao cấp thông thoáng suốt trận đấu' },
      { icon: Lock,   title: 'Chống Trơn Trượt',   desc: 'Đế cao su đặc biệt, bám sàn hoàn hảo' },
      { icon: Cloud,  title: 'Đệm Êm Ái',          desc: 'Lớp đệm giảm chấn bảo vệ bàn chân toàn diện' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'Adidas', 'Asics'],
  },
  clothing: {
    key: 'clothing', name: 'Quần Áo Cầu Lông',
    description: 'Trang phục cầu lông chính hãng — Nhanh khô, thoáng mát, tự do vận động',
    gradient: 'from-green-900/75 to-teal-900/75', bannerImage: '/assets/aovictor1.jpg',
    features: [
      { icon: Wind,       title: 'Thấm Hút Tốt',    desc: 'Vải thể thao cao cấp thấm mồ hôi nhanh' },
      { icon: RefreshCw,  title: 'Co Giãn 4 Chiều',  desc: 'Tự do di chuyển trong mọi tình huống' },
      { icon: Sun,        title: 'Chống UV',          desc: 'Bảo vệ da khỏi tia UV khi thi đấu ngoài trời' },
      { icon: Palette,    title: 'Nhiều Mẫu Đẹp',    desc: 'Đa dạng màu sắc, phong cách thời trang' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'Adidas'],
  },
  accessories: {
    key: 'accessories', name: 'Phụ Kiện Cầu Lông',
    description: 'Đầy đủ phụ kiện cầu lông — Cước vợt, túi, bao tay, băng đầu, cầu lông',
    gradient: 'from-purple-900/75 to-violet-900/75', bannerImage: '/assets/tuivictor1.jpg',
    features: [
      { icon: Layers,      title: 'Cước Vợt Cao Cấp', desc: 'Nhiều loại cước phù hợp mọi phong cách chơi' },
      { icon: ShoppingBag, title: 'Túi & Balo',        desc: 'Túi đựng vợt chính hãng, bền đẹp nhiều ngăn' },
      { icon: Shield,      title: 'Đồ Bảo Hộ',        desc: 'Găng tay, đai cổ tay, đai đầu gối chính hãng' },
      { icon: Feather,     title: 'Cầu Lông',          desc: 'Cầu lông vũ và nhựa đạt tiêu chuẩn thi đấu' },
    ],
    brands: ['Yonex', 'Victor', 'Li-Ning', 'VS', 'RSL'],
  },
};

const SORT_OPTIONS = [
  { value: '',           label: 'Mặc định'      },
  { value: 'price_asc',  label: 'Giá tăng dần'  },
  { value: 'price_desc', label: 'Giá giảm dần'  },
  { value: 'name_asc',   label: 'Tên A → Z'     },
];

const PRICE_PRESETS = [
  { label: 'Dưới 500K',         min: 0,       max: 500000   },
  { label: '500K – 1 triệu',    min: 500000,  max: 1000000  },
  { label: '1 triệu – 2 triệu', min: 1000000, max: 2000000  },
  { label: '2 triệu – 5 triệu', min: 2000000, max: 5000000  },
  { label: 'Trên 5 triệu',      min: 5000000, max: Infinity },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const PAGE_SIZE = 12;

interface Props { categoryKey: string; }

const CategoryProductsPage: React.FC<Props> = ({ categoryKey }) => {
  const config = CONFIGS[categoryKey];

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('');
  const [page, setPage]               = useState(1);

  // ── Filter states ──
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [pricePreset, setPricePreset]       = useState<number | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Reset khi đổi category
  useEffect(() => {
    setSearch(''); setSort(''); setPage(1);
    setSelectedBrands([]); setPricePreset(null);
  }, [categoryKey]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { category: categoryKey };
        if (search) params.search = search;
        const res = await api.get('/products', { params });
        setAllProducts(res.data?.data || res.data || []);
      } catch { setAllProducts([]); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [categoryKey, search]);

  // ── Filter + Sort logic (client-side) ──
  const filtered = useMemo(() => {
    let list = [...allProducts];

    // Brand filter
    if (selectedBrands.length > 0) {
      list = list.filter(p =>
        selectedBrands.some(b => p.brand?.toLowerCase() === b.toLowerCase())
      );
    }

    // Price range filter
    if (pricePreset !== null) {
      const preset = PRICE_PRESETS[pricePreset];
      list = list.filter(p => p.price >= preset.min && p.price <= preset.max);
    }

    // Sort
    list.sort((a, b) => {
      if (sort === 'price_asc')  return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'name_asc')   return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [allProducts, selectedBrands, pricePreset, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilterCount = selectedBrands.length + (pricePreset !== null ? 1 : 0);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedBrands([]); setPricePreset(null); setSearch(''); setSort(''); setPage(1);
  };

  if (!config) {
    return <div className="text-center py-20 text-gray-500">Danh mục không tồn tại.</div>;
  }

  return (
    <div>
      {/* ── Banner Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 260 }}>
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.bannerImage})` }} />
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient}`} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 flex flex-col items-start text-white animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">{config.name}</h1>
          <p className="text-white/85 text-base md:text-lg max-w-2xl drop-shadow">{config.description}</p>
        </div>
      </section>

      {/* Features Bar */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-dark">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
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

        {/* ── Toolbar: Search + Sort + Filter toggle ── */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-5 flex flex-wrap gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input type="text" className="form-input pr-9 w-full"
              placeholder={`Tìm trong ${config.name}...`}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
            <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-dark whitespace-nowrap">Sắp xếp:</span>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="form-input w-auto text-sm">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilterPanel(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors
                ${showFilterPanel ? 'bg-primary text-white border-primary' : 'bg-white text-dark border-gray-300 hover:border-primary hover:text-primary'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold
                  ${showFilterPanel ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" /> Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Panel ── */}
        {showFilterPanel && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Brand filter */}
              <div>
                <h3 className="text-sm font-bold text-dark mb-3">Thương hiệu</h3>
                <div className="flex flex-wrap gap-2">
                  {config.brands.map(brand => {
                    const active = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                          ${active
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                          }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price range filter */}
              <div>
                <h3 className="text-sm font-bold text-dark mb-3">Khoảng giá</h3>
                <div className="flex flex-wrap gap-2">
                  {PRICE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setPricePreset(pricePreset === idx ? null : idx); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                        ${pricePreset === idx
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Đang lọc:</span>
                {selectedBrands.map(b => (
                  <span key={b} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                    {b}
                    <button onClick={() => toggleBrand(b)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {pricePreset !== null && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                    {PRICE_PRESETS[pricePreset].label}
                    <button onClick={() => setPricePreset(null)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Product count */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Đang tải...' : (
            activeFilterCount > 0
              ? `${filtered.length} / ${allProducts.length} sản phẩm`
              : `${allProducts.length} sản phẩm`
          )}
        </p>

        {/* ── Product Grid ── */}
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
            <button onClick={clearFilters} className="btn-outline text-sm mt-4">
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayed.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-9 h-9 rounded text-sm font-semibold border transition-colors ${
                  n === page ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-100'
                }`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
