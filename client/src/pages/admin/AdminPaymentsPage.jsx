import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, AlertCircle, Lock, Save, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { paymentService } from '../../services/paymentService';
import supabaseAdminService from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

const generateWireReference = (ref) => ref || `WIRE-${Math.floor(100000 + Math.random() * 900000)}`;

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
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    orderNumber: '',
    reference: '',
    reason: 'Bank wire verified by Treasury',
    submitting: false,
  });

  const refreshData = useCallback(async () => {
    try {
      const [cfg, txns] = await Promise.all([
        settingsService.getSection('payments'),
        supabaseAdminService.getPaymentsList(30),
      ]);
      if (cfg) setPaymentsConfig((prev) => ({ ...prev, ...cfg }));
      setPayments(txns || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load payments data');
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      settingsService.getSection('payments'),
      supabaseAdminService.getPaymentsList(30),
    ]).then(([cfg, txns]) => {
      if (!isMounted) return;
      if (cfg) setPaymentsConfig((prev) => ({ ...prev, ...cfg }));
      setPayments(txns || []);
    }).catch((err) => {
      if (!isMounted) return;
      toast.error(err.message || 'Failed to load payments data');
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSection('payments', paymentsConfig);
      toast.success('Payment gateway configuration saved to Supabase');
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenManualModal = (payment) => {
    setConfirmModal({
      open: true,
      orderNumber: payment.order_number,
      reference: generateWireReference(payment.reference),
      reason: 'Bank wire verified by Treasury',
      submitting: false,
    });
  };

  const handleSubmitManualPayment = async (e) => {
    e.preventDefault();
    setConfirmModal((prev) => ({ ...prev, submitting: true }));
    try {
      await paymentService.confirmManualPayment(
        confirmModal.orderNumber,
        confirmModal.reference,
        confirmModal.reason
      );
      toast.success(`Order #${confirmModal.orderNumber} marked as paid (audit log recorded)`);
      setConfirmModal({ open: false, orderNumber: '', reference: '', reason: '', submitting: false });
      refreshData();
    } catch (err) {
      toast.error(err.message || 'Confirmation failed');
      setConfirmModal((prev) => ({ ...prev, submitting: false }));
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
    <div className="space-y-10 max-w-5xl">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">
          Financial & Processing
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Payment Gateways & Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure multi-currency gateways, sandbox environments, and verify manual wire settlements with immutable audit logging.
        </p>
      </div>

      <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <p className="font-bold">Phase 4 Provider-Agnostic Architecture Active:</p>
          <p className="mt-1">
            Sandbox simulator is available for automated and failure tests. To integrate live Stripe or PayPal, see the step-by-step checklist in <code className="bg-black/40 px-1 py-0.5 rounded font-mono">server/payments/TEMPLATE_PROVIDER.md</code>.
          </p>
        </div>
      </div>

      {/* Gateway Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Environment & Currencies
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Processing Environment
              </label>
              <select
                value={paymentsConfig.environmentMode}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, environmentMode: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              >
                <option value="test">Sandbox / Developer Test Mode</option>
                <option value="production">Production (Requires Live API Keys)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Base Storefront Currency
              </label>
              <select
                value={paymentsConfig.defaultCurrency}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, defaultCurrency: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              >
                <option value="USD">USD ($) - International Base</option>
                <option value="PKR">PKR (Rs) - Pakistan Rupee</option>
                <option value="EUR">EUR (€) - Eurozone</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enabled Gateways */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Payment Methods
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded text-xs">
              <div>
                <span className="font-bold text-white block">Credit & Debit Cards (Sandbox / Stripe)</span>
                <span className="text-slate-400">Card simulator active; plug in Stripe Elements when keys are ready</span>
              </div>
              <input
                type="checkbox"
                checked={paymentsConfig.enableStripe}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, enableStripe: e.target.checked })}
                className="rounded text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded text-xs">
              <div>
                <span className="font-bold text-white block">PayPal Express Checkout</span>
                <span className="text-slate-400">International customer standard checkout wallet</span>
              </div>
              <input
                type="checkbox"
                checked={paymentsConfig.enablePayPal}
                onChange={(e) => setPaymentsConfig({ ...paymentsConfig, enablePayPal: e.target.checked })}
                className="rounded text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded text-xs">
              <div>
                <span className="font-bold text-white block">Bank Wire Transfer (B2B & Wholesale Orders)</span>
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

      {/* Payment History & Manual Confirmation Section */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">Payment Transactions & Audit Log</h2>
            <p className="text-xs text-slate-400">
              Live records from the payments table with provider references and settlement audit trail.
            </p>
          </div>
          <button
            onClick={refreshData}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">
                    No payment records logged in database yet. Place an order on the storefront to test.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold text-white">{p.order_number}</td>
                    <td className="py-3 px-4 capitalize text-slate-300">{p.provider}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-[140px]">{p.reference}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'paid'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : p.status === 'failed' || p.status === 'amount_mismatch'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status !== 'paid' ? (
                        <button
                          onClick={() => handleOpenManualModal(p)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded transition"
                        >
                          Confirm Paid
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Confirm Manual Payment for #{confirmModal.orderNumber}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Marking this order as paid writes an immutable record to the <code className="text-amber-400">payment_audit_log</code> and dispatches the customer confirmation email.
            </p>

            <form onSubmit={handleSubmitManualPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Bank Reference / Wire Slip # (Required)
                </label>
                <input
                  type="text"
                  required
                  value={confirmModal.reference}
                  onChange={(e) => setConfirmModal({ ...confirmModal, reference: e.target.value })}
                  placeholder="e.g. PK-SCB-987654321"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Audit Reason / Note
                </label>
                <input
                  type="text"
                  required
                  value={confirmModal.reason}
                  onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                  placeholder="e.g. Bank statement credit verified by Treasury"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ open: false, orderNumber: '', reference: '', reason: '', submitting: false })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmModal.submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold flex items-center gap-1.5"
                >
                  {confirmModal.submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm & Mark Paid</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
