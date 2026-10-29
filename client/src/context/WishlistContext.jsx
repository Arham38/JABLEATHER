import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { AuthContext } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const customer = auth?.customer;
  const customerId = customer?.id;
  const isAuthenticated = !!customer;

  // Wishlist items strictly empty unless customer is authenticated
  const [wishlistItems, setWishlistItems] = useState(() => {
    return customerId ? wishlistService.getWishlist(customerId) : [];
  });
  const toast = useToast();

  // Load customer-scoped wishlist whenever authentication state changes
  useEffect(() => {
    if (!customerId) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const saved = wishlistService.getWishlist(customerId);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setWishlistItems(saved);
      }
    });
    return () => {
      active = false;
    };
  }, [customerId]);

  // Clear wishlist upon user signout
  useEffect(() => {
    const handleAuthLogout = () => {
      setWishlistItems([]);
      wishlistService.clearWishlist(customerId);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('jab:auth:logout', handleAuthLogout);
      return () => {
        window.removeEventListener('jab:auth:logout', handleAuthLogout);
      };
    }
  }, [customerId]);

  // Save to customer-scoped storage on update
  useEffect(() => {
    if (customerId) {
      wishlistService.saveWishlist(wishlistItems, customerId);
    }
  }, [wishlistItems, customerId]);

  const isInWishlist = useCallback((productId) => {
    if (!customerId) return false;
    return wishlistItems.some((item) => item.id === productId);
  }, [wishlistItems, customerId]);

  const toggleWishlist = useCallback((product) => {
    if (!customerId) {
      toast.warning('Please sign in to your account to save items to your wishlist.');
      if (typeof window !== 'undefined') {
        window.location.href = '/account/login';
      }
      return false;
    }

    const exists = wishlistItems.some((item) => item.id === product.id);
    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
      toast.info(`Removed ${product.name} from wishlist`);
      return false;
    } else {
      setWishlistItems((prev) => [product, ...prev]);
      toast.success(`Saved ${product.name} to wishlist`);
      return true;
    }
  }, [wishlistItems, customerId, toast]);

  const removeFromWishlist = useCallback((productId) => {
    const target = wishlistItems.find((i) => i.id === productId);
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    if (target) {
      toast.info(`Removed ${target.name} from wishlist`);
    }
  }, [wishlistItems, toast]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    wishlistService.clearWishlist(customerId);
  }, [customerId]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: customerId ? wishlistItems : [],
        wishlistCount: customerId ? wishlistItems.length : 0,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isAuthenticated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
