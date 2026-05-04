import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import CategoryProductsPage from './pages/CategoryProductsPage';
import Promotions from './pages/Promotions';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminProducts   from './pages/admin/AdminProducts';
import AdminOrders     from './pages/admin/AdminOrders';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminNews       from './pages/admin/AdminNews';
import AdminPromotions from './pages/admin/AdminPromotions';

function App() {
  return (
    <Routes>
      {/* ── Public / User routes ────────────────────── */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />

        {/* Category pages */}
        <Route path="rackets"     element={<CategoryProductsPage categoryKey="rackets" />} />
        <Route path="shoes"       element={<CategoryProductsPage categoryKey="shoes" />} />
        <Route path="clothing"    element={<CategoryProductsPage categoryKey="clothing" />} />
        <Route path="accessories" element={<CategoryProductsPage categoryKey="accessories" />} />

        {/* Promotions & News */}
        <Route path="promotions" element={<Promotions />} />
        <Route path="news"       element={<News />} />
        <Route path="news/:slug" element={<NewsDetail />} />

        {/* Protected user routes */}
        <Route path="profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="orders"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      </Route>

      {/* ── Admin routes ────────────────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index             element={<AdminDashboard />} />
        <Route path="products"   element={<AdminProducts />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="users"      element={<AdminUsers />} />
        <Route path="news"       element={<AdminNews />} />
        <Route path="promotions" element={<AdminPromotions />} />
      </Route>
    </Routes>
  );
}

export default App;
