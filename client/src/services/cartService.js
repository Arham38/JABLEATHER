import { storage } from '../utils/storage';
import supabase from '../utils/supabase';

const CART_KEY = 'jab_shopping_cart';

export const cartService = {
  // Get raw stored cart items (minimal references: productId, size, color, quantity)
  getCart: () => {
    return storage.get(CART_KEY, []);
  },

  // Save minimal cart items to storage
  saveCart: (items) => {
    const minimal = (items || []).map((item) => ({
      productId: item.productId || item.id,
      size: item.size || 'Standard',
      color: item.color || '',
      quantity: Number(item.quantity) || 1,
    }));
    storage.set(CART_KEY, minimal);
    return minimal;
  },

  clearCart: () => {
    storage.remove(CART_KEY);
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
      // Graceful fallback: return raw items as hydrated if offline or staging schema mismatch
      const fallback = rawItems.map((raw) => ({
        cartItemId: raw.cartItemId || `${raw.productId || raw.id}-${raw.size}-${raw.color}`.replace(/\s+/g, '-'),
        id: raw.productId || raw.id,
        productId: raw.productId || raw.id,
        name: raw.name || 'Leather Item',
        slug: raw.slug || '',
        sku: raw.sku || '',
        price: Number(raw.price) || 0,
        compareAtPrice: raw.compareAtPrice ? Number(raw.compareAtPrice) : null,
        currency: raw.currency || 'USD',
        image: raw.image || '',
        size: raw.size || 'Standard',
        color: raw.color || '',
        quantity: Number(raw.quantity) || 1,
        stockCount: raw.stockCount || 10,
        inStock: true,
      }));
      return { hydratedItems: fallback, notices: [] };
    }
  },
};

export default cartService;
