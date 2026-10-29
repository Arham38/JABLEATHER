import { storage } from '../utils/storage';
import supabase from '../utils/supabase';
import { BASELINE_PRODUCTS } from '../data/baselineCatalog';

const getStorageKey = (customerId) => (customerId ? `jab_cart_${customerId}` : null);

// Eradicate any legacy unauthenticated cart key to prevent stale ghost items
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('jab_shopping_cart');
  } catch {}
}

export const cartService = {
  // Get raw stored cart items (strictly scoped to authenticated customer)
  getCart: (customerId) => {
    const key = getStorageKey(customerId);
    if (!key) return [];
    return storage.get(key, []);
  },

  // Save minimal cart items to storage (strictly scoped to authenticated customer)
  saveCart: (items, customerId) => {
    const key = getStorageKey(customerId);
    if (!key) return [];
    const minimal = (items || []).map((item) => ({
      productId: item.productId || item.id,
      size: item.size || 'Standard',
      color: item.color || '',
      quantity: Number(item.quantity) || 1,
    }));
    storage.set(key, minimal);
    return minimal;
  },

  clearCart: (customerId) => {
    const key = getStorageKey(customerId);
    if (key) {
      storage.remove(key);
    }
    // Also ensure legacy key is cleaned
    storage.remove('jab_shopping_cart');
    return [];
  },

  // Re-validates raw cart items against current catalog in Supabase
  // Returns hydrated items with verified prices, stock, active status, and change notices
  revalidateCart: async (rawItems) => {
    if (!rawItems || rawItems.length === 0) {
      return { hydratedItems: [], notices: [] };
    }

    const notices = [];
    const productIds = Array.from(new Set(rawItems.map((i) => i.productId || i.id).filter(Boolean)));

    if (productIds.length === 0) {
      return { hydratedItems: [], notices: [] };
    }

    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, slug, sku, price, sale_price, stock, status, images, currency')
        .in('id', productIds);

      if (error) throw error;

      const productMap = new Map((products || []).map((p) => [p.id, p]));
      const hydrated = [];

      for (const raw of rawItems) {
        const prodId = raw.productId || raw.id;
        const product = productMap.get(prodId);
        const selectedSize = raw.size || 'Standard';
        const selectedColor = raw.color || '';
        const cartItemId = `${prodId}-${selectedSize}-${selectedColor}`.replace(/\s+/g, '-');

        if (!product || product.status !== 'active') {
          notices.push({
            type: 'out_of_stock',
            message: `"${raw.name || 'An item'}" is no longer available and was removed from your bag.`,
          });
          continue; // Dropped from active cart
        }

        const effectivePrice = product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price)
          ? Number(product.sale_price)
          : Number(product.price);

        const availableStock = Number(product.stock) || 0;
        let finalQuantity = Number(raw.quantity) || 1;

        if (availableStock <= 0) {
          notices.push({
            type: 'out_of_stock',
            message: `"${product.name}" is currently sold out and was removed from your bag.`,
          });
          continue;
        }

        if (finalQuantity > availableStock) {
          notices.push({
            type: 'stock_adjusted',
            message: `Quantity for "${product.name}" was adjusted to available atelier stock (${availableStock}).`,
          });
          finalQuantity = availableStock;
        }

        if (raw.price && Number(raw.price) !== effectivePrice) {
          notices.push({
            type: 'price_changed',
            message: `Price for "${product.name}" updated to $${effectivePrice.toFixed(2)}.`,
          });
        }

        hydrated.push({
          cartItemId,
          id: product.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku || '',
          price: effectivePrice,
          compareAtPrice: product.sale_price ? Number(product.price) : null,
          currency: product.currency || 'USD',
          image: product.images?.[0] || raw.image || '',
          size: selectedSize,
          color: selectedColor,
          quantity: finalQuantity,
          stockCount: availableStock,
          inStock: availableStock > 0,
        });
      }

      return { hydratedItems: hydrated, notices };
    } catch (err) {
      console.warn('Cart re-validation notice:', err.message);
      // Fallback: cross-reference against baseline catalog and drop non-existent ghost items
      const baselineMap = new Map((BASELINE_PRODUCTS || []).map((p) => [p.id, p]));
      const fallback = [];

      for (const raw of rawItems) {
        const prodId = raw.productId || raw.id;
        const base = baselineMap.get(prodId) || (BASELINE_PRODUCTS || []).find((p) => p.legacyId === prodId || p.slug === raw.slug);
        if (base && base.status === 'active') {
          const selectedSize = raw.size || 'Standard';
          const selectedColor = raw.color || '';
          fallback.push({
            cartItemId: raw.cartItemId || `${base.id}-${selectedSize}-${selectedColor}`.replace(/\s+/g, '-'),
            id: base.id,
            productId: base.id,
            name: base.name,
            slug: base.slug,
            sku: base.sku || '',
            price: Number(base.price) || 0,
            compareAtPrice: base.compareAtPrice ? Number(base.compareAtPrice) : null,
            currency: base.currency || 'USD',
            image: base.images?.[0] || '',
            size: selectedSize,
            color: selectedColor,
            quantity: Math.min(Number(raw.quantity) || 1, base.stockCount || 10),
            stockCount: base.stockCount || 10,
            inStock: (base.stockCount || 10) > 0,
          });
        }
      }
      return { hydratedItems: fallback, notices: [] };
    }
  },
};

export default cartService;
