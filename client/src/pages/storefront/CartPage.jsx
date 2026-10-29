import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Button from '../../components/common/Button';

export const CartPage = () => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shippingFee,
    total,
    freeShippingRemaining,
    freeShippingProgress,
    appliedCoupon,
    isCouponLoading,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const currency = items[0]?.currency || 'USD';

  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />
        <div className="max-w-md mx-auto py-16 bg-white rounded-xs border border-[#DDD8D0] p-8 mt-6">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#A66A3F]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] mb-2">Sign In Required</h2>
          <p className="text-xs text-[#6B665F] mb-6">
            Please sign in to your JAB Leather account to view, add, or manage your shopping bag.
          </p>
          <Link to="/account/login">
            <Button variant="primary" size="md">Sign In to Your Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />
        <div className="max-w-md mx-auto py-16 bg-white rounded-xs border border-[#DDD8D0] p-8 mt-6">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] mb-2">Your Bag is Empty</h2>
          <p className="text-xs text-[#6B665F] mb-6">
            Looks like you haven't added any handcrafted leather products to your bag yet.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="md">Explore Collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171717]">
          Your Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-stone-500 hover:text-red-700 transition inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Empty Entire Bag</span>
        </button>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="bg-white border border-[#DDD8D0] rounded-xs p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-[#A66A3F]" />
          <div className="text-xs">
            {freeShippingRemaining > 0 ? (
              <p className="text-[#1C1C1C]">
                Add <strong className="text-[#A66A3F]">{formatCurrency(freeShippingRemaining, currency)}</strong> more to your bag for <strong>Complimentary Worldwide Shipping</strong>!
              </p>
            ) : (
              <p className="text-emerald-700 font-bold">
                You've earned Complimentary Worldwide Express Shipping!
              </p>
            )}
          </div>
        </div>
        <div className="w-full sm:w-48 bg-stone-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#A66A3F] h-full rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Items Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#DDD8D0] rounded-xs divide-y divide-stone-100">
          {items.map((item) => (
            <div key={item.cartItemId} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              {/* Image & details */}
              <div className="flex gap-4 items-center">
                <a href="https://www.instagram.com/jabthread/" target="_blank" rel="noreferrer" className="w-20 h-24 bg-stone-100 rounded-xs overflow-hidden shrink-0 border border-stone-200">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </a>
                <div>
                  <a href="https://www.instagram.com/jabthread/" target="_blank" rel="noreferrer" className="text-sm font-bold text-[#171717] hover:text-[#A66A3F] transition line-clamp-2">
                    {item.name}
                  </a>
                  <p className="text-xs text-[#6B665F] mt-1">
                    Size: <strong className="text-stone-800">{item.size}</strong> • Color: <strong className="text-stone-800">{item.color}</strong>
                  </p>
                  <p className="text-xs font-bold text-[#171717] mt-1">
                    {formatCurrency(item.price, item.currency || currency)} each
                  </p>
                </div>
              </div>

              {/* Quantity controls & total */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                <div className="flex items-center border border-[#DDD8D0] rounded-xs bg-stone-50">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="p-2 text-stone-600 hover:text-black"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#171717]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="p-2 text-stone-600 hover:text-black"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <span className="text-sm font-extrabold text-[#171717]">
                    {formatCurrency(item.price * item.quantity, item.currency || currency)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="text-stone-400 hover:text-red-700 p-2"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#DDD8D0] rounded-xs p-6 space-y-6">
          <h3 className="text-base font-bold uppercase tracking-wider text-[#171717] pb-3 border-b border-[#DDD8D0]">
            Order Summary
          </h3>

          {/* Promo code form */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="Promo Code (WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 text-xs px-3 py-2.5 border border-[#DDD8D0] rounded-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#171717]"
            />
            <Button type="submit" variant="outline" size="sm" isLoading={isCouponLoading}>
              Apply
            </Button>
          </form>

          {appliedCoupon && (
            <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xs border border-emerald-200">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
              </div>
              <button
                onClick={removeCoupon}
                className="text-emerald-700 underline font-semibold hover:text-emerald-900"
              >
                Remove
              </button>
            </div>
          )}

          {/* Breakdown */}
          <div className="space-y-2 text-xs text-[#6B665F]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-[#1C1C1C]">{formatCurrency(subtotal, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="font-bold">-{formatCurrency(discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Worldwide Shipping</span>
              <span className="font-bold text-[#1C1C1C]">
                {shippingFee === 0 ? 'Complimentary' : formatCurrency(shippingFee, currency)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#171717] pt-4 border-t border-stone-200">
              <span>Estimated Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/checkout')}
            className="gap-2 font-bold shadow-md"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="pt-2 text-[11px] text-[#6B665F] space-y-1 text-center">
            <p>🔒 256-Bit SSL Encrypted Safe Checkout</p>
            <p>Direct Artisanal Dispatch from Sialkot, Pakistan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
