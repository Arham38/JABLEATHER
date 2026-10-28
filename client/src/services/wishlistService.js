import { storage } from '../utils/storage';

const WISHLIST_KEY = 'jab_user_wishlist';

export const wishlistService = {
  getWishlist: () => {
    return storage.get(WISHLIST_KEY, []);
  },

  saveWishlist: (items) => {
    storage.set(WISHLIST_KEY, items);
    return items;
  },

  clearWishlist: () => {
    storage.remove(WISHLIST_KEY);
    return [];
  },
};

export default wishlistService;
