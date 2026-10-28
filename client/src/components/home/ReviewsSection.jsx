import React from 'react';
import { MessageSquareQuote } from 'lucide-react';

export const ReviewsSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDD8D0]">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
          Customer Experiences
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          What Our Customers Say
        </h2>
      </div>

      <div className="max-w-xl mx-auto py-10 text-center text-sm text-[#6B665F]">
        <MessageSquareQuote className="w-8 h-8 mx-auto mb-3 text-[#A66A3F]" />
        <p>No verified customer reviews are available yet.</p>
      </div>
    </section>
  );
};

export default ReviewsSection;
