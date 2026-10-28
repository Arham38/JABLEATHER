import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const Hero = () => {
  return (
    <section className="relative bg-[#171717] text-white overflow-hidden">
      {/* Background Image Container with Overlay */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85"
          />
          <img
            src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=2000&q=90"
            alt="Handcrafted JAB Leather Motorcycle Jacket"
            className="w-full h-full object-cover object-[70%_30%] md:object-center opacity-65"
          />
        </picture>
        {/* Subtle dark gradient for perfect editorial readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
      </div>

      {/* Hero Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 md:py-44 flex flex-col justify-center min-h-[580px] md:min-h-[720px]">
        <div className="max-w-2xl">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-[11px] font-bold uppercase tracking-widest text-[#A66A3F] mb-6">
            <span>Sialkot, Pakistan • Leather Manufacturer</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Premium Leather Jackets, Made for You
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed mb-8 max-w-xl">
            Genuine leather products crafted with attention to detail, quality materials, and timeless style. Hand-finished by skilled artisans.
          </p>

          {/* Buttons: Shop Men & Shop Women */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link to="/men">
              <Button
                variant="accent"
                size="lg"
                className="w-full sm:w-auto px-8 min-h-[50px] gap-2 shadow-lg"
              >
                <span>Shop Men</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/women">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 min-h-[50px] border-white/40 text-white hover:bg-white hover:text-black"
              >
                <span>Shop Women</span>
              </Button>
            </Link>
          </div>

          {/* Factual Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-12 mt-12 border-t border-white/15 text-xs text-stone-300">
            <div>
              <span className="block font-bold text-white text-sm sm:text-base">100% Genuine</span>
              <span className="text-[11px] text-stone-400">Selected Animal Hides</span>
            </div>
            <div>
              <span className="block font-bold text-white text-sm sm:text-base">Custom OEM</span>
              <span className="text-[11px] text-stone-400">Wholesale & Private Label</span>
            </div>
            <div>
              <span className="block font-bold text-white text-sm sm:text-base">Worldwide</span>
              <span className="text-[11px] text-stone-400">Express Courier Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
