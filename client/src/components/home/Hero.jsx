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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[11px] font-extrabold uppercase tracking-widest text-[#B56F35] mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B56F35] animate-ping" />
            <span>Sialkot Heritage Atelier • Full-Grain Leather Craft</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Mastercrafted Leather Outerwear &amp; Goods
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-stone-200/90 font-normal leading-relaxed mb-8 max-w-xl">
            Bench-crafted by generational master tanners and artisans in Sialkot. Hand-selected full-grain hides, reinforced stitching, and timeless silhouettes built for a lifetime of resilience.
          </p>

          {/* Buttons: Shop Men & Shop Women */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link to="/shop">
              <Button
                variant="accent"
                size="lg"
                className="w-full sm:w-auto px-8 min-h-[52px] gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform font-bold tracking-wider uppercase text-xs"
              >
                <span>Explore Full Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/category/custom-leather-products">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 min-h-[52px] border-white/50 text-white hover:bg-white hover:text-black hover:scale-[1.02] active:scale-[0.98] transition-all font-bold tracking-wider uppercase text-xs"
              >
                <span>Custom Made-to-Measure</span>
              </Button>
            </Link>
          </div>

          {/* Factual Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-10 mt-12 border-t border-white/20 text-xs text-stone-300">
            <div>
              <span className="block font-extrabold text-white text-sm sm:text-base tracking-tight">100% Full-Grain</span>
              <span className="text-[11px] text-stone-400 font-medium">Selected Cowhide &amp; Lambskin</span>
            </div>
            <div>
              <span className="block font-extrabold text-white text-sm sm:text-base tracking-tight">Bespoke &amp; OEM</span>
              <span className="text-[11px] text-stone-400 font-medium">Private Label &amp; Club Orders</span>
            </div>
            <div>
              <span className="block font-extrabold text-white text-sm sm:text-base tracking-tight">Express Worldwide</span>
              <span className="text-[11px] text-stone-400 font-medium">Complimentary Courier $150+</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
