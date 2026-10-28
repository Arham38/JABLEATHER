import React, { Suspense, lazy } from 'react';
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

// Core Storefront Pages (Eagerly loaded for fastest First Contentful Paint)
import HomePage from './pages/storefront/HomePage';
import ShopPage from './pages/storefront/ShopPage';
import ProductDetailPage from './pages/storefront/ProductDetailPage';
import CartPage from './pages/storefront/CartPage';

// Code-Split Storefront Pages (Lazy loaded on demand)
const CategoryPage = lazy(() => import('./pages/storefront/CategoryPage'));
const CollectionPage = lazy(() => import('./pages/storefront/CollectionPage'));
const GenderPage = lazy(() => import('./pages/storefront/GenderPage'));
const CheckoutPage = lazy(() => import('./pages/storefront/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/storefront/CheckoutSuccessPage'));
const SandboxPaymentPage = lazy(() => import('./pages/storefront/SandboxPaymentPage'));
const AboutPage = lazy(() => import('./pages/storefront/AboutPage'));
const ContactPage = lazy(() => import('./pages/storefront/ContactPage'));
const UnsubscribePage = lazy(() => import('./pages/storefront/UnsubscribePage'));
const SearchPage = lazy(() => import('./pages/storefront/SearchPage'));
const NotFoundPage = lazy(() => import('./pages/storefront/NotFoundPage'));

// Code-Split Customer Portal Pages
const LoginPage = lazy(() => import('./pages/customer/LoginPage'));
const SignUpPage = lazy(() => import('./pages/customer/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/customer/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/customer/ResetPasswordPage'));
const AccountLayout = lazy(() => import('./pages/customer/AccountLayout'));
const AccountDashboard = lazy(() => import('./pages/customer/AccountDashboard'));
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const AddressesPage = lazy(() => import('./pages/customer/AddressesPage'));
const WishlistPage = lazy(() => import('./pages/customer/WishlistPage'));
const SettingsPage = lazy(() => import('./pages/customer/SettingsPage'));

// Code-Split Admin Layout & Operations Suite
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductEditPage = lazy(() => import('./pages/admin/AdminProductEditPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminCollectionsPage = lazy(() => import('./pages/admin/AdminCollectionsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminSubscribersPage = lazy(() => import('./pages/admin/AdminSubscribersPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminHomepageCmsPage = lazy(() => import('./pages/admin/AdminHomepageCmsPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'));
const AdminCatalogPage = lazy(() => import('./pages/admin/AdminCatalogPage'));
const AdminShippingPage = lazy(() => import('./pages/admin/AdminShippingPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-2 border-stone-800 border-t-amber-600 rounded-full animate-spin" />
    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">JAB LEATHER</span>
  </div>
);

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
                <Suspense fallback={<PageLoader />}>
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
                </Suspense>
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
