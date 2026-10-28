import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts & Utilities
import ScrollToTop from './components/common/ScrollToTop';
import StorefrontLayout from './components/layout/StorefrontLayout';
import AdminLayout from './components/admin/AdminLayout';

// Storefront Pages
import HomePage from './pages/storefront/HomePage';
import ShopPage from './pages/storefront/ShopPage';
import CategoryPage from './pages/storefront/CategoryPage';
import CollectionPage from './pages/storefront/CollectionPage';
import GenderPage from './pages/storefront/GenderPage';
import ProductDetailPage from './pages/storefront/ProductDetailPage';
import CartPage from './pages/storefront/CartPage';
import CheckoutPage from './pages/storefront/CheckoutPage';
import CheckoutSuccessPage from './pages/storefront/CheckoutSuccessPage';
import SandboxPaymentPage from './pages/storefront/SandboxPaymentPage';
import AboutPage from './pages/storefront/AboutPage';
import ContactPage from './pages/storefront/ContactPage';
import UnsubscribePage from './pages/storefront/UnsubscribePage';
import SearchPage from './pages/storefront/SearchPage';
import NotFoundPage from './pages/storefront/NotFoundPage';

// Customer Portal Pages
import LoginPage from './pages/customer/LoginPage';
import SignUpPage from './pages/customer/SignUpPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import ResetPasswordPage from './pages/customer/ResetPasswordPage';
import AccountLayout from './pages/customer/AccountLayout';
import AccountDashboard from './pages/customer/AccountDashboard';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ProfilePage from './pages/customer/ProfilePage';
import AddressesPage from './pages/customer/AddressesPage';
import WishlistPage from './pages/customer/WishlistPage';
import SettingsPage from './pages/customer/SettingsPage';

// Admin Operations Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductEditPage from './pages/admin/AdminProductEditPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCollectionsPage from './pages/admin/AdminCollectionsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminSubscribersPage from './pages/admin/AdminSubscribersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminHomepageCmsPage from './pages/admin/AdminHomepageCmsPage';
import AdminMediaPage from './pages/admin/AdminMediaPage';
import AdminCatalogPage from './pages/admin/AdminCatalogPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminShippingPage from './pages/admin/AdminShippingPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <UIProvider>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                <ScrollToTop />
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route element={<StorefrontLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="category/:slug" element={<CategoryPage />} />
                    <Route path="collection/:slug" element={<CollectionPage />} />
                    <Route path="collections/:slug" element={<CollectionPage />} />
                    
                    {/* Navigation shortcuts */}
                    <Route path="men" element={<GenderPage gender="men" />} />
                    <Route path="women" element={<GenderPage gender="women" />} />
                    <Route path="gender/:gender" element={<GenderPage />} />
                    <Route path="best-sellers" element={<CollectionPage forcedSlug="best-sellers" />} />
                    <Route path="new-arrivals" element={<CollectionPage forcedSlug="new-arrivals" />} />
                    
                    {/* Product & Conversion */}
                    <Route path="product/:slug" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="checkout/success" element={<CheckoutSuccessPage />} />
                    <Route path="sandbox-payment" element={<SandboxPaymentPage />} />
                    
                    {/* Informational */}
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="unsubscribe" element={<UnsubscribePage />} />
                    <Route path="search" element={<SearchPage />} />

                    {/* Customer Auth Pages within Storefront */}
                    <Route path="account/login" element={<LoginPage />} />
                    <Route path="account/signup" element={<SignUpPage />} />
                    <Route path="account/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="account/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected / Managed Customer Account Portal */}
                    <Route path="account" element={<AccountLayout />}>
                      <Route index element={<AccountDashboard />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="orders/:id" element={<OrderDetailPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="addresses" element={<AddressesPage />} />
                      <Route path="wishlist" element={<WishlistPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin Auth */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Admin Dashboard & Management Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="products/new" element={<AdminProductEditPage />} />
                    <Route path="products/:id" element={<AdminProductEditPage />} />
                    <Route path="products/:id/edit" element={<AdminProductEditPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="collections" element={<AdminCollectionsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="messages" element={<AdminMessagesPage />} />
                    <Route path="subscribers" element={<AdminSubscribersPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="homepage" element={<AdminHomepageCmsPage />} />
                    <Route path="media" element={<AdminMediaPage />} />
                    <Route path="catalog" element={<AdminCatalogPage />} />
                    <Route path="shipping" element={<AdminShippingPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </UIProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
