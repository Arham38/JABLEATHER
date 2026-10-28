import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CreditCard, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';
import { validateCheckoutForm } from '../../utils/validation';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const CheckoutPage = () => {
  const { items, subtotal, discount, shippingFee, total, clearCart } = useCart();
  const currency = items[0]?.currency || 'USD';
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@example.com',
    phone: '+1 (555) 234-8901',
    country: 'United States',
    address: '742 Evergreen Terrace',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    sameBillingAsShipping: true,
    billingAddress: '',
    paymentMethod: 'card',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateCheckoutForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      toast.error('Please resolve the required checkout fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/shop');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Simulate gateway processing (UI phase only, no real money or card storage)
      await paymentService.simulatePaymentProcessing({
        method: formData.paymentMethod,
        amount: total,
      });

      // 2. Create order record
      const order = await orderService.createOrder({
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        items: [...items],
        subtotal,
        discount,
        shippingFee,
        total,
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/checkout/success?orderId=${order.id}`);
    } catch (err) {
      toast.error(err.message || 'Order completion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#171717] mb-4">No items to checkout</h2>
        <Link to="/shop">
          <Button variant="primary" size="sm">Go to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Bag', to: '/cart' },
          { label: 'Checkout' },
        ]}
      />

      <div className="flex items-center justify-between py-6 border-b border-[#DDD8D0] mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F]">
            Secure Order
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            Checkout & Shipping
          </h1>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-stone-600">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>SSL Encrypted Checkout</span>
        </div>
      </div>

      <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact */}
          <div className="bg-white p-6 rounded-xs border border-[#DDD8D0] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#171717] pb-3 border-b border-stone-100">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={formErrors.firstName}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={formErrors.lastName}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address (For Tracking & Invoice)"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
                required
              />
              <Input
                label="Phone Number (For Courier Delivery)"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={formErrors.phone}
                required
              />
            </div>
          </div>

          {/* Section 2: Shipping Destination */}
          <div className="bg-white p-6 rounded-xs border border-[#DDD8D0] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#171717] pb-3 border-b border-stone-100">
              2. Shipping Address
            </h3>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1.5">
                Country / Destination
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-[#DDD8D0] rounded-xs text-[#1C1C1C]"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="Pakistan">Pakistan</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
            </div>

            <Input
              label="Street Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              error={formErrors.address}
              placeholder="House/Apartment number, street name"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={formErrors.city}
                required
              />
              <Input
                label="State / Province"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                error={formErrors.state}
                required
              />
              <Input
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                error={formErrors.postalCode}
                required
              />
            </div>

            <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sameBillingAsShipping}
                onChange={(e) => handleInputChange('sameBillingAsShipping', e.target.checked)}
                className="w-4 h-4 rounded-xs border-stone-300 text-stone-900"
              />
              <span>Billing address same as shipping</span>
            </label>
          </div>

          {/* Section 3: Payment Method (Simulated Gateway UI) */}
          <div className="bg-white p-6 rounded-xs border border-[#DDD8D0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
                3. Payment Method
              </h3>
              <span className="text-[11px] text-[#A66A3F] font-bold">Simulated Development Gateway</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs text-[#6B665F]">
              <p>
                <strong>Notice:</strong> This is the frontend demonstration phase. No real card charge will be made. Do NOT enter real card numbers or CVVs.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-xs cursor-pointer border-[#171717] bg-stone-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => handleInputChange('paymentMethod', 'card')}
                  className="w-4 h-4 text-[#171717]"
                />
                <CreditCard className="w-5 h-5 text-[#A66A3F]" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-[#171717] block">Credit / Debit Card (Simulated)</span>
                  <span className="text-[#6B665F]">Instant verification via secure mock processing</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border rounded-xs cursor-pointer border-[#DDD8D0] hover:bg-stone-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wire"
                  checked={formData.paymentMethod === 'wire'}
                  onChange={() => handleInputChange('paymentMethod', 'wire')}
                  className="w-4 h-4 text-[#171717]"
                />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-[#171717] block">Bank TT / Wire Transfer</span>
                  <span className="text-[#6B665F]">Recommended for B2B wholesale orders above $1,000</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Review (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xs border border-[#DDD8D0] sticky top-28 space-y-6">
          <h3 className="text-base font-bold uppercase tracking-wider text-[#171717] pb-3 border-b border-[#DDD8D0]">
            Order Review ({items.length})
          </h3>

          {/* Items Preview */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex items-center gap-3 text-xs">
                <img src={item.image} alt="" className="w-12 h-14 object-cover rounded-xs border border-stone-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#171717] truncate">{item.name}</p>
                  <p className="text-[#6B665F]">Qty: {item.quantity} • {item.size} • {item.color}</p>
                </div>
                <span className="font-bold text-[#171717]">
                  {formatCurrency(item.price * item.quantity, item.currency || currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 text-xs pt-4 border-t border-stone-200 text-[#6B665F]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#1C1C1C]">{formatCurrency(subtotal, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount</span>
                <span>-{formatCurrency(discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Worldwide Courier</span>
              <span className="font-semibold text-[#1C1C1C]">
                {shippingFee === 0 ? 'Complimentary' : formatCurrency(shippingFee, currency)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#171717] pt-3 border-t border-stone-200">
              <span>Grand Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isProcessing}
            className="gap-2 font-bold shadow-md"
          >
            <span>Complete Order & Authorize</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-[11px] text-center text-[#6B665F]">
            By placing your order, you agree to JAB Leather's Terms of Sale and Global Export Policy.
          </p>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
