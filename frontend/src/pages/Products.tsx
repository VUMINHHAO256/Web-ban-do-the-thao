import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Heart, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  brand?: string;
  is_featured?: boolean;
  is_new?: boolean;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'rackets', label: 'Vợt cầu lông' },
  { value: 'shoes', label: 'Giày cầu lông' },
  { value: 'clothing', label: 'Áo quần' },
  { value: 'accessories', label: 'Phụ kiện' },
];

const BRAND_OPTIONS = ['Yonex', 'Victor', 'Li-Ning', 'VS', 'Babolat', 'Adidas'];

const SORT_OPTIONS = [
  { value: '', label: 'Mặc định' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name_asc', label: 'Tên A → Z' },
];

const PAGE_SIZE = 12;

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state derived from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  // Sync state khi URL thay đổi (ví dụ: click từ trang chủ)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setBrand(searchParams.get('brand') || '');
    setSort(searchParams.get('sort') || '');
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (category) params.category = category;
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
  }, [category, brand, search]);

  // Apply sort + pagination on client
  const sorted = [...allProducts].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const displayed = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const applyFilters = useCallback(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (sort) params.sort = sort;
    params.page = '1';
    setPage(1);
    setSearchParams(params);
    setSidebarOpen(false);
  }, [search, category, brand, sort, setSearchParams]);

  // Áp dụng ngay với giá trị mới (tránh stale closure)
  const applyFiltersWithValues = useCallback(
    (overrides: { search?: string; category?: string; brand?: string; sort?: string }) => {
      const newSearch   = overrides.search   !== undefined ? overrides.search   : search;
      const newCategory = overrides.category !== undefined ? overrides.category : category;
      const newBrand    = overrides.brand    !== undefined ? overrides.brand    : brand;
      const newSort     = overrides.sort     !== undefined ? overrides.sort     : sort;
      const params: Record<string, string> = {};
      if (newSearch)   params.search   = newSearch;
      if (newCategory) params.category = newCategory;
      if (newBrand)    params.brand    = newBrand;
      if (newSort)     params.sort     = newSort;
      params.page = '1';
      setPage(1);
      setSearchParams(params);
      setSidebarOpen(false);
    },
    [search, category, brand, sort, setSearchParams]
  );

  const clearFilters = () => {
    setSearch(''); setCategory(''); setBrand(''); setSort('');
    setPage(1); setSearchParams({});
  };

  const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === category)?.label || 'Tất cả sản phẩm';

  return (
    <div>
      {/* ── Banner Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 200 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/88dial3.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 text-white animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-lg">{categoryLabel}</h1>
          <p className="text-white/80 text-base">Khám phá hàng trăm sản phẩm cầu lông chính hãng, giá tốt nhất</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-dark font-semibold">{categoryLabel}</span>
      </nav>

      <div className="flex gap-6">
        {/* ── Sidebar Filter ── */}
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
          fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white z-50 shadow-xl md:shadow-none
          transition-transform duration-300 md:translate-x-0 md:block flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          p-5 rounded-lg md:min-w-[220px] md:max-w-[220px] overflow-y-auto
        `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark text-lg">Bộ lọc</h3>
            <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1 text-dark">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                className="form-input pr-8"
                placeholder="Tên sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
              />
              <Search className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-dark">Danh mục</label>
            {CATEGORY_OPTIONS.map(c => (
              <label key={c.value} className="flex items-center gap-2 mb-1 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="category"
                  value={c.value}
                  checked={category === c.value}
                  onChange={() => setCategory(c.value)}
                  className="accent-primary"
                />
                {c.label}
              </label>
            ))}
          </div>

          {/* Brand */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-dark">Thương hiệu</label>
            <label className="flex items-center gap-2 mb-1 cursor-pointer text-sm">
              <input
                type="radio"
                name="brand"
                value=""
                checked={brand === ''}
                onChange={() => { setBrand(''); applyFiltersWithValues({ brand: '' }); }}
                className="accent-primary"
              />
              Tất cả
            </label>
            {BRAND_OPTIONS.map(b => (
              <label key={b} className={`flex items-center gap-2 mb-1 cursor-pointer text-sm ${brand === b ? 'font-bold text-primary' : ''}`}>
                <input
                  type="radio"
                  name="brand"
                  value={b}
                  checked={brand === b}
                  onChange={() => { setBrand(b); applyFiltersWithValues({ brand: b }); }}
                  className="accent-primary"
                />
                {b}
              </label>
            ))}
          </div>

          {/* Buttons */}
          <button onClick={applyFilters} className="btn-primary w-full mb-2 text-sm">Áp dụng</button>
          <button onClick={clearFilters} className="btn-outline w-full text-sm">Xóa bộ lọc</button>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-1 bg-white border border-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
              </button>
              <span className="text-sm text-gray-500">
                {loading ? 'Đang tải...' : `${allProducts.length} sản phẩm`}
              </span>
            </div>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="form-input w-auto text-sm"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="bg-white rounded-lg p-16 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map(product => (
                <div key={product.id} className="product-card group">
                  <Link to={`/products/${product.id}`}>
                    <div className="relative h-44 overflow-hidden bg-gray-50">
                      <img
                        src={product.image_url || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                      />
                      {product.old_price && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                          -{Math.round((1 - product.price / product.old_price) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-dark line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
                      <div className="flex gap-2 items-center mb-3">
                        <span className="text-primary font-bold">{formatCurrency(product.price)}</span>
                        {product.old_price && (
                          <span className="text-gray-400 text-xs line-through">{formatCurrency(product.old_price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 flex gap-2">
                    <button
                      onClick={() => addItem({ id: String(product.id), name: product.name, price: product.price, image: product.image_url || '' })}
                      className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded hover:bg-primary-hover transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" /> Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => toggleItem({ id: String(product.id), name: product.name, price: product.price, image: product.image_url || '' })}
                      className={`w-8 h-8 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${isInWishlist(String(product.id)) ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-400'}`}
                    >
                      <Heart className="w-4 h-4" fill={isInWishlist(String(product.id)) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              ))}
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
                  className={`w-9 h-9 rounded text-sm font-semibold border transition-colors ${n === page ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-100'}`}>
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
      </div>
    </div>
  );
};

export default Products;
