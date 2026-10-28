import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import Drawer from '../common/Drawer';
import Button from '../common/Button';

export const CartDrawer = () => {
  const {
    isCartOpen,
    closeCart,
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
  } = useCart();
  const currency = items[0]?.currency || 'USD';

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput);
      setCouponInput('');
    } catch {
      // Toast already shown in context
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={closeCart}
      title={`Shopping Bag (${itemCount})`}
      width="max-w-md"
    >
      <div className="flex flex-col h-full -m-6">
        {/* Free Shipping Progress Indicator */}
        <div className="bg-stone-50 border-b border-[#DDD8D0] px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1C1C] mb-1.5">
            <Truck className="w-4 h-4 text-[#A66A3F]" />
            {freeShippingRemaining > 0 ? (
              <span>
                Add <strong className="text-[#A66A3F]">{formatCurrency(freeShippingRemaining, currency)}</strong> more for Complimentary Global Shipping
              </span>
            ) : (
              <span className="text-emerald-700">
                You've unlocked Complimentary Worldwide Shipping!
              </span>
            )}
          </div>
          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#A66A3F] h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#171717]">Your Bag is Empty</h4>
                <p className="text-xs text-[#6B665F] mt-1 max-w-[200px]">
                  Discover our handcrafted genuine leather jackets and accessories.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
              >
                Explore Collection
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex gap-4 pb-4 border-b border-stone-100 last:border-b-0"
              >
                {/* Product Thumbnail */}
                <Link
                  to={`/product/${item.slug}`}
                  onClick={closeCart}
                  className="w-20 h-24 bg-stone-100 shrink-0 overflow-hidden rounded-xs border border-stone-200"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-center hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </Link>

                {/* Info & Stepper */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="text-xs font-bold text-[#171717] hover:text-[#A66A3F] transition line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-stone-400 hover:text-red-700 transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6B665F]">
                      {item.size && <span>Size: <strong className="text-stone-800">{item.size}</strong></span>}
                      <span>•</span>
                      {item.color && <span>Color: <strong className="text-stone-800">{item.color}</strong></span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-[#DDD8D0] rounded-xs bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 text-stone-600 hover:text-black transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-[#171717]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 text-stone-600 hover:text-black transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#171717]">
                        {formatCurrency(item.price * item.quantity, item.currency || currency)}
                      </span>
                      {item.compareAtPrice && (
                        <span className="block text-[10px] text-stone-400 line-through">
                          {formatCurrency(item.compareAtPrice * item.quantity, item.currency || currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 bg-[#F7F5F0] border-t border-[#DDD8D0] space-y-4">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#DDD8D0] rounded-xs bg-white uppercase placeholder:normal-case focus:outline-none focus:border-[#171717]"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={isCouponLoading}
              >
                Apply
              </Button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-xs border border-emerald-200">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-emerald-700 underline font-semibold hover:text-emerald-900 ml-2"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6B665F]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1C1C1C]">{formatCurrency(subtotal, currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatCurrency(discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B665F]">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-[#1C1C1C]">
                  {shippingFee === 0 ? 'Free' : formatCurrency(shippingFee, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#171717] pt-2 border-t border-stone-200">
                <span>Estimated Total</span>
                <span className="text-base">{formatCurrency(total, currency)}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleProceedToCheckout}
                className="gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;
