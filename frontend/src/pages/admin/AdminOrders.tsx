import React, { useEffect, useState } from 'react';
import { Search, X, ShoppingBag, Eye, ChevronDown } from 'lucide-react';
import api from '../../services/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý', processing: 'Đang xử lý', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};
const ALL_STATUSES = ['Tất cả', 'pending', 'processing', 'completed', 'cancelled'];

interface Order {
  id: number; customerName: string; customerPhone: string;
  customerAddress: string; totalAmount: number; status: string;
  paymentMethod: string; createdAt: string; userId?: number;
}

interface OrderItem {
  id: number; productId: number; productName: string;
  quantity: number; price: number; imageUrl?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('Tất cả');
  const [msg, setMsg]         = useState('');

  const [detail, setDetail]     = useState<Order | null>(null);
  const [items, setItems]       = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data?.data || res.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = status === 'Tất cả' || o.status === status;
    const matchSearch = !search ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone?.includes(search) ||
      String(o.id).includes(search);
    return matchStatus && matchSearch;
  });

  const openDetail = async (order: Order) => {
    setDetail(order);
    setLoadingItems(true);
    try {
      const res = await api.get(`/orders/${order.id}/items`);
      setItems(res.data || []);
    } catch { setItems([]); }
    finally { setLoadingItems(false); }
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      if (detail?.id === orderId) setDetail((d) => d ? { ...d, status: newStatus } : d);
      setMsg('Đã cập nhật trạng thái!');
      setTimeout(() => setMsg(''), 2500);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Đơn hàng</h1>
        <p className="text-gray-500 text-sm">{orders.length} đơn hàng</p>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-sm flex justify-between">
          {msg} <button onClick={() => setMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative max-w-xs w-full">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, SĐT, mã đơn..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                status === s ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary'
              }`}>
              {s === 'Tất cả' ? s : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-400">Không tìm thấy đơn hàng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Thanh toán', 'Ngày đặt', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-primary">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-700">{o.customerName}</p>
                      <p className="text-xs text-gray-400">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">{fmt(o.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs capitalize">{o.paymentMethod || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer appearance-none pr-5 focus:outline-none ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 top-1.5 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(o)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Chi tiết đơn #{detail.id}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500 text-xs">Khách hàng</p><p className="font-semibold">{detail.customerName}</p></div>
                <div><p className="text-gray-500 text-xs">Điện thoại</p><p className="font-semibold">{detail.customerPhone}</p></div>
                <div className="col-span-2"><p className="text-gray-500 text-xs">Địa chỉ</p><p className="font-semibold">{detail.customerAddress}</p></div>
                <div><p className="text-gray-500 text-xs">Thanh toán</p><p className="font-semibold capitalize">{detail.paymentMethod}</p></div>
                <div><p className="text-gray-500 text-xs">Ngày đặt</p><p className="font-semibold">{fmtDate(detail.createdAt)}</p></div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cập nhật trạng thái</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <button key={val} onClick={() => updateStatus(detail.id, val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        detail.status === val ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:border-primary'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sản phẩm</p>
                {loadingItems ? (
                  <div className="text-sm text-gray-400 animate-pulse p-4 text-center">Đang tải...</div>
                ) : items.length === 0 ? (
                  <p className="text-sm text-gray-400">Không có thông tin sản phẩm</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 object-cover rounded" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-400">x{item.quantity} · {fmt(item.price)}</p>
                        </div>
                        <p className="text-sm font-bold text-primary">{fmt(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{fmt(detail.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
