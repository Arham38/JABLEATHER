import { storage } from '../utils/storage';

const CART_KEY = 'jab_shopping_cart';

export const cartService = {
  getCart: () => {
    return storage.get(CART_KEY, []);
  },

  saveCart: (cartItems) => {
    storage.set(CART_KEY, cartItems);
    return cartItems;
  },

  clearCart: () => {
    storage.remove(CART_KEY);
    return [];
  },
};

export default cartService;
