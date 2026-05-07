import React, { useEffect, useState, useCallback } from 'react';
import { Search, X, Users, Trash2, RefreshCw, ShieldCheck, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

const fmt = (n: number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

interface User {
  id: number; fullName: string; email: string; phone: string;
  role?: string; createdAt: string; orderCount: number; totalSpent: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState('');
  const [delId, setDelId]       = useState<number | null>(null);
  const [msg, setMsg]           = useState('');

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data?.data || res.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // Auto-refresh mỗi 30 giây để đồng bộ user mới đăng ký
    const interval = setInterval(() => fetchUsers(true), 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const filtered = users.filter((u) =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMsg('Đã xóa người dùng!');
      setTimeout(() => setMsg(''), 2500);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Lỗi xóa người dùng');
    } finally { setDelId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Người dùng</h1>
          <p className="text-gray-500 text-sm">{users.length} tài khoản</p>
        </div>
        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          title="Làm mới danh sách"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-sm flex justify-between">
          {msg} <button onClick={() => setMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex gap-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative max-w-xs w-full">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, email, SĐT..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-400">Không tìm thấy người dùng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['ID', 'Tên', 'Email', 'SĐT', 'Vai trò', 'Đơn hàng', 'Tổng chi tiêu', 'Ngày tạo', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {u.fullName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-gray-700">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                          <UserIcon className="w-3 h-3" />User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{u.orderCount ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{fmt(u.totalSpent)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDelId(u.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {delId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Xóa người dùng?</h3>
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

export default AdminUsers;
