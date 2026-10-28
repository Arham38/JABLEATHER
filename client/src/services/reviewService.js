import { mockReviews } from '../data/mockReviews';
import { storage } from '../utils/storage';

const LOCAL_REVIEWS_KEY = 'jab_user_reviews';

export const reviewService = {
  getProductReviews: async (productId) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const local = storage.get(LOCAL_REVIEWS_KEY, []);
    const all = [...local, ...mockReviews];
    return all.filter((r) => !productId || r.productId === productId);
  },

  submitReview: async (reviewData) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newRev = {
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      verifiedPurchase: true,
      isDemoData: true,
      ...reviewData,
    };
    const local = storage.get(LOCAL_REVIEWS_KEY, []);
    storage.set(LOCAL_REVIEWS_KEY, [newRev, ...local]);
    return newRev;
  },

  getAllReviews: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const local = storage.get(LOCAL_REVIEWS_KEY, []);
    return [...local, ...mockReviews];
  },
};

export default reviewService;
