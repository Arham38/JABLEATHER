import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

export const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manualModal, setManualModal] = useState({
    open: false,
    reference: '',
    reason: 'Bank wire verified by Treasury',
    submitting: false,
  });
  const toast = useToast();

  const refreshOrderData = useCallback(async () => {
    try {
      const foundOrder = await supabaseAdminService.getOrderById(id);
      setOrder(foundOrder);

      const orderRef = foundOrder.order_number || foundOrder.id;
      const [txns, logs] = await Promise.all([
        supabaseAdminService.getOrderPayments(orderRef),
        supabaseAdminService.getOrderAuditLog(orderRef),
      ]);
      setPayments(txns || []);
      setAuditLogs(logs || []);
    } catch (err) {
      setError(err.message || 'Unable to load order.');
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const foundOrder = await supabaseAdminService.getOrderById(id);
        if (!isMounted) return;
        setOrder(foundOrder);

        const orderRef = foundOrder.order_number || foundOrder.id;
        const [txns, logs] = await Promise.all([
          supabaseAdminService.getOrderPayments(orderRef),
          supabaseAdminService.getOrderAuditLog(orderRef),
        ]);
        if (!isMounted) return;
        setPayments(txns || []);
        setAuditLogs(logs || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Unable to load order.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      const updated = await supabaseAdminService.updateOrderStatus(order.id, status);
      setOrder(updated);
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(`Status update failed: ${err.message}`);
    }
  };

  const handleManualConfirm = async (e) => {
    e.preventDefault();
    setManualModal((prev) => ({ ...prev, submitting: true }));
    try {
      const orderRef = order.order_number || order.id;
      await paymentService.confirmManualPayment(
        orderRef,
        manualModal.reference,
        manualModal.reason
      );
      toast.success(`Payment confirmed for Order #${orderRef}`);
      setManualModal({ open: false, reference: '', reason: '', submitting: false });
      refreshOrderData();
    } catch (err) {
      toast.error(err.message || 'Payment confirmation failed');
      setManualModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (loading) return <p className="text-xs text-slate-400">Loading order details...</p>;
  if (error || !order) return <p role="alert" className="text-xs text-red-300">Unable to load order: {error || 'Order not found.'}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2 text-slate-400 hover:text-white rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Order {order.id}</h1>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.date).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusUpdate(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition ${
                order.orderStatus?.toLowerCase() === st
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Mark {st[0].toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-300 pb-2 border-b border-slate-800">
              Ordered Items ({order.items?.length})
            </h3>
            <div className="divide-y divide-slate-800">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img src={item.image} alt="" className="w-12 h-14 object-cover rounded bg-slate-800" />
                    )}
                    <div>
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-slate-400">Qty: {item.quantity} • Size: {item.size} • Color: {item.color}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <strong className="text-white">{formatCurrency(item.price * item.quantity, order.currency)}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Timeline & Verification History */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs uppercase font-bold text-slate-300">
                Payment Verification Timeline
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                order.paymentStatus === 'paid'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {order.paymentStatus || 'unpaid'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Event 1: Order Placement */}
              <div className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">Order Created</p>
                  <p className="text-slate-400">Total {formatCurrency(order.total, order.currency)} via {order.paymentMethod?.toUpperCase()}</p>
                  <span className="text-[10px] text-slate-500">{new Date(order.date).toLocaleString()}</span>
                </div>
              </div>

              {/* Event 2: Payment Sessions Logged */}
              {payments.map((p) => (
                <div key={p.id} className="flex items-start gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    p.status === 'paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {p.status === 'paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">
                      Payment Session: <span className="capitalize">{p.provider}</span> ({p.status})
                    </p>
                    <p className="font-mono text-[11px] text-slate-400">Ref: {p.reference}</p>
                    <span className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}

              {/* Event 3: Audit Logs */}
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs bg-slate-900/60 p-3 rounded border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">Audit Action: {log.action}</p>
                    <p className="text-slate-300">Performed By: <strong>{log.performed_by}</strong></p>
                    {log.reason && <p className="text-slate-400 italic">"{log.reason}"</p>}
                    <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual Payment Action */}
            {order.paymentStatus !== 'paid' && (
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => setManualModal({ open: true, reference: order.paymentReference || `WIRE-${Date.now().toString().slice(-6)}`, reason: 'Bank wire verified by Treasury', submitting: false })}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Manual Wire Settlement</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-3 text-xs">
            <h3 className="text-xs uppercase font-bold text-slate-300 pb-2 border-b border-slate-800">
              Customer Info
            </h3>
            <p className="font-bold text-white text-sm">{order.customer?.name}</p>
            <p className="text-slate-400">{order.customer?.email}</p>
            <p className="text-slate-400">{order.customer?.phone || ''}</p>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-3 text-xs">
            <h3 className="text-xs uppercase font-bold text-slate-300 pb-2 border-b border-slate-800">
              Shipping Destination
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {order.shippingAddress?.address || order.shippingAddress?.line1 || ''}<br />
              {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postal_code || order.shippingAddress?.postalCode].filter(Boolean).join(', ')}<br />
              {order.shippingAddress?.country || ''}
            </p>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
            <h3 className="text-xs uppercase font-bold text-slate-300 pb-2 border-b border-slate-800">
              Payment & Fulfillment
            </h3>
            <div className="flex justify-between items-center text-slate-400">
              <span>Payment Status</span>
              <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order.paymentStatus || 'unpaid'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Method</span>
              <span className="capitalize text-slate-200">{order.paymentMethod || 'Card'}</span>
            </div>
            {order.paymentReference && (
              <div className="flex justify-between text-slate-400">
                <span>Reference</span>
                <span className="font-mono text-[11px] text-slate-300">{order.paymentReference}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Coupon Discount</span>
                <span>-{formatCurrency(order.discount, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee, order.currency)}</span>
            </div>
            <div className="flex justify-between text-slate-400"><span>Tax</span><span>{formatCurrency(order.tax, order.currency)}</span></div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total</span>
              <span>{formatCurrency(order.total, order.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Payment Confirmation Modal */}
      {manualModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Confirm Manual Wire Receipt for #{order.order_number || order.id}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifying manual receipt marks the order as paid, records an immutable entry in the audit log, and emails confirmation to <strong className="text-white">{order.customer?.email}</strong>.
            </p>

            <form onSubmit={handleManualConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Bank Reference / Wire Slip # (Required)
                </label>
                <input
                  type="text"
                  required
                  value={manualModal.reference}
                  onChange={(e) => setManualModal({ ...manualModal, reference: e.target.value })}
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
                  value={manualModal.reason}
                  onChange={(e) => setManualModal({ ...manualModal, reason: e.target.value })}
                  placeholder="e.g. Bank credit verified by Treasury"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualModal({ open: false, reference: '', reason: '', submitting: false })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualModal.submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold flex items-center gap-1.5"
                >
                  {manualModal.submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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

export default AdminOrderDetailPage;
