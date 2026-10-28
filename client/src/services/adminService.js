import { mockProducts } from '../data/mockProducts';
import { mockCategories } from '../data/mockCategories';
import { mockOrders } from '../data/mockOrders';
import { mockCustomers } from '../data/mockCustomers';
import { mockReviews } from '../data/mockReviews';
import { mockCoupons } from '../data/mockCoupons';
import { storage } from '../utils/storage';

const ADMIN_PRODUCTS_KEY = 'jab_admin_products';
const ADMIN_ORDERS_KEY = 'jab_admin_orders';
const ADMIN_CATEGORIES_KEY = 'jab_admin_categories';
const ADMIN_REVIEWS_KEY = 'jab_admin_reviews';
const ADMIN_COUPONS_KEY = 'jab_admin_coupons';
const ADMIN_HOMEPAGE_CMS_KEY = 'jab_admin_homepage_cms';

const initialHomepageCms = {
  hero: {
    enabled: true,
    title: 'Premium Leather Jackets, Made for You',
    subtitle: 'Genuine leather products crafted with attention to detail, quality materials, and timeless style.',
    desktopImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1920&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85',
    primaryButtonText: 'Shop Men',
    secondaryButtonText: 'Shop Women',
  },
  shopByCategory: { enabled: true, title: 'Shop By Category' },
  bestSellers: { enabled: true, title: 'Best Sellers' },
  newArrivals: { enabled: true, title: 'New Arrivals' },
  editorialBanner: {
    enabled: true,
    title: 'Made for the Road. Designed for Everyday.',
    subtitle: 'From cross-country open highways to midnight city streets, our full-grain jackets weather every storm.',
    ctaText: 'Explore Collection',
    image: 'https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=1600&q=85',
  },
  featuredCollection: {
    enabled: true,
    title: 'The Leather Collection',
    description: 'Explore timeless leather styles for everyday wear, riding, travel, and modern fashion.',
    ctaText: 'Explore Collection',
  },
  whyChooseUs: { enabled: true, title: 'Why Choose JAB Leather' },
  workshopStory: { enabled: true, title: 'From Leather to Finished Product' },
  customWholesale: { enabled: true, title: 'Custom & Wholesale Leather Manufacturing' },
  catalogCta: { enabled: true, title: 'Explore Our Leather Catalog' },
  gallery: { enabled: true, title: 'Behind JAB Leather' },
  reviews: { enabled: true, title: 'What Our Customers Say' },
  newsletter: { enabled: true, title: 'Stay Updated' },
  socialSection: { enabled: true, title: 'Follow JAB Leather' },
};

export const adminService = {
  // Products CRUD
  getProducts: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADMIN_PRODUCTS_KEY, mockProducts);
  },

  getProductById: async (id) => {
    const products = storage.get(ADMIN_PRODUCTS_KEY, mockProducts);
    const prod = products.find((p) => p.id === id);
    if (!prod) throw new Error(`Product ${id} not found`);
    return prod;
  },

  createProduct: async (productData) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const products = storage.get(ADMIN_PRODUCTS_KEY, mockProducts);
    const newProduct = {
      id: 'prod-' + Math.floor(1000 + Math.random() * 9000),
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: 'JAB-' + Math.floor(100 + Math.random() * 900),
      rating: 5.0,
      reviewCount: 0,
      images: productData.images?.length
        ? productData.images
        : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85'],
      ...productData,
    };
    const updated = [newProduct, ...products];
    storage.set(ADMIN_PRODUCTS_KEY, updated);
    return newProduct;
  },

  updateProduct: async (id, updates) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const products = storage.get(ADMIN_PRODUCTS_KEY, mockProducts);
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    storage.set(ADMIN_PRODUCTS_KEY, updated);
    return updated.find((p) => p.id === id);
  },

  deleteProduct: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const products = storage.get(ADMIN_PRODUCTS_KEY, mockProducts);
    const updated = products.filter((p) => p.id !== id);
    storage.set(ADMIN_PRODUCTS_KEY, updated);
    return true;
  },

  // Categories CRUD
  getCategories: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADMIN_CATEGORIES_KEY, mockCategories);
  },

  saveCategory: async (categoryData) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const categories = storage.get(ADMIN_CATEGORIES_KEY, mockCategories);
    let updated;
    if (categoryData.id) {
      updated = categories.map((c) => (c.id === categoryData.id ? { ...c, ...categoryData } : c));
    } else {
      updated = [
        ...categories,
        {
          id: 'cat-' + Date.now(),
          slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          ...categoryData,
        },
      ];
    }
    storage.set(ADMIN_CATEGORIES_KEY, updated);
    return updated;
  },

  deleteCategory: async (id) => {
    const categories = storage.get(ADMIN_CATEGORIES_KEY, mockCategories);
    const updated = categories.filter((c) => c.id !== id);
    storage.set(ADMIN_CATEGORIES_KEY, updated);
    return updated;
  },

  // Orders Management
  getOrders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADMIN_ORDERS_KEY, mockOrders);
  },

  updateOrderStatus: async (orderId, status) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const orders = storage.get(ADMIN_ORDERS_KEY, mockOrders);
    const updated = orders.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o));
    storage.set(ADMIN_ORDERS_KEY, updated);
    return updated.find((o) => o.id === orderId);
  },

  // Customers Management
  getCustomers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockCustomers;
  },

  // Reviews Moderation
  getReviews: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADMIN_REVIEWS_KEY, mockReviews);
  },

  updateReviewStatus: async (reviewId, status) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const reviews = storage.get(ADMIN_REVIEWS_KEY, mockReviews);
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, status } : r));
    storage.set(ADMIN_REVIEWS_KEY, updated);
    return updated.find((r) => r.id === reviewId);
  },

  // Coupons Management
  getCoupons: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADMIN_COUPONS_KEY, mockCoupons);
  },

  createCoupon: async (couponData) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const coupons = storage.get(ADMIN_COUPONS_KEY, mockCoupons);
    const newCoupon = {
      id: 'coup-' + Date.now(),
      usageCount: 0,
      isActive: true,
      ...couponData,
    };
    const updated = [newCoupon, ...coupons];
    storage.set(ADMIN_COUPONS_KEY, updated);
    return newCoupon;
  },

  // Homepage CMS
  getHomepageCms: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADMIN_HOMEPAGE_CMS_KEY, initialHomepageCms);
  },

  updateHomepageCms: async (cmsData) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    storage.set(ADMIN_HOMEPAGE_CMS_KEY, cmsData);
    return cmsData;
  },
};

export default adminService;
