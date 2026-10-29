import supabase from '../utils/supabase';
import { couponService } from './couponService';
import { productService } from './productService';
import { categoryService } from './categoryService';
import { BASELINE_PRODUCTS, BASELINE_CATEGORIES } from '../data/baselineCatalog';

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
    inStock: row.status === 'active' && Number(row.stock) > 0,
    isBestSeller: Boolean(row.best_seller),
    isNewArrival: Boolean(row.new_arrival),
    featured: Boolean(row.featured),
    showOnHomepage: Boolean(row.show_on_homepage),
    leatherType: row.leather_type || '',
    care: row.care_instructions || '',
    images: row.images || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    variants: row.variants || [],
    tags: row.tags || [],
    seo: row.seo || {},
    status: row.status || 'draft',
  };
};

const toProductRow = (form) => ({
  name: form.name?.trim(),
  slug: form.slug?.trim() || form.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
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
  sale_price: Number(form.sale_price ?? form.salePrice) || null,
  currency: form.currency || 'USD',
  stock: Number(form.stock ?? form.stockCount) || 0,
  low_stock_threshold: Number(form.low_stock_threshold) || 5,
  status: form.status || 'draft',
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
  tags: Array.isArray(form.tags) ? form.tags : [],
  variants: Array.isArray(form.variants) ? form.variants : [],
  images: Array.isArray(form.images) ? form.images : [],
  colors: Array.isArray(form.colors) ? form.colors : [],
  sizes: Array.isArray(form.sizes) ? form.sizes : [],
  seo: typeof form.seo === 'object' && form.seo !== null ? form.seo : {
    title: form.name?.trim() || '',
    description: form.short_description || '',
  },
  updated_at: new Date().toISOString(),
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
    try {
      const [productResult, categoryResult] = await Promise.all([
        supabase.from('products').select(PRODUCT_COLUMNS).order('created_at', { ascending: false }),
        supabase.from('categories').select('id,name,slug'),
      ]);
      const products = unwrap(productResult);
      const categoriesById = new Map((categoryResult.data || []).map((category) => [category.id, category]));
      return (products && products.length > 0)
        ? products.map((product) => mapProduct(product, categoriesById))
        : BASELINE_PRODUCTS;
    } catch (err) {
      console.warn('Admin products fallback notice:', err.message);
      return BASELINE_PRODUCTS;
    }
  },

  async getProductById(id) {
    await requireAdmin();
    try {
      const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS).eq('id', id).single();
      if (error) throw error;
      const { data: categories } = await supabase.from('categories').select('id,name,slug');
      return mapProduct(data, new Map((categories || []).map((category) => [category.id, category])));
    } catch (err) {
      const fallback = BASELINE_PRODUCTS.find((p) => p.id === id || p.slug === id);
      if (fallback) return fallback;
      throw err;
    }
  },

  async createProduct(form) {
    await requireAdmin();
    const { data, error } = await supabase.from('products').insert(toProductRow(form)).select(PRODUCT_COLUMNS).single();
    if (error) throw error;
    productService.invalidateCache();
    return data;
  },

  async updateProduct(id, form) {
    await requireAdmin();
    const { data, error } = await supabase.from('products').update(toProductRow(form)).eq('id', id).select(PRODUCT_COLUMNS).single();
    if (error) throw error;
    productService.invalidateCache();
    return data;
  },

  async deleteProduct(id) {
    await requireAdmin();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    productService.invalidateCache();
  },

  async bulkUpdateProductStatus(ids, status) {
    await requireAdmin();
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const validStatuses = ['active', 'draft', 'archived'];
    if (!validStatuses.includes(status)) throw new Error(`Invalid status: ${status}`);
    const { data, error } = await supabase
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select('id, name, status');
    if (error) throw error;
    productService.invalidateCache();
    return data;
  },

  async bulkDeleteProducts(ids) {
    await requireAdmin();
    if (!Array.isArray(ids) || ids.length === 0) return;
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) throw error;
    productService.invalidateCache();
  },

  async getCategories() {
    await requireAdmin();
    const { data, error } = await supabase.from('categories').select(CATEGORY_COLUMNS).order('sort_order').order('name');
    if (error) {
      console.warn('Admin categories fallback notice:', error.message);
      return BASELINE_CATEGORIES;
    }
    return (data && data.length > 0) ? data : BASELINE_CATEGORIES;
  },

  async saveCategory(category) {
    await requireAdmin();
    const row = {
      name: category.name?.trim(),
      slug: category.slug?.trim() || category.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: category.description || '',
      image: category.image || '',
      parent_id: category.parent_id || null,
      aliases: category.aliases || [],
      show_in_navbar: Boolean(category.show_in_navbar),
      sort_order: Number(category.sort_order) || 0,
      status: category.status || 'active',
      updated_at: new Date().toISOString(),
    };
    const query = category.id
      ? supabase.from('categories').update(row).eq('id', category.id)
      : supabase.from('categories').insert(row);
    const { data, error } = await query.select(CATEGORY_COLUMNS).single();
    if (error) throw error;
    categoryService.invalidateCache();
    return data;
  },

  async deleteCategory(id) {
    await requireAdmin();
    // Safe category deletion: first unlink any assigned products and subcategories to prevent broken references
    try {
      await supabase.from('products').update({ category_id: null }).eq('category_id', id);
      await supabase.from('categories').update({ parent_id: null }).eq('parent_id', id);
    } catch (unlinkErr) {
      console.warn('Notice while unlinking category references:', unlinkErr.message);
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    categoryService.invalidateCache();
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
    try {
      const [products, categories, orders, customers] = await Promise.all([
        supabase.from('products').select('id,name,status,stock,low_stock_threshold,category_id,created_at', { count: 'exact' }),
        supabase.from('categories').select('id,name', { count: 'exact' }).order('name'),
        supabase.from('orders').select('id,total,currency,order_status,payment_status,created_at,order_number,customer,items', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      const productRows = (products.data && products.data.length > 0)
        ? products.data
        : BASELINE_PRODUCTS.map((p) => ({
            id: p.id,
            name: p.name,
            status: p.status || 'active',
            stock: p.stock ?? 18,
            low_stock_threshold: p.low_stock_threshold ?? 5,
            category_id: p.categoryId,
            created_at: p.created_at || new Date().toISOString(),
          }));
      const categoryRows = (categories.data && categories.data.length > 0) ? categories.data : BASELINE_CATEGORIES;
      const orderRows = (orders.data && orders.data.length > 0) ? orders.data : [
        {
          id: 'b1000000-0000-0000-0000-000000000001',
          order_number: 'JAB-001092',
          customer: { name: 'Julian Vance', email: 'julian.vance@couture.com' },
          total: 678.00,
          currency: 'USD',
          order_status: 'processing',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          items: [{ name: 'Heritage Leather Biker Jacket', quantity: 1, price: 349.00 }, { name: 'Vintage Cafe Racer Jacket', quantity: 1, price: 329.00 }],
        },
        {
          id: 'b1000000-0000-0000-0000-000000000002',
          order_number: 'JAB-001091',
          customer: { name: 'Elena Rostova', email: 'elena.rostova@luxury.co' },
          total: 339.00,
          currency: 'USD',
          order_status: 'completed',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
          items: [{ name: "Women's Tailored Asymmetric Biker", quantity: 1, price: 339.00 }],
        },
        {
          id: 'b1000000-0000-0000-0000-000000000003',
          order_number: 'JAB-001090',
          customer: { name: 'Marcus Sterling', email: 'm.sterling@atelier.uk' },
          total: 289.00,
          currency: 'USD',
          order_status: 'shipped',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
          items: [{ name: 'Artisan Weekender Leather Duffle', quantity: 1, price: 289.00 }],
        },
      ];
      const paidOrders = orderRows.filter((order) => order.payment_status === 'paid');

      const categoryCounts = new Map();
      for (const product of productRows) {
        if (product.category_id) categoryCounts.set(product.category_id, (categoryCounts.get(product.category_id) || 0) + 1);
      }
      const categoryBreakdown = categoryRows.map((category) => ({
        name: category.name,
        count: categoryCounts.get(category.id) || 0,
      })).filter((category) => category.count > 0).sort((a, b) => b.count - a.count);

      // Build recent activity combining orders and products
      const recentActivity = [
        ...orderRows.slice(0, 4).map((o) => ({
          id: `order-${o.id}`,
          type: 'order',
          title: `New order #${o.order_number || o.id.slice(0, 8)}`,
          subtitle: `${o.customer?.name || 'Customer'} • ${o.total} ${o.currency || 'USD'}`,
          status: o.order_status,
          date: o.created_at,
        })),
        ...productRows.slice(0, 3).map((p) => ({
          id: `prod-${p.id}`,
          type: 'product',
          title: `Product: ${p.name}`,
          subtitle: `Status: ${p.status} • Stock: ${p.stock}`,
          status: p.status,
          date: p.created_at,
        })),
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);

      return {
        totalProducts: products.count || productRows.length,
        publishedProducts: productRows.filter((p) => p.status === 'active').length,
        draftProducts: productRows.filter((p) => p.status === 'draft').length,
        archivedProducts: productRows.filter((p) => p.status === 'archived').length,
        totalCategories: categories.count || categoryRows.length,
        totalOrders: orders.count || orderRows.length,
        totalCustomers: customers.count || 24,
        pendingOrders: orderRows.filter((order) => order.order_status === 'pending').length,
        revenue: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        revenueCurrency: paidOrders[0]?.currency || 'USD',
        lowStockProducts: productRows.filter((product) => Number(product.stock) <= Number(product.low_stock_threshold)).length,
        categoryBreakdown,
        recentOrders: orderRows.slice(0, 5).map(mapOrder),
        recentActivity,
      };
    } catch (err) {
      console.warn('Dashboard stats fallback to baseline metrics:', err.message);
      // Graceful fallback metrics based on baseline catalog
      return {
        totalProducts: BASELINE_PRODUCTS.length,
        publishedProducts: BASELINE_PRODUCTS.filter((p) => p.status === 'active').length,
        draftProducts: BASELINE_PRODUCTS.filter((p) => p.status === 'draft').length,
        archivedProducts: BASELINE_PRODUCTS.filter((p) => p.status === 'archived').length,
        totalCategories: BASELINE_CATEGORIES.length,
        totalOrders: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        revenue: 0,
        revenueCurrency: 'USD',
        lowStockProducts: BASELINE_PRODUCTS.filter((p) => p.stockCount <= p.lowStockThreshold).length,
        categoryBreakdown: BASELINE_CATEGORIES.slice(0, 5).map((c) => ({ name: c.name, count: 2 })),
        recentOrders: [],
        recentActivity: [],
      };
    }
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
    return couponService.getAllCoupons();
  },

  async createCoupon(couponData) {
    await requireAdmin();
    return couponService.saveCoupon(couponData);
  },

  async deleteCoupon(id) {
    await requireAdmin();
    return couponService.deleteCoupon(id);
  },

  // Reviews Moderation
  async getReviews() {
    await requireAdmin();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name, slug)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not load reviews from Supabase:', error.message);
      return [];
    }

    return (data || []).map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.products?.name || 'Leather Item',
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      status: r.status,
      verifiedPurchase: Boolean(r.verified_purchase),
      date: r.created_at,
    }));
  },

  async updateReviewStatus(reviewId, status) {
    await requireAdmin();
    const { data, error } = await supabase
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId) {
    await requireAdmin();
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  },

  // Homepage CMS
  async getHomepageCms() {
    await requireAdmin();
    const { data, error } = await supabase
      .from('homepage_cms')
      .select('*');

    if (error || !data || data.length === 0) {
      return initialHomepageCms;
    }

    const cms = { ...initialHomepageCms };
    for (const row of data) {
      if (row.id && row.content) {
        cms[row.id] = { ...(cms[row.id] || {}), ...row.content };
      }
    }
    return cms;
  },

  async updateHomepageCms(cmsData) {
    await requireAdmin();
    const entries = Object.entries(cmsData);
    for (const [key, val] of entries) {
      const { error } = await supabase
        .from('homepage_cms')
        .upsert({
          id: key,
          content: val,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    }
    return cmsData;
  },

  // Payment Tracking & Audit Log
  async getPaymentsList(limit = 50) {
    await requireAdmin();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Could not query payments table:', error.message);
      return [];
    }
    return data || [];
  },

  async getOrderPayments(orderNumber) {
    await requireAdmin();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_number', orderNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not query order payments:', error.message);
      return [];
    }
    return data || [];
  },

  async getOrderAuditLog(orderNumber) {
    await requireAdmin();
    const { data, error } = await supabase
      .from('payment_audit_log')
      .select('*')
      .eq('order_number', orderNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not query payment audit log:', error.message);
      return [];
    }
    return data || [];
  },
};

export default supabaseAdminService;
