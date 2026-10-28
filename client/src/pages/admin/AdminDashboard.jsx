import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseAdminService } from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';

const metrics = (stats) => [
  ['Products', stats.totalProducts],
  ['Active Products', stats.activeProducts],
  ['Categories', stats.totalCategories],
  ['Orders', stats.totalOrders],
  ['Customers', stats.totalCustomers],
  ['Pending Orders', stats.pendingOrders],
  ['Low Stock Products', stats.lowStockProducts],
];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabaseAdminService.getDashboardStats()
      .then((result) => { if (active) setStats(result); })
      .catch((err) => { if (active) setError(err.message || 'Unable to load dashboard data.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <p className="text-xs text-slate-400">Loading live operational metrics...</p>;
  if (error) return <p role="alert" className="text-xs text-red-300">Unable to load dashboard: {error}</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">Executive Summary</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Operations &amp; Analytics</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/new" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition">+ New Product</Link>
          <Link to="/admin/orders" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded transition">Manage Orders</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics(stats).map(([label, value]) => (
          <div key={label} className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{label}</span>
            <strong className="text-xl font-black text-white">{value}</strong>
          </div>
        ))}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Paid Revenue</span>
          <strong className="text-xl font-black text-white">{formatCurrency(stats.revenue, stats.revenueCurrency)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">Products by Category</h2>
          {stats.categoryBreakdown.length === 0 ? <p className="text-xs text-slate-400">No categorized products are available.</p> : (
            <div className="space-y-3">{stats.categoryBreakdown.map((category) => (
              <div key={category.name} className="flex items-center justify-between text-xs"><span className="text-slate-300">{category.name}</span><span className="font-bold text-amber-400">{category.count}</span></div>
            ))}</div>
          )}
        </section>

        <section className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-amber-500 hover:underline">View All</Link>
          </div>
          {stats.recentOrders.length === 0 ? <p className="text-xs text-slate-400">No orders are recorded yet.</p> : (
            <div className="divide-y divide-slate-800">{stats.recentOrders.map((order) => (
              <div key={order.databaseId} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0"><Link to={`/admin/orders/${encodeURIComponent(order.id)}`} className="font-bold text-slate-200 hover:text-amber-400">{order.id}</Link><span className="block text-slate-500 truncate">{order.customer?.name || order.customer?.email || 'Customer'} • {order.orderStatus}</span></div>
                <strong className="shrink-0 text-slate-200">{formatCurrency(order.total, order.currency)}</strong>
              </div>
            ))}</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;