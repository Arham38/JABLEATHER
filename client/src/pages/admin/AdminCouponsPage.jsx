import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 100,
    maxDiscountAmount: 50,
    expiresAt: '2026-12-31',
    description: '',
  });
  const toast = useToast();

  useEffect(() => {
    supabaseAdminService
      .getCoupons()
      .then(setCoupons)
      .catch((err) => toast.error(err.message || 'Failed to load coupons'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    try {
      const created = await supabaseAdminService.createCoupon({
        ...newCoupon,
        isActive: true,
      });
      setCoupons([created, ...coupons]);
      setIsAdding(false);
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 100,
        maxDiscountAmount: 50,
        expiresAt: '2026-12-31',
        description: '',
      });
      toast.success(`Coupon ${created.code} created`);
    } catch (err) {
      toast.error(`Could not create coupon: ${err.message}`);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await supabaseAdminService.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Coupon ${code} deleted`);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Promotional Coupons</h1>
          <p className="text-xs text-slate-400">
            Create and manage promotional discount codes and free shipping triggers stored in Supabase.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'New Promo Code'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-white">Create Promo Code</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. VIP20"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Discount Type</label>
              <select
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Value ({newCoupon.discountType === 'percentage' ? '%' : '$'})</label>
              <input
                type="number"
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Min Order ($)</label>
              <input
                type="number"
                value={newCoupon.minOrderAmount}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Expiry Date</label>
              <input
                type="date"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded">
            Save Coupon
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Loading coupons from Supabase...</p>
      ) : coupons.length === 0 ? (
        <p className="text-xs text-slate-400">No active promotional coupons found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-amber-400 text-base">{c.code}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                {c.discountType === 'percentage' ? `${c.discountValue}% off` : `$${c.discountValue} off`} on orders over ${c.minOrderAmount}
              </p>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900 flex justify-between">
                <span>Used: {c.usageCount || 0} times</span>
                <span>{c.expiresAt ? `Expires: ${new Date(c.expiresAt).toLocaleDateString()}` : 'No Expiry'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
