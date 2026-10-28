import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, MailX } from 'lucide-react';
import { messagingService } from '../../services/messagingService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const toast = useToast();

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await messagingService.unsubscribeNewsletter(email);
      setUnsubscribed(true);
      toast.success('You have been unsubscribed from our newsletter.');
    } catch (err) {
      toast.error(err.message || 'Unable to process unsubscribe request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="bg-white border border-[#DDD8D0] p-8 rounded-xs shadow-sm">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#A66A3F]">
          {unsubscribed ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <MailX className="w-6 h-6" />}
        </div>

        <h1 className="text-2xl font-extrabold text-[#171717] mb-2">
          {unsubscribed ? 'Unsubscribed' : 'Unsubscribe from Newsletter'}
        </h1>

        <p className="text-xs text-[#6B665F] mb-6">
          {unsubscribed
            ? `Your email (${email}) has been removed from our dispatch mailing list.`
            : 'Enter your email below to opt out of promotional drops and atelier news.'}
        </p>

        {unsubscribed ? (
          <Link to="/">
            <Button variant="primary" size="md">Return to Home</Button>
          </Link>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full text-xs px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xs text-[#171717] focus:outline-none focus:border-[#A66A3F]"
            />
            <Button variant="accent" size="md" fullWidth isLoading={loading}>
              Confirm Unsubscribe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
