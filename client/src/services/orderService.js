import supabase from '../utils/supabase';

export const mapOrderRow = (row) => ({
  id: row.order_number || row.id,
  databaseId: row.id,
  orderNumber: row.order_number,
  date: row.created_at,
  customer: row.customer || {},
  shippingAddress: row.shipping_address || {},
  items: row.items || [],
  subtotal: Number(row.subtotal) || 0,
  discount: Number(row.discount) || 0,
  shippingFee: Number(row.shipping) || 0,
  tax: Number(row.tax) || 0,
  total: Number(row.total) || 0,
  currency: row.currency || 'USD',
  paymentMethod: row.payment_method || 'card',
  paymentProvider: row.payment_provider || 'manual',
  paymentStatus: row.payment_status || 'unpaid',
  orderStatus: row.order_status || 'pending',
  trackingNumber: row.payment_reference || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const orderService = {
  // Places order via secure Postgres RPC function `create_order`
  // Recomputes prices server-side, validates active products and stock, and atomic stock decrement
  createOrder: async (orderData) => {
    // Sanitize item list: send ONLY product id, size, color, quantity
    const itemsPayload = (orderData.items || []).map((item) => ({
      productId: item.id || item.productId,
      size: item.size || 'Standard',
      color: item.color || '',
      quantity: Number(item.quantity) || 1,
    }));

    const payload = {
      items: itemsPayload,
      customer: {
        name: orderData.customer?.name || '',
        email: orderData.customer?.email || '',
        phone: orderData.customer?.phone || '',
      },
      shippingAddress: {
        address: orderData.shippingAddress?.address || '',
        city: orderData.shippingAddress?.city || '',
        state: orderData.shippingAddress?.state || '',
        postalCode: orderData.shippingAddress?.postalCode || '',
        country: orderData.shippingAddress?.country || 'United States',
      },
      paymentMethod: orderData.paymentMethod || 'card',
      couponCode: orderData.couponCode || null,
      currency: orderData.currency || 'USD',
    };

    const { data, error } = await supabase.rpc('create_order', { payload });

    if (error) {
      console.error('Failed to create order via RPC:', error);
      throw new Error(error.message || 'Unable to complete order. Please try again.');
    }

    return data;
  },

  // Lookup order by order number or id (and optional email for guest verification)
  getOrderById: async (orderIdentifier, email = null) => {
    if (!orderIdentifier) throw new Error('Order number is required.');

    // 1. Try standard query if authenticated user
    let query = supabase.from('orders').select('*');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
    if (isUuid) {
      query = query.eq('id', orderIdentifier);
    } else {
      query = query.eq('order_number', orderIdentifier);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      return mapOrderRow(data);
    }

    // 2. If guest or not found via user RLS, try safe RPC get_guest_order
    if (email) {
      const { data: guestOrder, error: guestError } = await supabase
        .rpc('get_guest_order', {
          p_order_number: orderIdentifier,
          p_email: email.trim(),
        });

      if (!guestError && guestOrder) {
        return guestOrder;
      }
    }

    throw new Error(`Order #${orderIdentifier} not found.`);
  },

  // Customer order history
  getAllOrders: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders:', error.message);
      return [];
    }

    return (data || []).map(mapOrderRow);
  },
};

export default orderService;
