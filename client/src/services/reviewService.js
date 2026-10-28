import supabase from '../utils/supabase';

export const reviewService = {
  // Get approved reviews for a specific product
  getProductReviews: async (productId) => {
    if (!productId) return [];

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r) => ({
        id: r.id,
        productId: r.product_id,
        author: r.customer_name,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString(),
        verifiedPurchase: Boolean(r.verified_purchase),
        status: r.status,
      }));
    } catch (err) {
      console.warn('Could not load reviews for product:', err.message);
      return [];
    }
  },

  // Check if authenticated user is eligible to review (verified purchase)
  checkEligibility: async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { eligible: false, reason: 'login_required', message: 'Please sign in to write a verified review.' };
    }

    try {
      // 1. Check if already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id, status')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingReview) {
        return {
          eligible: false,
          reason: 'already_reviewed',
          message: existingReview.status === 'pending'
            ? 'Your review has been submitted and is awaiting atelier approval.'
            : 'You have already reviewed this product.',
        };
      }

      // 2. Check if customer purchased this product
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, items, order_status')
        .eq('user_id', user.id);

      if (ordersError || !orders || orders.length === 0) {
        return {
          eligible: false,
          reason: 'no_purchase',
          message: 'Only verified purchasers of this item can leave a review.',
        };
      }

      let matchingOrder = null;
      for (const order of orders) {
        const items = Array.isArray(order.items) ? order.items : [];
        const match = items.find((i) => i.id === productId || i.productId === productId);
        if (match) {
          matchingOrder = order;
          break;
        }
      }

      if (!matchingOrder) {
        return {
          eligible: false,
          reason: 'no_purchase',
          message: 'Only verified purchasers of this item can leave a review.',
        };
      }

      return {
        eligible: true,
        orderId: matchingOrder.id,
        user,
      };
    } catch (err) {
      console.warn('Eligibility check notice:', err.message);
      return { eligible: false, reason: 'error', message: 'Unable to verify purchase history.' };
    }
  },

  // Submit verified review (sets status='pending' for admin moderation)
  submitReview: async ({ productId, rating, title, comment }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required to submit reviews.');
    }

    const eligibility = await reviewService.checkEligibility(productId);
    if (!eligibility.eligible) {
      throw new Error(eligibility.message);
    }

    const customerName = user.user_metadata?.name || user.email.split('@')[0];

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: eligibility.orderId || null,
        customer_name: customerName,
        customer_email: user.email,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        title: title?.trim() || 'Verified Experience',
        comment: comment?.trim() || '',
        status: 'pending',
        verified_purchase: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert review:', error);
      throw new Error(error.message || 'Review submission failed.');
    }

    return {
      id: data.id,
      productId: data.product_id,
      author: data.customer_name,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      date: new Date(data.created_at).toLocaleDateString(),
      verifiedPurchase: true,
      status: 'pending',
    };
  },

  // Fetch approved featured reviews for homepage
  getFeaturedReviews: async (limit = 3) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name, slug)')
        .eq('status', 'approved')
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((r) => ({
        id: r.id,
        productName: r.products?.name || 'Heritage Jacket',
        author: r.customer_name,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString(),
      }));
    } catch {
      return [];
    }
  },
};

export default reviewService;
