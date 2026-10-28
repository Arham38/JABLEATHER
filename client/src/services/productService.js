import supabase from '../utils/supabase';
import { categoryService } from './categoryService';

const PRODUCT_COLUMNS = [
  'id', 'legacy_id', 'name', 'slug', 'short_description', 'description',
  'gender', 'material', 'leather_type', 'lining', 'closure', 'fit',
  'care_instructions', 'price', 'sale_price', 'currency', 'stock',
  'low_stock_threshold', 'status', 'featured', 'best_seller', 'new_arrival',
  'show_on_homepage', 'homepage_order', 'category_id', 'subcategory_id',
  'category_ids', 'subcategory_ids', 'collection_id', 'tags', 'variants',
  'images', 'colors', 'sizes', 'sku', 'created_at', 'updated_at',
].join(',');

const normalizeColor = (color) => {
  if (color && typeof color === 'object') return color;

  const name = String(color || '');
  const isCssColor = /^(#[\da-f]{3,8}|rgb\(|hsl\()/i.test(name);
  return { name, hex: isCssColor ? name : null };
};

const mapProduct = (row, categoriesById) => {
  const categoryIds = [
    row.category_id,
    row.subcategory_id,
    ...(row.category_ids || []),
    ...(row.subcategory_ids || []),
  ].filter(Boolean);
  const productCategories = [...new Set(categoryIds)]
    .map((id) => categoriesById.get(id))
    .filter(Boolean);
  const primaryCategory = categoriesById.get(row.category_id) || productCategories[0];
  const basePrice = Number(row.price) || 0;
  const salePrice = Number(row.sale_price) || 0;
  const hasSalePrice = salePrice > 0 && salePrice < basePrice;

  return {
    id: row.id,
    legacyId: row.legacy_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku || '',
    price: hasSalePrice ? salePrice : basePrice,
    compareAtPrice: hasSalePrice ? basePrice : null,
    currency: row.currency || 'USD',
    category: primaryCategory?.slug || '',
    categoryId: row.category_id,
    categoryIds,
    categorySlugs: productCategories.map((category) => category.slug),
    categoryName: primaryCategory?.name || '',
    gender: row.gender || 'unisex',
    isBestSeller: Boolean(row.best_seller),
    isNewArrival: Boolean(row.new_arrival),
    featured: Boolean(row.featured || row.show_on_homepage),
    inStock: Number(row.stock) > 0,
    stockCount: Number(row.stock) || 0,
    lowStockThreshold: Number(row.low_stock_threshold) || 0,
    rating: null,
    reviewCount: 0,
    material: row.material || '',
    leatherType: row.leather_type || '',
    lining: row.lining || '',
    closure: row.closure || '',
    fit: row.fit || '',
    care: row.care_instructions || '',
    shortDescription: row.short_description || '',
    description: row.description || row.short_description || '',
    images: row.images || [],
    sizes: row.sizes || [],
    colors: (row.colors || []).map(normalizeColor),
    tags: row.tags || [],
    variants: row.variants || [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const fetchActiveProducts = async () => {
  const [{ data, error }, categories] = await Promise.all([
    supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    categoryService.getCategories(),
  ]);

  if (error) throw new Error(`Could not load products: ${error.message}`);

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  return (data || []).map((row) => mapProduct(row, categoriesById));
};

/**
 * Product Service
 * Centralized service layer for product querying, filtering, and retrieval.
 */
export const productService = {
  // Get all products with optional filters and sorting
  getProducts: async ({
    category = null,
    gender = null,
    search = '',
    sort = 'featured',
    minPrice = 0,
    maxPrice = Infinity,
    leatherType = null,
    inStockOnly = false,
    page = 1,
    limit = 12,
  } = {}) => {
    let filtered = await fetchActiveProducts();
    const currency = filtered[0]?.currency || 'USD';

    if (category && category !== 'all') {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
          || p.categorySlugs.includes(category.toLowerCase())
      );
    }

    if (gender && gender !== 'all') {
      filtered = filtered.filter(
        (p) => p.gender === gender || p.gender === 'unisex'
      );
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (minPrice > 0) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }

    if (maxPrice < Infinity) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    if (leatherType) {
      filtered = filtered.filter((p) =>
        p.leatherType.toLowerCase().includes(leatherType.toLowerCase())
      );
    }

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Sorting
    switch (sort) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'best-selling':
        filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    return {
      products: paginatedProducts,
      total,
      currency,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  },

  getProductBySlug: async (slug) => {
    const products = await fetchActiveProducts();
    const product = products.find((p) => p.slug === slug);
    if (!product) throw new Error(`Product not found with slug: ${slug}`);
    return product;
  },

  getProductById: async (id) => {
    const products = await fetchActiveProducts();
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error(`Product not found with id: ${id}`);
    return product;
  },

  getBestSellers: async (limit = 8) => {
    return (await fetchActiveProducts()).filter((p) => p.isBestSeller).slice(0, limit);
  },

  getNewArrivals: async (limit = 8) => {
    return (await fetchActiveProducts()).filter((p) => p.isNewArrival).slice(0, limit);
  },

  getFeatured: async (limit = 8) => {
    return (await fetchActiveProducts()).filter((p) => p.featured).slice(0, limit);
  },

  getRelatedProducts: async (productId, limit = 4) => {
    const products = await fetchActiveProducts();
    const current = products.find((p) => p.id === productId);
    if (!current) return [];
    return products
      .filter((p) => p.id !== productId && (p.category === current.category || p.gender === current.gender))
      .slice(0, limit);
  },
};

export default productService;
