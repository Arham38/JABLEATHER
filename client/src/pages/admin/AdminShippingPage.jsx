import React, { useState, useEffect } from 'react';
import { Truck, Globe, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';

export const AdminShippingPage = () => {
  const toast = useToast();
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 150.00,
    standardRate: 25.00,
    expressRate: 35.00,
    standardTransitDays: '5–8 business days via DHL / FedEx Air Express',
    expressTransitDays: '3–5 business days via Priority Courier',
    originFacility: 'Export Processing Zone, Sialkot, Pakistan',
    enableInternational: true,
    enableInsurance: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getSection('shipping')
      .then((cfg) => {
        if (cfg) setShippingConfig((prev) => ({ ...prev, ...cfg }));
      })
      .catch((err) => toast.error(err.message || 'Failed to load shipping settings'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSection('shipping', shippingConfig);
      toast.success('Shipping configurations saved to Supabase');
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">
          Logistics & Fulfillment
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Global Shipping Zones
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure export courier rates, free shipping criteria, and international tracking integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Fulfillment Origin */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Primary Dispatch Facility
            </h3>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Workshop Export Origin
            </label>
            <input
              type="text"
              value={shippingConfig.originFacility}
              onChange={(e) => setShippingConfig({ ...shippingConfig, originFacility: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Rates & Thresholds */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              International Delivery Tiers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                value={shippingConfig.freeShippingThreshold}
                onChange={(e) => setShippingConfig({ ...shippingConfig, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Standard Air Freight ($)
              </label>
              <input
                type="number"
                value={shippingConfig.standardRate}
                onChange={(e) => setShippingConfig({ ...shippingConfig, standardRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Priority Courier ($)
              </label>
              <input
                type="number"
                value={shippingConfig.expressRate}
                onChange={(e) => setShippingConfig({ ...shippingConfig, expressRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Standard Delivery Note
              </label>
              <input
                type="text"
                value={shippingConfig.standardTransitDays}
                onChange={(e) => setShippingConfig({ ...shippingConfig, standardTransitDays: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Express Delivery Note
              </label>
              <input
                type="text"
                value={shippingConfig.expressTransitDays}
                onChange={(e) => setShippingConfig({ ...shippingConfig, expressTransitDays: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Carrier Integrations */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Couriers & Customs
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
              <div>
                <strong className="text-white block">DHL Express Worldwide</strong>
                <span className="text-slate-400">Integrated air waybill generation and doorstep tracking</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded text-[10px] font-bold uppercase">
                Active Ready
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
              <div>
                <strong className="text-white block">FedEx International Priority</strong>
                <span className="text-slate-400">Direct courier for North American retail consignments</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded text-[10px] font-bold uppercase">
                Active Ready
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Shipping Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminShippingPage;
