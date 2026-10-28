import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const statuses = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  useEffect(() => {
    supabaseAdminService
      .getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message || 'Unable to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await supabaseAdminService.updateOrderStatus(orderId, newStatus);
      setOrders((current) => current.map((order) => order.id === orderId ? updated : order));
      toast.success(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      toast.error(`Could not update order: ${err.message}`);
    }
  };

  const filteredOrders = orders.filter((o) =>
    statusFilter === 'All' ? true : o.orderStatus === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Orders & Dispatches</h1>
          <p className="text-xs text-slate-400">
            Track global shipments, update order statuses, and verify fulfillment.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        {loading && <p className="p-6 text-xs text-slate-400">Loading orders...</p>}
        {error && <p role="alert" className="p-6 text-xs text-red-300">Unable to load orders: {error}</p>}
        {!loading && !error && filteredOrders.length === 0 && <p className="p-6 text-xs text-slate-400">No orders match this status.</p>}
        {!loading && !error && filteredOrders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    <Link to={`/admin/orders/${ord.id}`} className="hover:text-amber-400">
                      {ord.id}
                    </Link>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-200 block">{ord.customer?.name || 'Customer'}</span>
                    <span className="text-slate-500 text-[10px]">{ord.customer.email}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-400">
                    {new Date(ord.date).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 font-black text-slate-200">
                    {formatCurrency(ord.total, ord.currency)}
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-bold">{ord.paymentStatus}</span>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold"
                    >
                      <span>Inspect</span>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
