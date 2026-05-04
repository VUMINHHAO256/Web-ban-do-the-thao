import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, AlertCircle, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

// ── Shared UI (OUTSIDE component) ────────────────────────────────────
const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

// ── Types ─────────────────────────────────────────────────────────────
interface Coupon {
  id: number; code: string; discount: string; desc: string;
  min: number; discountType: string; discountValue: number;
  isActive: boolean; expiresAt?: string; createdAt?: string;
}

interface FormData {
  code: string; discount: string; description: string; minOrderAmount: number;
  discountType: string; discountValue: number; isActive: boolean; expiresAt: string;
}

const EMPTY_FORM: FormData = {
  code: '', discount: '', description: '', minOrderAmount: 0,
  discountType: 'percent', discountValue: 0, isActive: true, expiresAt: '',
};

// ── Main Component ────────────────────────────────────────────────────
const AdminPromotions: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null);
  const [form, setForm]       = useState<FormData>(EMPTY_FORM);
  const [editId, setEditId]   = useState<number | null>(null);
  const [saving, setSaving]   = useState(false);
  const [delId, setDelId]     = useState<number | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions/all');
      setCoupons(res.data?.data || res.data || []);
    } catch {
      try {
        const res2 = await api.get('/promotions');
        setCoupons(res2.data?.data || res2.data || []);
      } catch {}
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchCoupons(); }, []);

  const filtered = coupons.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.discount.toLowerCase().includes(search.toLowerCase())
  );

  const setF = (key: keyof FormData, val: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const openAdd  = () => { setForm(EMPTY_FORM); setModal('add'); setErr(''); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code, discount: c.discount, description: c.desc || '',
      minOrderAmount: c.min || 0, discountType: c.discountType || 'percent',
      discountValue: c.discountValue || 0, isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
    });
    setEditId(c.id); setModal('edit'); setErr('');
  };
  const closeModal = () => { setModal(null); setEditId(null); setErr(''); };

  const handleSave = async () => {
    if (!form.code || !form.discount) { setErr('Vui lòng điền mã và tên khuyến mãi'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form, expiresAt: form.expiresAt || null };
      if (modal === 'add') await api.post('/promotions', payload);
      else await api.put(`/promotions/${editId}`, payload);
      setMsg(modal === 'add' ? 'Đã thêm mã giảm giá!' : 'Đã cập nhật mã!');
      setTimeout(() => setMsg(''), 3000);
      closeModal(); fetchCoupons();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await api.put(`/promotions/${c.id}`, { isActive: !c.isActive });
      setCoupons(prev => prev.map(p => p.id === c.id ? { ...p, isActive: !p.isActive } : p));
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/promotions/${id}`);
      setCoupons(prev => prev.filter(c => c.id !== id));
      setMsg('Đã xóa mã giảm giá!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Lỗi xóa');
    } finally { setDelId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Khuyến mãi</h1>
          <p className="text-gray-500 text-sm">{coupons.length} mã giảm giá</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Thêm mã
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-sm flex justify-between items-center">
          {msg} <button onClick={() => setMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex gap-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative max-w-xs w-full">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã giảm giá..." className={inputCls + ' pr-8'} />
          <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="bg-white rounded-xl h-36 animate-pulse shadow-sm" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Tag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-400">Không tìm thấy mã giảm giá</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className={`bg-white rounded-xl shadow-sm border-2 transition-all ${c.isActive ? 'border-primary/20' : 'border-gray-100 opacity-60'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-extrabold text-primary text-lg tracking-wider">{c.code}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{c.discount}</p>
                  </div>
                  <button onClick={() => toggleActive(c)} className="text-gray-400 hover:text-primary transition-colors">
                    {c.isActive ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-1">{c.desc}</p>
                <p className="text-xs text-gray-400">Đơn tối thiểu: {fmt(c.min)}</p>
                {c.expiresAt && <p className="text-xs text-orange-500 mt-1">Hết hạn: {fmtDate(c.expiresAt)}</p>}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDelId(c.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">{modal === 'add' ? 'Thêm mã giảm giá' : 'Chỉnh sửa mã'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {err && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {err}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mã giảm giá *">
                  <input className={inputCls + ' uppercase'} value={form.code}
                    onChange={e => setF('code', e.target.value.toUpperCase())} placeholder="VD: SALE10" />
                </Field>
                <Field label="Tên/Mô tả ngắn *">
                  <input className={inputCls} value={form.discount}
                    onChange={e => setF('discount', e.target.value)} placeholder="VD: Giảm 10%" />
                </Field>
              </div>
              <Field label="Mô tả chi tiết">
                <input className={inputCls} value={form.description}
                  onChange={e => setF('description', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Loại giảm giá">
                  <select className={inputCls} value={form.discountType} onChange={e => setF('discountType', e.target.value)}>
                    <option value="percent">Phần trăm (%)</option>
                    <option value="amount">Số tiền (VNĐ)</option>
                    <option value="freeship">Miễn phí ship</option>
                  </select>
                </Field>
                <Field label={`Giá trị ${form.discountType === 'percent' ? '(%)' : form.discountType === 'amount' ? '(VNĐ)' : ''}`}>
                  <input type="number" className={inputCls} value={form.discountValue || ''}
                    onChange={e => setF('discountValue', +e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Đơn tối thiểu (VNĐ)">
                  <input type="number" className={inputCls} value={form.minOrderAmount || ''}
                    onChange={e => setF('minOrderAmount', +e.target.value)} />
                </Field>
                <Field label="Ngày hết hạn">
                  <input type="date" className={inputCls} value={form.expiresAt}
                    onChange={e => setF('expiresAt', e.target.value)} />
                </Field>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setF('isActive', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium text-gray-700">Kích hoạt ngay</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Hủy</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : modal === 'add' ? 'Thêm mã' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Xóa mã giảm giá?</h3>
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

export default AdminPromotions;
