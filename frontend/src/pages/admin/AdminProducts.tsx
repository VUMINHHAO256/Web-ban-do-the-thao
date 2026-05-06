import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, AlertCircle, Package } from 'lucide-react';
import api from '../../services/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

// ── Shared UI (OUTSIDE component to avoid remount on re-render) ──────
const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

// ── Types ─────────────────────────────────────────────────────────────
interface Product {
  id: string; name: string; category: string; price: number;
  old_price?: number; stock: number; status: string; image_url?: string; description?: string;
}

interface FormData {
  id: string; name: string; category: string; price: number;
  oldPrice: number; stock: number; status: string; image: string; description: string;
}

const CATEGORIES = ['Tất cả', 'rackets', 'shoes', 'clothing', 'accessories'];
const CAT_LABELS: Record<string, string> = { rackets: 'Vợt', shoes: 'Giày', clothing: 'Quần áo', accessories: 'Phụ kiện' };

const EMPTY_FORM: FormData = {
  id: '', name: '', category: 'rackets', price: 0,
  oldPrice: 0, stock: 0, status: 'active', image: '', description: '',
};

const PER_PAGE = 12;

// ── Main Component ────────────────────────────────────────────────────
const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [page, setPage]         = useState(1);

  const [modal, setModal]   = useState<'add' | 'edit' | null>(null);
  const [form, setForm]     = useState<FormData>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId]   = useState<string | null>(null);
  const [msg, setMsg]       = useState('');
  const [err, setErr]       = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data?.data || res.data || []);
    } catch { setErr('Không thể tải sản phẩm'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    const matchCat    = category === 'Tất cả' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); setErr(''); };
  const openEdit = (p: Product) => {
    setForm({
      id: p.id, name: p.name, category: p.category,
      price: p.price, oldPrice: p.old_price || 0,
      stock: p.stock, status: p.status,
      image: p.image_url?.replace('/assets/', '') || '',
      description: p.description || '',
    });
    setEditId(p.id);
    setModal('edit');
    setErr('');
  };
  const closeModal = () => { setModal(null); setEditId(null); setErr(''); };

  const setF = (key: keyof FormData, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.price) { setErr('Vui lòng điền tên và giá sản phẩm'); return; }
    if (modal === 'add' && !form.id) { setErr('Vui lòng điền mã sản phẩm (ID)'); return; }
    setSaving(true); setErr('');
    try {
      if (modal === 'add') {
        await api.post('/products', form);
      } else {
        const { id, ...rest } = form;
        await api.put(`/products/${editId}`, rest);
      }
      setMsg(modal === 'add' ? 'Đã thêm sản phẩm thành công!' : 'Đã cập nhật sản phẩm!');
      setTimeout(() => setMsg(''), 3000);
      closeModal();
      fetchProducts();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setMsg('Đã xóa sản phẩm!');
      setTimeout(() => setMsg(''), 3000);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Lỗi khi xóa');
    } finally { setDelId(null); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Sản phẩm</h1>
          <p className="text-gray-500 text-sm">{products.length} sản phẩm</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between">
          {msg} <button onClick={() => setMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative max-w-xs w-full">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên sản phẩm..." className={inputCls + ' pr-8'} />
          <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                category === c ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}>
              {CAT_LABELS[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải...</div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-400">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['ID', 'Sản phẩm', 'Danh mục', 'Giá', 'Tồn', 'Trạng thái', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg border" onError={e => (e.currentTarget.style.display='none')} />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-700 line-clamp-1 max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{fmt(p.price)}</p>
                      {p.old_price && p.old_price > p.price && (
                        <p className="text-xs text-gray-400 line-through">{fmt(p.old_price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-orange-500' : 'text-gray-700'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelId(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Trang {page}/{totalPages} · {filtered.length} sản phẩm</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded text-xs font-semibold ${page === i + 1 ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">{modal === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {err && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {err}
                </div>
              )}

              {modal === 'add' && (
                <Field label="Mã sản phẩm (ID) *">
                  <input className={inputCls} value={form.id} onChange={e => setF('id', e.target.value)}
                    placeholder="vd: racket-011, shoe-009..." />
                </Field>
              )}

              <Field label="Tên sản phẩm *">
                <input className={inputCls} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Nhập tên sản phẩm..." />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Danh mục">
                  <select className={inputCls} value={form.category} onChange={e => setF('category', e.target.value)}>
                    <option value="rackets">Vợt cầu lông</option>
                    <option value="shoes">Giày</option>
                    <option value="clothing">Quần áo</option>
                    <option value="accessories">Phụ kiện</option>
                  </select>
                </Field>
                <Field label="Trạng thái">
                  <select className={inputCls} value={form.status} onChange={e => setF('status', e.target.value)}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ẩn</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Giá bán (VNĐ) *">
                  <input
                    type="number"
                    className={inputCls}
                    value={form.price || ''}
                    min={0}
                    step={1000}
                    onChange={e => setF('price', Math.max(0, +e.target.value))}
                    onBlur={e => { if (+e.target.value < 0) setF('price', 0); }}
                    placeholder="0"
                  />
                </Field>
                <Field label="Giá gốc (VNĐ)">
                  <input
                    type="number"
                    className={inputCls}
                    value={form.oldPrice || ''}
                    min={0}
                    step={1000}
                    onChange={e => setF('oldPrice', Math.max(0, +e.target.value))}
                    onBlur={e => { if (+e.target.value < 0) setF('oldPrice', 0); }}
                    placeholder="0"
                  />
                </Field>
                <Field label="Tồn kho">
                  <input
                    type="number"
                    className={inputCls}
                    value={form.stock === 0 ? '' : form.stock}
                    min={0}
                    step={1}
                    onChange={e => setF('stock', Math.max(0, Math.floor(+e.target.value)))}
                    onBlur={e => { if (+e.target.value < 0) setF('stock', 0); }}
                    placeholder="0"
                  />
                </Field>
              </div>

              <Field label="Tên file ảnh (vd: yonex-ax88d.jpg)">
                <input className={inputCls} value={form.image} onChange={e => setF('image', e.target.value)} placeholder="ten-file-anh.jpg" />
              </Field>

              <Field label="Mô tả">
                <textarea rows={3} className={inputCls} value={form.description} onChange={e => setF('description', e.target.value)} />
              </Field>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Hủy</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : modal === 'add' ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────── */}
      {delId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Xóa sản phẩm?</h3>
            <p className="text-sm text-gray-500 mb-5">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
              <button onClick={() => handleDelete(delId)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
