import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';

export const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabaseAdminService.getDashboardStats()
      .then((result) => { if (active) setStats(result); })
      .catch((err) => { if (active) setError(err.message || 'Unable to load analytics.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <p className="text-xs text-slate-400">Loading live analytics...</p>;
  if (error) return <p role="alert" className="text-xs text-red-300">Unable to load analytics: {error}</p>;

  const cards = [
    { label: 'Paid Revenue', value: formatCurrency(stats.revenue, stats.revenueCurrency), icon: DollarSign },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart },
    { label: 'Customers', value: stats.totalCustomers, icon: Users },
    { label: 'Active Products', value: stats.activeProducts, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">Database Summary</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Commercial Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Metrics calculated from the current products, categories, orders, and users tables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-slate-950 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between"><span className="text-xs text-slate-400 font-semibold uppercase">{label}</span><Icon className="w-4 h-4 text-amber-400" /></div>
            <div className="text-2xl font-black text-white mt-2">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Products by Category</h2>
        {stats.categoryBreakdown.length === 0 ? <p className="text-xs text-slate-400">No categorized products are available.</p> : stats.categoryBreakdown.map((category) => (
          <div key={category.name} className="flex items-center justify-between border-b border-slate-800 py-2 text-xs"><span className="text-slate-300">{category.name}</span><span className="font-bold text-amber-400">{category.count} products</span></div>
        ))}
        <p className="text-[11px] text-slate-500">Conversion rate, lifetime value, and monthly revenue comparisons are not available in the current schema.</p>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;