import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const EditorialBanner = () => {
  return (
    <section className="relative bg-[#3A2418] text-white my-16 overflow-hidden">
      {/* Background Image Container with Editorial Filter */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=2000&q=85"
          alt="Leather Riding Jacket on the Open Road"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#3A2418]/80 to-transparent" />
      </div>

      {/* Editorial Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#A66A3F] block mb-4">
          The Craft of Durability
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Made for the Road. Designed for Everyday.
        </h2>
        <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Heavy-duty drum-dyed cowhide cut for aerodynamic freedom, paired with timeless tailoring that moves effortlessly from highway throttle to urban evenings.
        </p>

        <Link to="/shop">
          <Button
            variant="accent"
            size="lg"
            className="px-8 min-h-[50px] shadow-xl gap-2 font-bold"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default EditorialBanner;
