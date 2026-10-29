import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  ShoppingBag,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  Eye,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';
import { supabaseAdminService } from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading live operational metrics...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300">
        <p className="font-bold mb-1">Operational Notice</p>
        <p>{error}</p>
      </div>
    );
  }

  const primaryCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? 0,
      sub: `${stats?.publishedProducts ?? 0} published • ${stats?.draftProducts ?? 0} drafts`,
      icon: <Package className="w-5 h-5 text-amber-500" />,
      link: '/admin/products',
    },
    {
      label: 'Published Products',
      value: stats?.publishedProducts ?? 0,
      sub: 'Active in storefront',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      link: '/admin/products?status=active',
    },
    {
      label: 'Draft Products',
      value: stats?.draftProducts ?? 0,
      sub: 'Hidden from public',
      icon: <FileEdit className="w-5 h-5 text-amber-400" />,
      link: '/admin/products?status=draft',
    },
    {
      label: 'Categories',
      value: stats?.totalCategories ?? 0,
      sub: 'Catalog taxonomy',
      icon: <FolderTree className="w-5 h-5 text-sky-400" />,
      link: '/admin/categories',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      sub: `${stats?.pendingOrders ?? 0} pending processing`,
      icon: <ShoppingBag className="w-5 h-5 text-indigo-400" />,
      link: '/admin/orders',
    },
    {
      label: 'Low Stock Alert',
      value: stats?.lowStockProducts ?? 0,
      sub: 'Require inventory replenishment',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      link: '/admin/products?status=low-stock',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block mb-1">
            Shopify-Style Executive Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Store Overview &amp; Product Operations
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded transition"
          >
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>Categories</span>
          </Link>
          <Link
            to="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-xs rounded transition"
          >
            <Eye className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {primaryCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg flex flex-col justify-between transition-all group hover:bg-slate-900/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {card.label}
              </span>
              <div className="p-1 rounded bg-slate-900 group-hover:bg-slate-800 transition">
                {card.icon}
              </div>
            </div>
            <div>
              <strong className="text-2xl font-black text-white block mb-0.5">
                {card.value}
              </strong>
              <span className="text-[10px] text-slate-500 block truncate">
                {card.sub}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Settled Gross Revenue
            </span>
            <strong className="text-2xl font-black text-white">
              {formatCurrency(stats?.revenue ?? 0, stats?.revenueCurrency || 'USD')}
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Processed Orders: <strong className="text-white">{stats?.totalOrders ?? 0}</strong></span>
          <span>•</span>
          <span>Registered Customers: <strong className="text-white">{stats?.totalCustomers ?? 0}</strong></span>
        </div>
      </div>

      {/* Two Column Section: Products by Category & Recent Activity / Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Category Breakdown & Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Products by Category */}
          <section className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Product Inventory by Category
                </h2>
              </div>
              <Link to="/admin/categories" className="text-xs text-amber-500 hover:underline font-semibold flex items-center gap-1">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0) ? (
              <p className="text-xs text-slate-400 py-3">No categorized products available yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((category) => (
                  <div key={category.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900 last:border-b-0">
                    <span className="text-slate-300 font-medium">{category.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/40">
                        {category.count} items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity Stream */}
          <section className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Catalog &amp; Store Activity
                </h2>
              </div>
            </div>

            {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
              <p className="text-xs text-slate-400 py-3">No activity recorded recently.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {stats.recentActivity.map((act) => (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block mb-0.5">{act.title}</span>
                      <span className="text-slate-400 text-[11px] block">{act.subtitle}</span>
                    </div>
                    {act.date && (
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {new Date(act.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recent Orders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <section className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Orders
                </h2>
              </div>
              <Link to="/admin/orders" className="text-xs text-amber-500 hover:underline font-semibold">
                View All
              </Link>
            </div>

            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
              <p className="text-xs text-slate-400 py-3">No orders recorded in the system.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {stats.recentOrders.map((order) => (
                  <div key={order.databaseId || order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <Link
                        to={`/admin/orders/${encodeURIComponent(order.id)}`}
                        className="font-bold text-slate-200 hover:text-amber-400 transition"
                      >
                        #{order.id}
                      </Link>
                      <span className="block text-slate-400 text-[11px] truncate">
                        {order.customer?.name || order.customer?.email || 'Customer'}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {order.orderStatus} • {order.paymentStatus}
                      </span>
                    </div>
                    <strong className="shrink-0 text-slate-100 font-bold">
                      {formatCurrency(order.total, order.currency)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
