import { mockOrders } from '../data/mockOrders';
import { storage } from '../utils/storage';

const LOCAL_ORDERS_KEY = 'jab_placed_orders';

export const orderService = {
  createOrder: async (orderData) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newOrder = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
      ...orderData,
    };

    const existing = storage.get(LOCAL_ORDERS_KEY, []);
    storage.set(LOCAL_ORDERS_KEY, [newOrder, ...existing]);

    return newOrder;
  },

  getOrderById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const local = storage.get(LOCAL_ORDERS_KEY, []);
    const found = local.find((o) => o.id === id) || mockOrders.find((o) => o.id === id);
    if (!found) throw new Error(`Order #${id} not found`);
    return found;
  },

  getAllOrders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const local = storage.get(LOCAL_ORDERS_KEY, []);
    return [...local, ...mockOrders];
  },
};

export default orderService;
