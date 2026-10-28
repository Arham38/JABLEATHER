import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle2, Clock } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { formatCurrency } from '../../utils/currency';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerService
      .getOrderById(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-xs text-[#6B665F]">Loading order invoice...</p>;
  if (!order) {
    return (
      <div className="py-12 text-center text-xs text-[#6B665F]">
        <p>Order not found.</p>
        <Link to="/account/orders" className="text-[#A66A3F] underline font-bold mt-2 inline-block">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link to="/account/orders" className="p-1 hover:bg-stone-100 rounded-xs text-[#1C1C1C]">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#171717]">Order {order.id}</h2>
            <p className="text-[11px] text-[#6B665F]">
              Placed on {new Date(order.date).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge variant={order.orderStatus === 'Shipped' ? 'success' : 'bestseller'}>
          {order.orderStatus}
        </Badge>
      </div>

      {/* Tracking Callout */}
      <div className="p-4 bg-[#F7F5F0] rounded-xs border border-[#DDD8D0] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#1C1C1C]">
          <Truck className="w-4 h-4 text-[#A66A3F]" />
          <span>
            Carrier:{' '}
            <strong className="font-mono">
              {order.trackingNumber ? `DHL Express (${order.trackingNumber})` : 'Processing at Sialkot Atelier'}
            </strong>
          </span>
        </div>
        <span className="text-emerald-700 font-bold">{order.paymentStatus}</span>
      </div>

      {/* Items Breakdown */}
      <div>
        <h3 className="text-xs uppercase font-bold tracking-wider text-[#171717] mb-3">
          Line Items
        </h3>
        <div className="divide-y divide-stone-100 border border-stone-200 rounded-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                {item.image && (
                  <img src={item.image} alt="" className="w-14 h-16 object-cover rounded-xs border border-stone-200" />
                )}
                <div>
                  <h4 className="font-bold text-[#171717]">{item.name}</h4>
                  <p className="text-[#6B665F]">SKU: {item.sku}</p>
                  <p className="text-[#6B665F]">Size: {item.size} • Color: {item.color}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#171717]">{formatCurrency(item.price * item.quantity)}</p>
                <p className="text-[#6B665F]">{formatCurrency(item.price)} × {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address & Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200 text-xs leading-relaxed">
          <h4 className="font-bold text-[#171717] mb-2">Shipping Destination</h4>
          <p className="font-semibold text-stone-900">{order.customer?.name}</p>
          <p className="text-stone-600">{order.shippingAddress?.address}</p>
          <p className="text-stone-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
          <p className="text-stone-600">{order.shippingAddress?.country}</p>
        </div>

        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200 space-y-2 text-xs">
          <h4 className="font-bold text-[#171717] mb-2">Payment Summary</h4>
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-600">
            <span>Express Courier</span>
            <span>{order.shippingFee === 0 ? 'Complimentary' : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-[#171717] pt-2 border-t border-stone-200">
            <span>Total Paid</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
