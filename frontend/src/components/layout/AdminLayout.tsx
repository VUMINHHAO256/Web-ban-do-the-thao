import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Newspaper,
  Tag, LogOut, Menu, X, ChevronRight, Bell, Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin',            label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Sản phẩm',      icon: Package },
  { to: '/admin/orders',     label: 'Đơn hàng',      icon: ShoppingBag },
  { to: '/admin/users',      label: 'Người dùng',    icon: Users },
  { to: '/admin/news',       label: 'Tin tức',       icon: Newspaper },
  { to: '/admin/promotions', label: 'Khuyến mãi',    icon: Tag },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-extrabold text-lg">M</div>
        <div>
          <div className="text-white font-extrabold text-base leading-none">MHShop</div>
          <div className="text-white/40 text-xs mt-0.5">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col" style={{ background: '#0f172a' }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 flex flex-col z-50" style={{ background: '#0f172a' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 flex items-center gap-4 px-4 md:px-6 h-14 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors font-medium"
          >
            Xem trang web <ChevronRight className="w-3 h-3" />
          </button>

          <button className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
