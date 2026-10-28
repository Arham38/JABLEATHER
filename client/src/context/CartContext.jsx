import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { shippingService } from '../services/shippingService';
import { useCurrency } from './CurrencyContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = cartService.getCart();
    return Array.isArray(saved) ? saved : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { freeShippingThreshold, currency } = useCurrency();
  const toast = useToast();

  // Revalidate items against live Supabase catalog
  const revalidate = useCallback(async (currentItems) => {
    if (!currentItems || currentItems.length === 0) return;
    setIsValidating(true);
    try {
      const { hydratedItems, notices } = await cartService.revalidateCart(currentItems);
      setItems(hydratedItems);

      // Notify customer if any prices changed or items were adjusted/sold out
      for (const notice of notices) {
        if (notice.type === 'out_of_stock') {
          toast.warning(notice.message);
        } else if (notice.type === 'stock_adjusted') {
          toast.info(notice.message);
        } else if (notice.type === 'price_changed') {
          toast.info(notice.message);
        }
      }
    } catch (err) {
      console.warn('Revalidation check skipped:', err);
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  // Initial load: read saved cart and re-validate against catalog
  useEffect(() => {
    const saved = cartService.getCart();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      let isMounted = true;
      cartService.revalidateCart(saved).then(({ hydratedItems, notices }) => {
        if (!isMounted) return;
        setItems(hydratedItems);
        for (const notice of notices) {
          if (notice.type === 'out_of_stock') {
            toast.warning(notice.message);
          } else if (notice.type === 'stock_adjusted') {
            toast.info(notice.message);
          } else if (notice.type === 'price_changed') {
            toast.info(notice.message);
          }
        }
      }).catch((err) => {
        console.warn('Cart initialization skipped:', err);
      });
      return () => {
        isMounted = false;
      };
    }
  }, [toast]);

  // Save to storage on update
  useEffect(() => {
    cartService.saveCart(items);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Dynamic free shipping threshold from store settings
  const freeShippingRemaining = useMemo(() => {
    return Math.max(0, freeShippingThreshold - subtotal);
  }, [subtotal, freeShippingThreshold]);

  const freeShippingProgress = useMemo(() => {
    if (!freeShippingThreshold || freeShippingThreshold <= 0) return 100;
    return Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  }, [subtotal, freeShippingThreshold]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountAmount || 0;
  }, [appliedCoupon]);

  const shippingFee = useMemo(() => {
    if (appliedCoupon?.freeShipping || appliedCoupon?.discountType === 'shipping') return 0;
    return shippingService.computeShippingFee(subtotal, 'standard', freeShippingThreshold);
  }, [subtotal, appliedCoupon, freeShippingThreshold]);

  const total = useMemo(() => {
    const calculated = subtotal - discount + shippingFee;
    return Math.max(0, Number(calculated.toFixed(2)));
  }, [subtotal, discount, shippingFee]);

  // Immutable addToCart: new object for changed items, strictly capped by stockCount
  const addToCart = useCallback((product, { size = null, color = null, quantity = 1 } = {}) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const selectedColor =
      typeof color === 'string'
        ? color
        : color?.name || (product.colors && product.colors[0]?.name) || '';

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`.replace(/\s+/g, '-');
    const rawStock = product.stockCount ?? product.stock;
    const availableStock = (rawStock !== undefined && rawStock !== null && !isNaN(Number(rawStock)))
      ? Number(rawStock)
      : 10;

    if (availableStock <= 0) {
      toast.error(`"${product.name}" is currently out of stock.`);
      return;
    }

    const existing = items.find((item) => item.cartItemId === cartItemId);
    if (existing) {
      if (existing.quantity >= availableStock) {
        toast.warning(`Maximum available stock (${availableStock}) already in your bag.`);
        return;
      }
      const requestedTotal = existing.quantity + quantity;
      const newQty = Math.min(requestedTotal, availableStock);
      if (newQty < requestedTotal) {
        toast.info(`Added ${newQty - existing.quantity} more. Reached maximum stock limit of ${availableStock}.`);
      } else {
        toast.success(`Updated ${product.name} quantity to ${newQty}`);
      }

      setItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: newQty, stockCount: availableStock }
            : item
        )
      );
    } else {
      const initialQty = Math.min(quantity, availableStock);
      const effectivePrice = product.salePrice && Number(product.salePrice) > 0 && Number(product.salePrice) < product.price
        ? Number(product.salePrice)
        : Number(product.price);

      const newItem = {
        cartItemId,
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku || '',
        price: effectivePrice,
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        currency: product.currency || 'USD',
        image: product.images?.[0] || '',
        size: selectedSize,
        color: selectedColor,
        quantity: initialQty,
        stockCount: availableStock,
        inStock: true,
      };

      toast.success(`Added ${product.name} (${selectedSize}) to bag`);
      setItems((prev) => [...prev, newItem]);
    }

    setIsCartOpen(true);
  }, [items, toast]);

  const removeFromCart = useCallback((cartItemId) => {
    const target = items.find((i) => i.cartItemId === cartItemId);
    if (target) {
      toast.info(`Removed ${target.name} from bag`);
    }
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }, [items, toast]);

  const updateQuantity = useCallback((cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const target = items.find((item) => item.cartItemId === cartItemId);
    if (!target) return;

    const maxStock = target.stockCount || 99;
    if (newQty > maxStock) {
      toast.warning(`Only ${maxStock} items available in stock.`);
      setItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: maxStock } : item
        )
      );
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  }, [items, removeFromCart, toast]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    cartService.clearCart();
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    // Re-verify prices and stock whenever cart is opened
    if (items.length > 0) {
      revalidate(items);
    }
  }, [items, revalidate]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => {
      if (!prev && items.length > 0) {
        revalidate(items);
      }
      return !prev;
    });
  }, [items, revalidate]);

  const applyCoupon = useCallback(async (code) => {
    setIsCouponLoading(true);
    try {
      const result = await couponService.validateCoupon(code, subtotal);
      setAppliedCoupon(result);
      toast.success(`Coupon ${result.code} applied!`);
      return result;
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
      throw err;
    } finally {
      setIsCouponLoading(false);
    }
  }, [subtotal, toast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  }, [toast]);

  const value = useMemo(() => ({
    items,
    itemCount,
    subtotal,
    discount,
    shippingFee,
    total,
    currency,
    freeShippingRemaining,
    freeShippingProgress,
    appliedCoupon,
    isCouponLoading,
    isValidating,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    revalidateCart: () => revalidate(items),
  }), [
    items,
    itemCount,
    subtotal,
    discount,
    shippingFee,
    total,
    currency,
    freeShippingRemaining,
    freeShippingProgress,
    appliedCoupon,
    isCouponLoading,
    isValidating,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    revalidate,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
