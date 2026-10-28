/**
 * Mock Analytics for Admin Dashboard.
 * Structured cleanly to be swapped with backend API analytics later.
 */

export const mockAnalytics = {
  overview: {
    totalRevenue: 48920.00,
    revenueChangePct: 14.8,
    totalOrders: 158,
    ordersChangePct: 8.2,
    totalCustomers: 124,
    customersChangePct: 18.5,
    pendingOrdersCount: 6,
    lowStockCount: 3,
  },
  salesHistory: [
    { month: 'Oct', revenue: 6200, orders: 20 },
    { month: 'Nov', revenue: 8400, orders: 28 },
    { month: 'Dec', revenue: 11200, orders: 36 },
    { month: 'Jan', revenue: 7800, orders: 24 },
    { month: 'Feb', revenue: 9100, orders: 30 },
    { month: 'Mar', revenue: 6220, orders: 20 },
  ],
  categoryBreakdown: [
    { name: 'Biker & Moto Jackets', percentage: 42, revenue: 20546 },
    { name: 'Bags & Duffels', percentage: 24, revenue: 11740 },
    { name: 'Bombers & Blazers', percentage: 16, revenue: 7827 },
    { name: 'Belts & Wallets', percentage: 11, revenue: 5381 },
    { name: 'Vests & Accessories', percentage: 7, revenue: 3424 },
  ],
  topProducts: [
    {
      id: 'prod-001',
      name: 'Sialkot Masterpiece Biker Jacket',
      soldCount: 48,
      revenue: 16752.00,
      stock: 18,
    },
    {
      id: 'prod-010',
      name: 'Grand Voyageur Full-Grain Leather Duffel',
      soldCount: 35,
      revenue: 9625.00,
      stock: 20,
    },
    {
      id: 'prod-003',
      name: 'Vintage Flight MA-1 Leather Bomber',
      soldCount: 31,
      revenue: 9145.00,
      stock: 22,
    },
    {
      id: 'prod-012',
      name: 'Artisan Solid Brass Bridle Leather Belt',
      soldCount: 68,
      revenue: 4420.00,
      stock: 45,
    },
  ],
};
