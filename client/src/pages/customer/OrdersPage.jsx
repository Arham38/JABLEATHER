import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { formatCurrency } from '../../utils/currency';
import Badge from '../../components/common/Badge';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerService
      .getCustomerOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
          Order History ({orders.length})
        </h2>
      </div>

      {loading ? (
        <p className="text-xs text-[#6B665F]">Loading your order records...</p>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#6B665F]">
          <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
          <p>No order history found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-[#DDD8D0] rounded-xs p-5 bg-white space-y-4"
            >
              {/* Top Order Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-100 gap-2 text-xs">
                <div>
                  <span className="text-[#6B665F]">Order Placed: </span>
                  <strong className="text-[#171717]">
                    {new Date(order.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </strong>
                  <span className="text-stone-300 mx-2">•</span>
                  <span className="text-[#6B665F]">ID: </span>
                  <strong className="text-[#171717]">{order.id}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={order.orderStatus?.toLowerCase() === 'shipped' || order.orderStatus?.toLowerCase() === 'delivered' ? 'success' : 'bestseller'}>
                    {order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending'}
                  </Badge>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-[#171717] font-bold rounded-xs text-[11px] transition"
                  >
                    View Invoice
                  </Link>
                </div>
              </div>

              {/* Items in this order */}
              <div className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="w-12 h-14 object-cover rounded-xs border border-stone-200 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-[#171717]">{item.name}</p>
                        <p className="text-[#6B665F]">
                          Qty: {item.quantity} • Size: {item.size} • Color: {item.color}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#171717]">
                      {formatCurrency(item.price * item.quantity, order.currency || item.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer & Tracking */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 text-stone-600">
                  <Truck className="w-4 h-4 text-[#A66A3F]" />
                  <span>
                    Tracking:{' '}
                    <strong className="text-stone-900 font-mono">
                      {order.trackingNumber || 'Awaiting Dispatch'}
                    </strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#6B665F] mr-2">
                    {order.paymentStatus === 'paid' ? 'Total Paid:' : 'Total Amount:'}
                  </span>
                  <strong className="text-sm font-extrabold text-[#171717]">
                    {formatCurrency(order.total, order.currency)}
                  </strong>
                  {order.paymentStatus !== 'paid' && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-xs border border-amber-200">
                      {order.paymentStatus || 'unpaid'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
