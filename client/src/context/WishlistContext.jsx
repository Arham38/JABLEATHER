import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = wishlistService.getWishlist();
    return Array.isArray(saved) ? saved : [];
  });
  const toast = useToast();

  useEffect(() => {
    wishlistService.saveWishlist(wishlistItems);
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    const exists = isInWishlist(product.id);
    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
      toast.info(`Removed ${product.name} from wishlist`);
    } else {
      setWishlistItems((prev) => [product, ...prev]);
      toast.success(`Saved ${product.name} to wishlist`);
    }
  };

  const removeFromWishlist = (productId) => {
    const target = wishlistItems.find((i) => i.id === productId);
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    if (target) {
      toast.info(`Removed ${target.name} from wishlist`);
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    wishlistService.clearWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
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
