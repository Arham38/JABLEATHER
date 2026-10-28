import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Home } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/currency';
import Button from '../../components/common/Button';

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-89421';
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const found = await orderService.getOrderById(orderId);
        setOrder(found);
      } catch (err) {
        console.warn('Order not found in state, using demo order:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-xs border border-[#DDD8D0] shadow-sm overflow-hidden">
        {/* Top Celebration Banner */}
        <div className="bg-[#171717] text-white p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#A66A3F] font-bold block mb-1">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Thank You For Your Order
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            We've received your order and our Sialkot atelier has scheduled it for precision packaging & dispatch.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Order ID & Tracking Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#F7F5F0] rounded-xs border border-[#DDD8D0] text-xs">
            <div>
              <span className="text-[#6B665F] block font-medium">Order Number</span>
              <strong className="text-sm font-bold text-[#171717]">{order?.id || orderId}</strong>
            </div>
            <div>
              <span className="text-[#6B665F] block font-medium">Order Status</span>
              <strong className="text-sm font-bold text-emerald-700">Confirmed (Processing)</strong>
            </div>
            <div>
              <span className="text-[#6B665F] block font-medium">Tracking Status</span>
              <strong className="text-sm font-bold text-[#171717]">Assigned Upon Dispatch</strong>
            </div>
          </div>

          {/* Purchased Items List */}
          {order?.items && order.items.length > 0 && (
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#6B665F] mb-4">
                Ordered Items
              </h3>
              <div className="divide-y divide-stone-100 border-t border-b border-stone-200">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt="" className="w-12 h-14 object-cover rounded-xs border border-stone-200" />
                      )}
                      <div>
                        <p className="font-bold text-[#171717]">{item.name}</p>
                        <p className="text-[#6B665F]">Qty: {item.quantity} • {item.size} • {item.color}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#171717]">
                      {formatCurrency(item.price * item.quantity, item.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between text-sm font-extrabold text-[#171717]">
                <span>Total Paid</span>
                <span>{formatCurrency(order.total, order.items?.[0]?.currency)}</span>
              </div>
            </div>
          )}

          {/* Shipping Address Summary */}
          {order?.shippingAddress && (
            <div className="p-4 bg-stone-50 rounded-xs border border-stone-200 text-xs">
              <h4 className="font-bold text-[#171717] mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#A66A3F]" />
                <span>Shipping Destination</span>
              </h4>
              <p className="text-[#6B665F]">
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-200">
            <Link to="/shop" className="flex-1">
              <Button variant="primary" fullWidth size="md" className="gap-2 font-bold">
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/account/orders" className="flex-1">
              <Button variant="outline" fullWidth size="md">
                View in My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
