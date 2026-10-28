import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

export const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    supabaseAdminService
      .getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.message || 'Unable to load order.'))
      .finally(() => setLoading(false));
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

  if (loading) return <p className="text-xs text-slate-400">Loading order details...</p>;
  if (error || !order) return <p role="alert" className="text-xs text-red-300">Unable to load order: {error || 'Order not found.'}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
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
            {order.trackingNumber && (
              <div className="flex justify-between text-slate-400">
                <span>Tracking</span>
                <span className="font-mono text-slate-200">{order.trackingNumber}</span>
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
    </div>
  );
};

export default AdminOrderDetailPage;
