import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { shippingService } from '../services/shippingService';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const FREE_SHIPPING_THRESHOLD = 150.00;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const toast = useToast();

  // Load from local storage
  useEffect(() => {
    const saved = cartService.getCart();
    if (saved && Array.isArray(saved)) {
      setItems(saved);
    }
  }, []);

  // Save to local storage on update
  useEffect(() => {
    cartService.saveCart(items);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const freeShippingRemaining = useMemo(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  }, [subtotal]);

  const freeShippingProgress = useMemo(() => {
    return Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  }, [subtotal]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountAmount || 0;
  }, [appliedCoupon]);

  const shippingFee = useMemo(() => {
    if (appliedCoupon?.discountType === 'shipping') return 0;
    return shippingService.calculateShipping(subtotal);
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
    const calculated = subtotal - discount + shippingFee;
    return Math.max(0, Number(calculated.toFixed(2)));
  }, [subtotal, discount, shippingFee]);

  const addToCart = (product, { size = null, color = null, quantity = 1 } = {}) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const selectedColor =
      typeof color === 'string'
        ? color
        : color?.name || (product.colors && product.colors[0]?.name) || '';

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`.replace(/\s+/g, '-');

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem = {
          cartItemId,
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: product.currency || 'USD',
          image: product.images?.[0] || '',
          size: selectedSize,
          color: selectedColor,
          quantity: quantity,
          inStock: product.inStock,
        };
        return [...prev, newItem];
      }
    });

    toast.success(`Added ${product.name} (${selectedSize}) to bag`);
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    const target = items.find((i) => i.cartItemId === cartItemId);
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    if (target) {
      toast.info(`Removed ${target.name} from bag`);
    }
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    cartService.clearCart();
  };

  const applyCoupon = async (code) => {
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
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shippingFee,
        total,
        freeShippingRemaining,
        freeShippingProgress,
        appliedCoupon,
        isCouponLoading,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((v) => !v),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
