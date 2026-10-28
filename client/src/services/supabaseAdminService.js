import supabase from '../utils/supabase';
import { storage } from '../utils/storage';
import { mockCoupons } from '../data/mockCoupons';
import { mockReviews } from '../data/mockReviews';

const ADMIN_COUPONS_KEY = 'jab_admin_coupons';
const ADMIN_REVIEWS_KEY = 'jab_admin_reviews';
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

const PRODUCT_COLUMNS = 'id,legacy_id,name,slug,short_description,description,gender,material,leather_type,lining,closure,fit,care_instructions,seo,price,sale_price,currency,stock,low_stock_threshold,status,featured,best_seller,new_arrival,show_on_homepage,homepage_order,category_id,subcategory_id,category_ids,subcategory_ids,collection_id,tags,variants,images,colors,sizes,sku,created_at,updated_at';
const CATEGORY_COLUMNS = 'id,legacy_id,name,slug,description,image,parent_id,aliases,show_in_navbar,sort_order,status,created_at,updated_at';
const CUSTOMER_COLUMNS = 'id,name,email,role,is_verified,created_at,updated_at';

const requireAdmin = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (data.user?.app_metadata?.role !== 'admin') {
    throw new Error('A Supabase Auth admin session is required.');
  }
  return data.user;
};

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const mapProduct = (row, categoriesById) => {
  const category = categoriesById.get(row.category_id) || null;
  const salePrice = Number(row.sale_price) || 0;
  return {
    ...row,
    price: Number(row.price) || 0,
    salePrice: salePrice || '',
    categoryId: row.category_id || '',
    subcategoryId: row.subcategory_id || '',
    category: category?.slug || '',
    categoryName: category?.name || '',
    stockCount: Number(row.stock) || 0,
    inStock: row.status === 'active',
    isBestSeller: Boolean(row.best_seller),
    isNewArrival: Boolean(row.new_arrival),
    featured: Boolean(row.featured),
    showOnHomepage: Boolean(row.show_on_homepage),
    leatherType: row.leather_type || '',
    care: row.care_instructions || '',
    images: row.images || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
  };
};

const toProductRow = (form) => ({
  name: form.name?.trim(),
  slug: form.slug?.trim(),
  sku: form.sku?.trim() || '',
  short_description: form.short_description ?? form.shortDescription ?? '',
  description: form.description || '',
  gender: form.gender || 'unisex',
  material: form.material || '',
  leather_type: form.leather_type ?? form.leatherType ?? '',
  lining: form.lining || '',
  closure: form.closure || '',
  fit: form.fit || '',
  care_instructions: form.care_instructions ?? form.care ?? '',
  price: Number(form.price) || 0,
  sale_price: Number(form.sale_price ?? form.salePrice) || 0,
  currency: form.currency || 'PKR',
  stock: Number(form.stock ?? form.stockCount) || 0,
  low_stock_threshold: Number(form.low_stock_threshold) || 5,
  status: form.status || (form.inStock ? 'active' : 'draft'),
  featured: Boolean(form.featured),
  best_seller: Boolean(form.best_seller ?? form.isBestSeller),
  new_arrival: Boolean(form.new_arrival ?? form.isNewArrival),
  show_on_homepage: Boolean(form.show_on_homepage ?? form.showOnHomepage),
  homepage_order: Number(form.homepage_order) || 0,
  category_id: form.category_id || form.categoryId || null,
  subcategory_id: form.subcategory_id || form.subcategoryId || null,
  category_ids: form.category_ids || [],
  subcategory_ids: form.subcategory_ids || [],
  collection_id: form.collection_id || null,
  tags: form.tags || [],
  variants: form.variants || [],
  images: form.images || [],
  colors: form.colors || [],
  sizes: form.sizes || [],
});

const mapOrder = (row) => ({
  ...row,
  id: row.order_number || row.id,
  databaseId: row.id,
  orderNumber: row.order_number,
  date: row.created_at,
  customer: row.customer || {},
  shippingAddress: row.shipping_address || {},
  items: row.items || [],
  shippingFee: Number(row.shipping) || 0,
  discount: Number(row.discount) || 0,
  tax: Number(row.tax) || 0,
  paymentStatus: row.payment_status || 'unpaid',
  orderStatus: row.order_status || 'pending',
  trackingNumber: row.payment_reference || '',
  total: Number(row.total) || 0,
  subtotal: Number(row.subtotal) || 0,
});

export const supabaseAdminService = {
  requireAdmin,

  async getProducts() {
    await requireAdmin();
    const [productResult, categoryResult] = await Promise.all([
      supabase.from('products').select(PRODUCT_COLUMNS).order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug'),
    ]);
    const products = unwrap(productResult);
    const categoriesById = new Map(unwrap(categoryResult).map((category) => [category.id, category]));
    return products.map((product) => mapProduct(product, categoriesById));
  },

  async getProductById(id) {
    await requireAdmin();
    const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS).eq('id', id).single();
    if (error) throw error;
    const { data: categories, error: categoryError } = await supabase.from('categories').select('id,name,slug');
    if (categoryError) throw categoryError;
    return mapProduct(data, new Map(categories.map((category) => [category.id, category])));
  },

  async createProduct(form) {
    await requireAdmin();
    const { data, error } = await supabase.from('products').insert(toProductRow(form)).select(PRODUCT_COLUMNS).single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id, form) {
    await requireAdmin();
    const { data, error } = await supabase.from('products').update(toProductRow(form)).eq('id', id).select(PRODUCT_COLUMNS).single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    await requireAdmin();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async getCategories() {
    await requireAdmin();
    const { data, error } = await supabase.from('categories').select(CATEGORY_COLUMNS).order('sort_order').order('name');
    return unwrap({ data, error });
  },

  async saveCategory(category) {
    await requireAdmin();
    const row = {
      name: category.name?.trim(),
      slug: category.slug?.trim(),
      description: category.description || '',
      image: category.image || '',
      parent_id: category.parent_id || null,
      aliases: category.aliases || [],
      show_in_navbar: Boolean(category.show_in_navbar),
      sort_order: Number(category.sort_order) || 0,
      status: category.status || 'active',
    };
    const query = category.id
      ? supabase.from('categories').update(row).eq('id', category.id)
      : supabase.from('categories').insert(row);
    const { data, error } = await query.select(CATEGORY_COLUMNS).single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id) {
    await requireAdmin();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async getOrders() {
    await requireAdmin();
    const { data, error } = await supabase.from('orders').select('id,order_number,customer,shipping_address,items,subtotal,shipping,tax,total,currency,payment_method,payment_provider,payment_transaction_id,payment_reference,payment_status,order_status,created_at,updated_at').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapOrder);
  },

  async getOrderById(orderIdentifier) {
    await requireAdmin();
    let query = supabase.from('orders').select('id,order_number,customer,shipping_address,items,subtotal,shipping,tax,total,currency,payment_method,payment_provider,payment_transaction_id,payment_reference,payment_status,order_status,created_at,updated_at');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
    if (isUuid) {
      query = query.eq('id', orderIdentifier);
    } else {
      query = query.eq('order_number', orderIdentifier);
    }
    const { data, error } = await query.single();
    if (error) throw error;
    return mapOrder(data);
  },

  async updateOrderStatus(orderIdentifier, status) {
    await requireAdmin();
    let query = supabase.from('orders').update({ order_status: status.toLowerCase() });
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
    if (isUuid) {
      query = query.eq('id', orderIdentifier);
    } else {
      query = query.eq('order_number', orderIdentifier);
    }
    const { data, error } = await query.select('id,order_number,customer,shipping_address,items,subtotal,shipping,tax,total,currency,payment_method,payment_provider,payment_transaction_id,payment_reference,payment_status,order_status,created_at,updated_at').single();
    if (error) throw error;
    return mapOrder(data);
  },

  async getCustomers() {
    await requireAdmin();
    const { data, error } = await supabase.from('users').select(CUSTOMER_COLUMNS).order('created_at', { ascending: false });
    return unwrap({ data, error });
  },

  async getDashboardStats() {
    await requireAdmin();
    const [products, categories, orders, customers] = await Promise.all([
      supabase.from('products').select('id,status,stock,low_stock_threshold,category_id', { count: 'exact' }),
      supabase.from('categories').select('id,name', { count: 'exact' }).order('name'),
      supabase.from('orders').select('id,total,currency,order_status,payment_status,created_at,order_number,customer,items', { count: 'exact' }).order('created_at', { ascending: false }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ]);
    for (const result of [products, categories, orders, customers]) if (result.error) throw result.error;
    const productRows = products.data || [];
    const orderRows = orders.data || [];
    const paidOrders = orderRows.filter((order) => order.payment_status === 'paid');
    const categoryCounts = new Map();
    for (const product of productRows) {
      if (product.category_id) categoryCounts.set(product.category_id, (categoryCounts.get(product.category_id) || 0) + 1);
    }
    const categoryBreakdown = (categories.data || []).map((category) => ({
      name: category.name,
      count: categoryCounts.get(category.id) || 0,
    })).filter((category) => category.count > 0).sort((a, b) => b.count - a.count);
    return {
      totalProducts: products.count || 0,
      activeProducts: productRows.filter((product) => product.status === 'active').length,
      totalCategories: categories.count || 0,
      totalOrders: orders.count || 0,
      totalCustomers: customers.count || 0,
      pendingOrders: orderRows.filter((order) => order.order_status === 'pending').length,
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      revenueCurrency: paidOrders[0]?.currency || 'PKR',
      lowStockProducts: productRows.filter((product) => Number(product.stock) <= Number(product.low_stock_threshold)).length,
      categoryBreakdown,
      recentOrders: orderRows.slice(0, 5).map(mapOrder),
    };
  },

  async uploadProductImage(file) {
    await requireAdmin();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  },

  async getMediaLibrary() {
    await requireAdmin();
    const { data, error } = await supabase.storage.from('product-images').list('', {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    return (data || []).filter((file) => file.id).map((file) => ({
      id: file.id,
      title: file.name,
      name: file.name,
      path: file.name,
      url: supabase.storage.from('product-images').getPublicUrl(file.name).data.publicUrl,
      size: file.metadata?.size ? `${(file.metadata.size / (1024 * 1024)).toFixed(1)} MB` : '',
      category: 'Product Images',
    }));
  },

  async deleteMediaObject(path) {
    await requireAdmin();
    const { error } = await supabase.storage.from('product-images').remove([path]);
    if (error) throw error;
  },

  async deleteProductImage(url) {
    await requireAdmin();
    const marker = '/storage/v1/object/public/product-images/';
    const index = url.indexOf(marker);
    if (index < 0) throw new Error('Image URL is not in the product-images bucket.');
    const path = decodeURIComponent(url.slice(index + marker.length));
    const { error } = await supabase.storage.from('product-images').remove([path]);
    if (error) throw error;
  },

  // Coupons Management
  async getCoupons() {
    await requireAdmin();
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch {
      // Fallback to local storage
    }
    return storage.get(ADMIN_COUPONS_KEY, mockCoupons);
  },

  async createCoupon(couponData) {
    await requireAdmin();
    try {
      const { data, error } = await supabase.from('coupons').insert(couponData).select().single();
      if (!error && data) return data;
    } catch {
      // Fallback to local storage
    }
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

  // Reviews Moderation
  async getReviews() {
    await requireAdmin();
    try {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch {
      // Fallback to local storage
    }
    return storage.get(ADMIN_REVIEWS_KEY, mockReviews);
  },

  async updateReviewStatus(reviewId, status) {
    await requireAdmin();
    try {
      const { data, error } = await supabase.from('reviews').update({ status }).eq('id', reviewId).select().single();
      if (!error && data) return data;
    } catch {
      // Fallback to local storage
    }
    const reviews = storage.get(ADMIN_REVIEWS_KEY, mockReviews);
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, status } : r));
    storage.set(ADMIN_REVIEWS_KEY, updated);
    return updated.find((r) => r.id === reviewId);
  },

  // Homepage CMS
  async getHomepageCms() {
    await requireAdmin();
    try {
      const { data, error } = await supabase.from('homepage_cms').select('*').single();
      if (!error && data?.content) return data.content;
    } catch {
      // Fallback to local storage
    }
    return storage.get(ADMIN_HOMEPAGE_CMS_KEY, initialHomepageCms);
  },

  async updateHomepageCms(cmsData) {
    await requireAdmin();
    try {
      const { error } = await supabase.from('homepage_cms').upsert({ id: 'main', content: cmsData, updated_at: new Date().toISOString() });
      if (!error) return cmsData;
    } catch {
      // Fallback to local storage
    }
    storage.set(ADMIN_HOMEPAGE_CMS_KEY, cmsData);
    return cmsData;
  },
};

export default supabaseAdminService;
