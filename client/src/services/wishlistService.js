import { storage } from '../utils/storage';

const getStorageKey = (customerId) => (customerId ? `jab_wishlist_${customerId}` : null);

// Eradicate any legacy unauthenticated wishlist key to prevent lingering counts
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('jab_user_wishlist');
  } catch {}
}

export const wishlistService = {
  // Get raw stored wishlist items (strictly scoped to authenticated customer)
  getWishlist: (customerId) => {
    const key = getStorageKey(customerId);
    if (!key) return [];
    return storage.get(key, []);
  },

  // Save wishlist items to storage (strictly scoped to authenticated customer)
  saveWishlist: (items, customerId) => {
    const key = getStorageKey(customerId);
    if (!key) return [];
    storage.set(key, items || []);
    return items || [];
  },

  clearWishlist: (customerId) => {
    const key = getStorageKey(customerId);
    if (key) {
      storage.remove(key);
    }
    storage.remove('jab_user_wishlist');
    return [];
  },
};

export default wishlistService;
