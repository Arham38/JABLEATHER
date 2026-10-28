import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
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
    supabaseAdminService.getCoupons().then(setCoupons).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    const created = await supabaseAdminService.createCoupon(newCoupon);
    setCoupons([created, ...coupons]);
    setIsAdding(false);
    toast.success(`Coupon ${created.code} created`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Promotional Coupons</h1>
          <p className="text-xs text-slate-400">
            Create and manage promotional discount codes and free shipping triggers.
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
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Discount (%)</label>
              <input
                type="number"
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-amber-400 text-base">{c.code}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-300">{c.description || `${c.discountValue}% off orders over $${c.minOrderAmount}`}</p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900 flex justify-between">
              <span>Used: {c.usageCount} times</span>
              <span>Expires: {c.expiresAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCouponsPage;
