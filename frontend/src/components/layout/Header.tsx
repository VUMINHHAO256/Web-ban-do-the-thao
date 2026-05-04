import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { ShoppingCart, Heart, User as UserIcon, LogOut, Search, Menu, X, ChevronDown, Phone, Mail } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { to: '/', label: 'TRANG CHỦ' },
    { to: '/rackets', label: 'VỢT CẦU LÔNG' },
    { to: '/shoes', label: 'GIÀY CẦU LÔNG' },
    { to: '/clothing', label: 'ÁO QUẦN' },
    { to: '/accessories', label: 'PHỤ KIỆN' },
    { to: '/promotions', label: 'KHUYẾN MÃI', style: 'text-yellow-300' },
    { to: '/news', label: 'TIN TỨC' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-secondary text-white text-sm py-2">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> Hotline: 0327.711.655
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Mail className="w-3 h-3" /> vuminhhao@mhshop.vn
            </span>
          </div>
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.name || 'Tài khoản'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-8 w-48 bg-white text-gray-700 rounded shadow-lg py-1 z-50 animate-fade-in">
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 text-sm">Quản trị viên</Link>
                    )}
                    <Link to="/profile" onClick={() => setUserDropdown(false)} className="block px-4 py-2 hover:bg-gray-100 text-sm">Hồ sơ</Link>
                    <Link to="/orders" onClick={() => setUserDropdown(false)} className="block px-4 py-2 hover:bg-gray-100 text-sm">Đơn hàng của tôi</Link>
                    <button
                      onClick={() => { logout(); setUserDropdown(false); }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:text-yellow-300 transition-colors">Đăng nhập</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 text-2xl font-extrabold text-primary tracking-wide">
          MHShop
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto relative">
          <input
            type="text"
            className="w-full pl-4 pr-24 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-primary transition-colors"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-4 bg-primary text-white rounded-r-md flex items-center gap-1 hover:bg-primary-hover transition-colors text-sm font-semibold"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Tìm</span>
          </button>
        </form>

        {/* Cart & Wishlist */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/wishlist"
            className="flex items-center gap-1 bg-primary text-white px-3 py-2 rounded font-bold text-sm hover:bg-primary-hover transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Yêu thích</span>
            <span className="badge">{wishlistItems.length}</span>
          </Link>
          <Link
            to="/cart"
            className="flex items-center gap-1 bg-primary text-white px-3 py-2 rounded font-bold text-sm hover:bg-primary-hover transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="badge">{totalItems}</span>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary">
        {/* Mobile Menu Button */}
        <div className="max-w-6xl mx-auto px-4 flex md:hidden items-center justify-between py-2">
          <span className="text-white font-bold">MENU</span>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-1">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Nav */}
        <div className={`max-w-6xl mx-auto ${menuOpen ? 'block' : 'hidden'} md:flex`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block md:inline-block text-white px-5 py-3 text-sm font-bold hover:bg-black/10 transition-colors ${link.style || ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
