const express = require('express');
const router = express.Router();
const { supabaseAdmin, supabase } = require('../supabaseClient');

// Helper to authenticate Admin requests via Supabase Auth JWT token
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication token is required to access admin catalog operations.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const client = supabaseAdmin || supabase;
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired session token.',
      });
    }

    if (user.app_metadata?.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: Admin privileges required.',
      });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Authentication error: ${err.message}`,
    });
  }
};

// Optional admin detector (sets req.isAdmin = true if token is valid admin, otherwise leaves false)
const optionalAdmin = async (req, res, next) => {
  req.isAdmin = false;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const client = supabaseAdmin || supabase;
      const { data: { user }, error } = await client.auth.getUser(token);
      if (!error && user && user.app_metadata?.role === 'admin') {
        req.isAdmin = true;
        req.adminUser = user;
      }
    } catch {
      // Ignore token decode failure for public routes
    }
  }
  next();
};

// ==========================================
// 1. PRODUCTS ENDPOINTS
// ==========================================

// GET /api/catalog/products
router.get('/products', optionalAdmin, async (req, res) => {
  try {
    const {
      search,
      category,
      gender,
      status,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const client = supabaseAdmin || supabase;
    let query = client
      .from('products')
      .select('*, categories(id, name, slug)', { count: 'exact' });

    // Public users can ONLY see active products
    if (!req.isAdmin) {
      query = query.eq('status', 'active');
    } else if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (gender && gender !== 'all') {
      query = query.eq('gender', gender);
    }

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,slug.ilike.%${q}%,short_description.ilike.%${q}%`);
    }

    // Sorting
    switch (sort) {
      case 'price-low-high':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high-low':
        query = query.order('price', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    query = query.range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return res.json({
      status: 'success',
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/catalog/products/:idOrSlug
router.get('/products/:idOrSlug', optionalAdmin, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const client = supabaseAdmin || supabase;
    let query = client
      .from('products')
      .select('*, categories(id, name, slug)');

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      return res.status(404).json({ status: 'error', message: 'Product not found.' });
    }

    // Public users cannot see draft or archived products
    if (!req.isAdmin && data.status !== 'active') {
      return res.status(404).json({ status: 'error', message: 'Product not found.' });
    }

    return res.json({ status: 'success', data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/catalog/products (Admin Only)
router.post('/products', authenticateAdmin, async (req, res) => {
  try {
    const form = req.body;
    if (!form.name || !form.name.trim()) {
      return res.status(400).json({ status: 'error', message: 'Product name is required.' });
    }

    const price = Number(form.price);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ status: 'error', message: 'Price must be a non-negative number.' });
    }

    const stock = Number(form.stock ?? form.stockCount ?? 0);
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ status: 'error', message: 'Stock must be a non-negative number.' });
    }

    const slug = form.slug?.trim() || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const validStatuses = ['active', 'draft', 'archived'];
    const status = validStatuses.includes(form.status) ? form.status : 'draft';

    const productRow = {
      name: form.name.trim(),
      slug,
      sku: form.sku?.trim() || `JAB-${Date.now().toString(36).toUpperCase()}`,
      short_description: form.short_description || form.shortDescription || '',
      description: form.description || '',
      gender: ['men', 'women', 'unisex'].includes(form.gender) ? form.gender : 'unisex',
      material: form.material || 'Genuine Full-Grain Leather',
      leather_type: form.leather_type || form.leatherType || 'Cowhide',
      lining: form.lining || 'Quilted Satin / Cotton',
      closure: form.closure || 'Heavy-Duty YKK Zipper',
      fit: form.fit || 'Regular Fit',
      care_instructions: form.care_instructions || form.care || 'Professional leather clean only',
      price,
      sale_price: Number(form.sale_price ?? form.salePrice) || null,
      currency: form.currency || 'USD',
      stock,
      low_stock_threshold: Number(form.low_stock_threshold) || 3,
      status,
      featured: Boolean(form.featured),
      best_seller: Boolean(form.best_seller ?? form.isBestSeller),
      new_arrival: Boolean(form.new_arrival ?? form.isNewArrival),
      show_on_homepage: Boolean(form.show_on_homepage ?? form.showOnHomepage),
      category_id: form.category_id || form.categoryId || null,
      subcategory_id: form.subcategory_id || form.subcategoryId || null,
      tags: Array.isArray(form.tags) ? form.tags : [],
      variants: Array.isArray(form.variants) ? form.variants : [],
      images: Array.isArray(form.images) ? form.images : [],
      colors: Array.isArray(form.colors) ? form.colors : [],
      sizes: Array.isArray(form.sizes) ? form.sizes : ['S', 'M', 'L', 'XL'],
      seo: typeof form.seo === 'object' && form.seo !== null ? form.seo : {
        title: form.name.trim(),
        description: form.short_description || '',
      },
      updated_at: new Date().toISOString(),
    };

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('products')
      .insert(productRow)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ status: 'error', message: 'A product with this slug or SKU already exists.' });
      }
      throw error;
    }

    return res.status(201).json({ status: 'success', data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT /api/catalog/products/:id (Admin Only)
router.put('/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const form = req.body;

    const updates = {};
    if (form.name !== undefined) updates.name = form.name.trim();
    if (form.slug !== undefined) updates.slug = form.slug.trim();
    if (form.sku !== undefined) updates.sku = form.sku.trim();
    if (form.short_description !== undefined || form.shortDescription !== undefined) {
      updates.short_description = form.short_description ?? form.shortDescription;
    }
    if (form.description !== undefined) updates.description = form.description;
    if (form.gender !== undefined) updates.gender = form.gender;
    if (form.material !== undefined) updates.material = form.material;
    if (form.leather_type !== undefined || form.leatherType !== undefined) {
      updates.leather_type = form.leather_type ?? form.leatherType;
    }
    if (form.lining !== undefined) updates.lining = form.lining;
    if (form.closure !== undefined) updates.closure = form.closure;
    if (form.fit !== undefined) updates.fit = form.fit;
    if (form.care_instructions !== undefined || form.care !== undefined) {
      updates.care_instructions = form.care_instructions ?? form.care;
    }
    if (form.price !== undefined) updates.price = Number(form.price);
    if (form.sale_price !== undefined || form.salePrice !== undefined) {
      updates.sale_price = Number(form.sale_price ?? form.salePrice) || null;
    }
    if (form.stock !== undefined || form.stockCount !== undefined) {
      updates.stock = Number(form.stock ?? form.stockCount);
    }
    if (form.low_stock_threshold !== undefined) {
      updates.low_stock_threshold = Number(form.low_stock_threshold);
    }
    if (form.status !== undefined) {
      const validStatuses = ['active', 'draft', 'archived'];
      if (validStatuses.includes(form.status)) updates.status = form.status;
    }
    if (form.featured !== undefined) updates.featured = Boolean(form.featured);
    if (form.best_seller !== undefined || form.isBestSeller !== undefined) {
      updates.best_seller = Boolean(form.best_seller ?? form.isBestSeller);
    }
    if (form.new_arrival !== undefined || form.isNewArrival !== undefined) {
      updates.new_arrival = Boolean(form.new_arrival ?? form.isNewArrival);
    }
    if (form.show_on_homepage !== undefined || form.showOnHomepage !== undefined) {
      updates.show_on_homepage = Boolean(form.show_on_homepage ?? form.showOnHomepage);
    }
    if (form.category_id !== undefined || form.categoryId !== undefined) {
      updates.category_id = form.category_id || form.categoryId || null;
    }
    if (form.subcategory_id !== undefined || form.subcategoryId !== undefined) {
      updates.subcategory_id = form.subcategory_id || form.subcategoryId || null;
    }
    if (form.tags !== undefined) updates.tags = form.tags;
    if (form.variants !== undefined) updates.variants = form.variants;
    if (form.images !== undefined) updates.images = form.images;
    if (form.colors !== undefined) updates.colors = form.colors;
    if (form.sizes !== undefined) updates.sizes = form.sizes;
    if (form.seo !== undefined) updates.seo = form.seo;

    updates.updated_at = new Date().toISOString();

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ status: 'success', data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/catalog/products/bulk (Admin Only Bulk Actions)
router.post('/products/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Product IDs array is required.' });
    }

    const client = supabaseAdmin || supabase;

    if (action === 'delete') {
      const { error } = await client.from('products').delete().in('id', ids);
      if (error) throw error;
      return res.json({ status: 'success', message: `Successfully deleted ${ids.length} products.` });
    }

    let nextStatus = null;
    if (action === 'publish') nextStatus = 'active';
    else if (action === 'draft') nextStatus = 'draft';
    else if (action === 'archive') nextStatus = 'archived';

    if (!nextStatus) {
      return res.status(400).json({ status: 'error', message: `Invalid bulk action: ${action}` });
    }

    const { data, error } = await client
      .from('products')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select('id, name, status');

    if (error) throw error;
    return res.json({
      status: 'success',
      message: `Updated status of ${data.length} products to ${nextStatus}.`,
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /api/catalog/products/:id (Admin Only)
router.delete('/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) throw error;

    return res.json({ status: 'success', message: 'Product deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 2. CATEGORIES ENDPOINTS
// ==========================================

// GET /api/catalog/categories
router.get('/categories', optionalAdmin, async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    let query = client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!req.isAdmin) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ status: 'success', data: data || [] });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/catalog/categories (Admin Only)
router.post('/categories', authenticateAdmin, async (req, res) => {
  try {
    const form = req.body;
    if (!form.name || !form.name.trim()) {
      return res.status(400).json({ status: 'error', message: 'Category name is required.' });
    }

    const slug = form.slug?.trim() || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const row = {
      name: form.name.trim(),
      slug,
      description: form.description || '',
      image: form.image || '',
      parent_id: form.parent_id || null,
      show_in_navbar: form.show_in_navbar !== undefined ? Boolean(form.show_in_navbar) : true,
      sort_order: Number(form.sort_order) || 0,
      status: ['active', 'inactive', 'draft', 'archived'].includes(form.status) ? form.status : 'active',
      aliases: Array.isArray(form.aliases) ? form.aliases : [],
      updated_at: new Date().toISOString(),
    };

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('categories')
      .insert(row)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ status: 'error', message: 'A category with this slug already exists.' });
      }
      throw error;
    }

    return res.status(201).json({ status: 'success', data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT /api/catalog/categories/:id (Admin Only)
router.put('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const form = req.body;

    const updates = {};
    if (form.name !== undefined) updates.name = form.name.trim();
    if (form.slug !== undefined) updates.slug = form.slug.trim();
    if (form.description !== undefined) updates.description = form.description;
    if (form.image !== undefined) updates.image = form.image;
    if (form.parent_id !== undefined) updates.parent_id = form.parent_id || null;
    if (form.show_in_navbar !== undefined) updates.show_in_navbar = Boolean(form.show_in_navbar);
    if (form.sort_order !== undefined) updates.sort_order = Number(form.sort_order);
    if (form.status !== undefined) updates.status = form.status;
    if (form.aliases !== undefined) updates.aliases = form.aliases;
    updates.updated_at = new Date().toISOString();

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ status: 'success', data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /api/catalog/categories/:id (Admin Only Safe Deletion)
router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;

    // Safe deletion: first unlink any products pointing to this category to prevent broken references
    await client
      .from('products')
      .update({ category_id: null })
      .eq('category_id', id);

    // Also unlink subcategories
    await client
      .from('categories')
      .update({ parent_id: null })
      .eq('parent_id', id);

    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) throw error;

    return res.json({
      status: 'success',
      message: 'Category deleted safely. Associated products have been unassigned without data loss.',
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
