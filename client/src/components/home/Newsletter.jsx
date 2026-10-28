import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    // Simulate newsletter subscription
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast.success('Thank you for subscribing to JAB Leather updates!');
    }, 400);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#171717] text-white rounded-xs p-8 sm:p-14 text-center max-w-4xl mx-auto border border-stone-800 relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#A66A3F]">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Stay Updated
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 mb-8 leading-relaxed">
            Get updates about new collections, workshop drops, and seasonal offers directly from our atelier.
          </p>

          {isSubscribed ? (
            <div className="p-4 bg-white/10 border border-emerald-500/40 rounded-xs flex items-center justify-center gap-2 text-emerald-300 text-sm font-semibold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>You're on the list. Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-4 py-3.5 rounded-xs bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A66A3F]"
                required
              />
              <Button
                type="submit"
                variant="accent"
                size="md"
                isLoading={isSubmitting}
                className="shrink-0 px-6 font-bold"
              >
                Subscribe
              </Button>
            </form>
          )}

          <p className="text-[11px] text-stone-400 mt-4">
            We value your privacy. Unsubscribe anytime with one click.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
