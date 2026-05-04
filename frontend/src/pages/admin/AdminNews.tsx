import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, AlertCircle, Newspaper } from 'lucide-react';
import api from '../../services/api';

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
interface Article {
  id: number; slug: string; title: string; excerpt?: string; content?: string;
  category?: string; author?: string; emoji?: string; bgColor?: string;
  readTime?: number; isHot: boolean; isPublished: boolean; createdAt?: string;
}

interface FormData {
  slug: string; title: string; excerpt: string; content: string;
  category: string; author: string; emoji: string; bgColor: string;
  readTime: number; isHot: boolean; isPublished: boolean;
}

const CATEGORIES = ['Hướng dẫn','Review sản phẩm','Kỹ thuật','Mẹo hay','Sức khỏe','Tin thể thao','Tin sản phẩm','So sánh'];

const EMPTY_FORM: FormData = {
  slug: '', title: '', excerpt: '', content: '',
  category: 'Hướng dẫn', author: 'MHShop Expert',
  emoji: '📰', bgColor: '#1e3a5f', readTime: 5, isHot: false, isPublished: true,
};

// ── Main Component ────────────────────────────────────────────────────
const AdminNews: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');
  const [modal, setModal]       = useState<'add' | 'edit' | null>(null);
  const [form, setForm]         = useState<FormData>(EMPTY_FORM);
  const [editId, setEditId]     = useState<number | null>(null);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<number | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news');
      setArticles(res.data?.data || res.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchArticles(); }, []);

  const filtered = articles.filter(a =>
    !search ||
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const setF = (key: keyof FormData, val: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const openAdd  = () => { setForm(EMPTY_FORM); setModal('add'); setErr(''); };
  const openEdit = (a: Article) => {
    setForm({
      slug: a.slug, title: a.title, excerpt: a.excerpt || '',
      content: a.content || '', category: a.category || 'Hướng dẫn',
      author: a.author || 'MHShop Expert', emoji: a.emoji || '📰',
      bgColor: a.bgColor || '#1e3a5f', readTime: a.readTime || 5,
      isHot: a.isHot, isPublished: a.isPublished,
    });
    setEditId(a.id); setModal('edit'); setErr('');
  };
  const closeModal = () => { setModal(null); setEditId(null); setErr(''); };

  const handleSave = async () => {
    if (!form.slug || !form.title) { setErr('Vui lòng điền slug và tiêu đề'); return; }
    setSaving(true); setErr('');
    try {
      if (modal === 'add') await api.post('/news', form);
      else await api.put(`/news/${editId}`, form);
      setMsg(modal === 'add' ? 'Đã thêm bài viết!' : 'Đã cập nhật bài viết!');
      setTimeout(() => setMsg(''), 3000);
      closeModal(); fetchArticles();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/news/${id}`);
      setArticles(prev => prev.filter(a => a.id !== id));
      setMsg('Đã xóa bài viết!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Lỗi xóa');
    } finally { setDelId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Tin tức / Blog</h1>
          <p className="text-gray-500 text-sm">{articles.length} bài viết</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Thêm bài viết
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
            placeholder="Tìm tiêu đề, slug, danh mục..." className={inputCls + ' pr-8'} />
          <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Newspaper className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-400">Không tìm thấy bài viết</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['ID','Bài viết','Danh mục','Tác giả','Ngày tạo','Trạng thái',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{a.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: a.bgColor || '#1e3a5f' }}>
                          {a.emoji || '📰'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-700 truncate max-w-[220px]">{a.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[220px]">{a.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{a.category}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.author}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(a.createdAt || '')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {a.isPublished
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Đã đăng</span>
                          : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Ẩn</span>}
                        {a.isHot && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">🔥 Hot</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelId(a.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">{modal === 'add' ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {err && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {err}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tiêu đề *">
                  <input className={inputCls} value={form.title} onChange={e => setF('title', e.target.value)} />
                </Field>
                <Field label="Slug *">
                  <input className={inputCls} value={form.slug} onChange={e => setF('slug', e.target.value)} placeholder="vd: cach-chon-vot" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Danh mục">
                  <select className={inputCls} value={form.category} onChange={e => setF('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tác giả">
                  <input className={inputCls} value={form.author} onChange={e => setF('author', e.target.value)} />
                </Field>
                <Field label="Thời gian đọc (phút)">
                  <input type="number" className={inputCls} value={form.readTime} onChange={e => setF('readTime', +e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Emoji">
                  <input className={inputCls} value={form.emoji} onChange={e => setF('emoji', e.target.value)} />
                </Field>
                <Field label="Màu nền (hex)">
                  <div className="flex gap-2">
                    <input className={inputCls} value={form.bgColor} onChange={e => setF('bgColor', e.target.value)} />
                    <input type="color" value={form.bgColor} onChange={e => setF('bgColor', e.target.value)}
                      className="w-10 h-[38px] rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
                  </div>
                </Field>
              </div>
              <Field label="Tóm tắt">
                <textarea rows={2} className={inputCls} value={form.excerpt} onChange={e => setF('excerpt', e.target.value)} />
              </Field>
              <Field label="Nội dung (HTML)">
                <textarea rows={5} className={inputCls + ' font-mono text-xs'} value={form.content}
                  onChange={e => setF('content', e.target.value)} placeholder="<p>Nội dung bài viết...</p>" />
              </Field>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPublished} onChange={e => setF('isPublished', e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-medium text-gray-700">Đã đăng (Published)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isHot} onChange={e => setF('isHot', e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-medium text-gray-700">🔥 Nổi bật (Hot)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Hủy</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : modal === 'add' ? 'Thêm bài viết' : 'Lưu thay đổi'}
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
            <h3 className="text-lg font-bold text-gray-800 mb-1">Xóa bài viết?</h3>
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

export default AdminNews;
