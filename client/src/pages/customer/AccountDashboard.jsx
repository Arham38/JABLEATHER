import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/currency';
import Badge from '../../components/common/Badge';

export const AccountDashboard = () => {
  const { customer } = useAuth();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    customerService.getCustomerOrders().then(setOrders).catch(console.error);
    customerService.getAddresses().then(setAddresses).catch(console.error);
  }, []);

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200">
          <span className="text-xs uppercase font-bold text-[#6B665F] block mb-1">Total Orders</span>
          <strong className="text-2xl font-extrabold text-[#171717]">{orders.length}</strong>
        </div>
        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200">
          <span className="text-xs uppercase font-bold text-[#6B665F] block mb-1">Saved In Wishlist</span>
          <strong className="text-2xl font-extrabold text-[#171717]">{wishlistCount} items</strong>
        </div>
        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200">
          <span className="text-xs uppercase font-bold text-[#6B665F] block mb-1">Saved Addresses</span>
          <strong className="text-2xl font-extrabold text-[#171717]">{addresses.length}</strong>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
            Recent Orders
          </h3>
          <Link to="/account/orders" className="text-xs font-bold text-[#A66A3F] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-[#6B665F]">No orders placed yet.</p>
        ) : (
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-xs">
            {orders.slice(0, 2).map((order) => (
              <div key={order.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="font-bold text-[#171717] text-sm">{order.id}</strong>
                    <Badge variant={order.orderStatus?.toLowerCase() === 'shipped' || order.orderStatus?.toLowerCase() === 'delivered' ? 'success' : 'bestseller'}>
                      {order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-[#6B665F]">
                    {new Date(order.date).toLocaleDateString()} • {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-[#171717] text-sm">
                    {formatCurrency(order.total)}
                  </span>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="px-3 py-1.5 border border-[#DDD8D0] text-[#171717] hover:bg-stone-100 font-bold rounded-xs"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Address & Profile Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-[#6B665F]">Primary Address</span>
            <Link to="/account/addresses" className="text-xs text-[#A66A3F] font-bold hover:underline">Manage</Link>
          </div>
          {defaultAddr ? (
            <div className="text-xs text-stone-700 leading-relaxed">
              <p className="font-bold text-stone-900">{defaultAddr.firstName} {defaultAddr.lastName}</p>
              <p>{defaultAddr.address}</p>
              <p>{defaultAddr.city}, {defaultAddr.state} {defaultAddr.postalCode}</p>
              <p>{defaultAddr.country}</p>
            </div>
          ) : (
            <p className="text-xs text-[#6B665F]">No address saved yet.</p>
          )}
        </div>

        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-[#6B665F]">Contact Info</span>
            <Link to="/account/profile" className="text-xs text-[#A66A3F] font-bold hover:underline">Edit</Link>
          </div>
          <div className="text-xs text-stone-700 leading-relaxed">
            <p className="font-bold text-stone-900">{customer?.name}</p>
            <p>{customer?.email}</p>
            <p>Direct Shipping from Sialkot, Pakistan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
