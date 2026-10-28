import React, { useState } from 'react';
import { CreditCard, DollarSign, Lock, Save, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminPaymentsPage = () => {
  const toast = useToast();
  const [paymentsConfig, setPaymentsConfig] = useState({
    enableStripe: true,
    enablePayPal: true,
    enableBankWire: true,
    enableCashOnDelivery: false,
    environmentMode: 'test',
    defaultCurrency: 'USD',
    settlementAccount: 'Export Processing Zone Treasury Branch Sialkot',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Payment gateway configuration saved');
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">
          Financial & Processing
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Payment Gateways & Currencies
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure multi-currency checkout, test modes, and institutional B2B wire settlement instructions.
        </p>
      </div>

      <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200 leading-relaxed">
          <strong>Security Note:</strong> In Phase 1, payments run in simulated developer sandbox mode. In Phase 2, backend API webhooks and PCI-compliant tokens (Stripe Elements / PayPal SDK) will be connected securely without storing card data on client or server.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Environment Mode */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Gateway Operation Mode
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Environment Mode</label>
              <select
                value={paymentsConfig.environmentMode}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, environmentMode: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="test">Sandbox / Simulated Mode (Phase 1)</option>
                <option value="live">Live Production (Phase 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Base Transaction Currency</label>
              <select
                value={paymentsConfig.defaultCurrency}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, defaultCurrency: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="USD">USD ($) - Global Primary</option>
                <option value="EUR">EUR (€) - European Union</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enabled Methods */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Accepted Customer Payment Methods
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-slate-900 rounded border border-slate-800 cursor-pointer">
              <div>
                <strong className="text-white block">Credit & Debit Cards (Visa, Mastercard, Amex)</strong>
                <span className="text-slate-400">Processed via secure SSL 256-bit encrypted gateway</span>
              </div>
              <input
                type="checkbox"
                checked={paymentsConfig.enableStripe}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, enableStripe: e.target.checked })}
                className="rounded text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900 rounded border border-slate-800 cursor-pointer">
              <div>
                <strong className="text-white block">PayPal International</strong>
                <span className="text-slate-400">Instant digital checkout with Buyer Protection</span>
              </div>
              <input
                type="checkbox"
                checked={paymentsConfig.enablePayPal}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, enablePayPal: e.target.checked })}
                className="rounded text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900 rounded border border-slate-800 cursor-pointer">
              <div>
                <strong className="text-white block">B2B Bank Wire Transfer (T/T Swift)</strong>
                <span className="text-slate-400">Institutional invoicing for bulk wholesale and private-label orders</span>
              </div>
              <input
                type="checkbox"
                checked={paymentsConfig.enableBankWire}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, enableBankWire: e.target.checked })}
                className="rounded text-amber-500"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Payment Configuration'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminPaymentsPage;
