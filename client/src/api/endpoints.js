/**
 * Centralized API endpoints constants.
 * Designed to seamlessly connect to a future backend.
 */

export const ENDPOINTS = {
  // Public Storefront
  PRODUCTS: '/api/products',
  PRODUCT_BY_SLUG: (slug) => `/api/products/${slug}`,
  CATEGORIES: '/api/categories',
  CATEGORY_BY_SLUG: (slug) => `/api/categories/${slug}`,
  COLLECTIONS: '/api/collections',
  COLLECTION_BY_SLUG: (slug) => `/api/collections/${slug}`,
  SEARCH: '/api/search',
  REVIEWS: '/api/reviews',
  COUPONS_VALIDATE: '/api/coupons/validate',
  NEWSLETTER: '/api/newsletter/subscribe',
  CONTACT: '/api/contact',
  CATALOG_DOWNLOAD: '/api/catalog/download',

  // Customer Authentication & Account
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/api/auth/reset-password',
  CUSTOMER_PROFILE: '/api/customer/profile',
  CUSTOMER_ORDERS: '/api/customer/orders',
  CUSTOMER_ORDER_BY_ID: (id) => `/api/customer/orders/${id}`,
  CUSTOMER_ADDRESSES: '/api/customer/addresses',
  CUSTOMER_WISHLIST: '/api/customer/wishlist',

  // Checkout & Orders
  CHECKOUT_PROCESS: '/api/checkout',
  ORDERS: '/api/orders',

  // Admin Portal
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_ANALYTICS: '/api/admin/analytics',
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_CATEGORIES: '/api/admin/categories',
  ADMIN_COLLECTIONS: '/api/admin/collections',
  ADMIN_ORDERS: '/api/admin/orders',
  ADMIN_CUSTOMERS: '/api/admin/customers',
  ADMIN_REVIEWS: '/api/admin/reviews',
  ADMIN_COUPONS: '/api/admin/coupons',
  ADMIN_HOMEPAGE: '/api/admin/homepage',
  ADMIN_MEDIA: '/api/admin/media',
  ADMIN_SETTINGS: '/api/admin/settings',
};
