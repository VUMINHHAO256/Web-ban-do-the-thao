import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Package, Users, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const fmtNum = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending:    'Chờ xử lý',
  processing: 'Đang xử lý',
  completed:  'Hoàn thành',
  cancelled:  'Đã hủy',
};

// ── Stat Card ────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; bg: string;
}> = ({ label, value, sub, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-extrabold text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Revenue Bar Chart ─────────────────────────────────────────────────
const RevenueChart: React.FC<{ data: any[] }> = ({ data }) => {
  const reversed = [...data].reverse();
  const max = Math.max(...reversed.map((d) => d.revenue), 1);
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

  return (
    <div className="flex items-end gap-1.5 h-36">
      {reversed.map((d, i) => {
        const pct = Math.max((d.revenue / max) * 100, 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
            <div className="relative w-full" style={{ height: 120 }}>
              <div
                className="absolute bottom-0 w-full bg-primary/80 hover:bg-primary rounded-t-sm transition-all"
                style={{ height: `${pct}%` }}
                title={`${months[d.month - 1]}: ${fmt(d.revenue)}`}
              />
            </div>
            <span className="text-xs text-gray-400">{months[d.month - 1]}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const [summary, setSummary]   = useState<any>(null);
  const [revenue, setRevenue]   = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, r, p, o] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/revenue'),
          api.get('/dashboard/products'),
          api.get('/dashboard/orders'),
        ]);
        setSummary(s.data);
        setRevenue(r.data || []);
        setProducts(p.data || []);
        setOrders(o.data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-24 shadow-sm" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl h-64 shadow-sm" />
        <div className="bg-white rounded-xl h-64 shadow-sm" />
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-3 text-red-600">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">Lỗi tải Dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  );

  const rev  = summary?.revenue  || {};
  const prod = summary?.products || {};
  const usr  = summary?.users    || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* ── Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng doanh thu"
          value={fmt(rev.totalRevenue || 0)}
          sub={`${fmtNum(rev.completedOrders || 0)} đơn hoàn thành`}
          icon={TrendingUp} color="text-green-600" bg="bg-green-50"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={fmtNum(rev.totalOrders || 0)}
          sub={`${rev.pendingOrders || 0} đang chờ xử lý`}
          icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50"
        />
        <StatCard
          label="Sản phẩm"
          value={fmtNum(prod.totalProducts || 0)}
          sub={`${prod.outOfStock || 0} hết hàng | ${prod.lowStock || 0} sắp hết`}
          icon={Package} color="text-orange-600" bg="bg-orange-50"
        />
        <StatCard
          label="Người dùng"
          value={fmtNum(usr.totalUsers || 0)}
          sub={`${usr.totalAdmins || 0} admin`}
          icon={Users} color="text-purple-600" bg="bg-purple-50"
        />
      </div>

      {/* ── Charts Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Revenue Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Doanh thu theo tháng</h2>
            <span className="text-xs text-gray-400">12 tháng gần nhất</span>
          </div>
          {revenue.length > 0 ? (
            <RevenueChart data={revenue} />
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-3">
            {[
              { label: 'Hoàn thành',   count: rev.completedOrders || 0, color: 'bg-green-500' },
              { label: 'Đang xử lý',   count: rev.pendingOrders || 0,   color: 'bg-yellow-500' },
              { label: 'Đã hủy',       count: rev.cancelledOrders || 0, color: 'bg-red-500' },
            ].map((item) => {
              const total = rev.totalOrders || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            {prod.outOfStock > 0 && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                {prod.outOfStock} sản phẩm hết hàng
              </div>
            )}
            {prod.lowStock > 0 && (
              <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                {prod.lowStock} sản phẩm sắp hết
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tables Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Top sản phẩm bán chạy</h2>
            <Link to="/admin/products" className="text-xs text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <p className="text-sm text-gray-400 p-5">Chưa có dữ liệu</p>
            ) : products.map((p: any, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category} · Tồn: {p.stock}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">{fmtNum(p.sold)} bán</p>
                  <p className="text-xs text-gray-400">{fmt(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Đơn hàng gần nhất</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400 p-5">Chưa có đơn hàng</p>
            ) : orders.map((o: any) => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{o.customerName}</p>
                  <p className="text-xs text-gray-400">{o.customerPhone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">{fmt(o.totalAmount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
