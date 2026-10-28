import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Star, ShieldCheck } from 'lucide-react';
import { reviewService } from '../../services/reviewService';

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.getFeaturedReviews(3)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDD8D0]">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
          Customer Experiences
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          What Our Customers Say
        </h2>
        <p className="text-xs sm:text-sm text-[#6B665F] mt-2">
          Verified feedback from connoisseurs and riders wearing JAB LEATHER worldwide.
        </p>
      </div>

      {!loading && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="p-6 bg-white border border-[#DDD8D0] rounded-xs shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-500 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500' : 'text-stone-300'}`} />
                  ))}
                </div>
                <h4 className="text-sm font-bold text-[#171717]">"{r.title}"</h4>
                <p className="text-xs text-[#6B665F] leading-relaxed italic">
                  "{r.comment}"
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <div>
                  <strong className="text-[#171717] block">{r.author}</strong>
                  <span className="text-stone-400">{r.productName}</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-xl mx-auto py-10 text-center text-sm text-[#6B665F]">
          <MessageSquareQuote className="w-8 h-8 mx-auto mb-3 text-[#A66A3F]" />
          <p>No verified customer reviews are published yet.</p>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
