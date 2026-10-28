import React, { useState, useEffect } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    settingsService.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast.success('Store configurations saved');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="text-slate-400 text-xs">Loading store settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">
          Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Store & Operations Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust store contact details, currencies, shipping rates, and banner notices.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Details */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Brand & Atelier Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Store Name</label>
              <input
                type="text"
                value={settings.general.storeName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, storeName: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Support Email</label>
              <input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, supportEmail: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Wholesale / B2B Email</label>
              <input
                type="email"
                value={settings.general.wholesaleEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, wholesaleEmail: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">WhatsApp Hotline</label>
              <input
                type="text"
                value={settings.general.whatsapp}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, whatsapp: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Facility Address</label>
              <input
                type="text"
                value={settings.general.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, address: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Fulfillment & Shipping Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                value={settings.shipping.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: { ...settings.shipping, freeShippingThreshold: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Standard Flat Rate ($)</label>
              <input
                type="number"
                value={settings.shipping.standardRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: { ...settings.shipping, standardRate: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Express Air Rate ($)</label>
              <input
                type="number"
                value={settings.shipping.expressRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: { ...settings.shipping, expressRate: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
