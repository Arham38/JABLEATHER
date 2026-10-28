import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Briefcase } from 'lucide-react';
import Button from '../common/Button';

export const CustomWholesale = () => {
  const capabilities = [
    'OEM Manufacturing',
    'Private Label Production',
    'Custom Technical Designs',
    'Bespoke Pantone Colors',
    'Custom Sizing & Tech Packs',
    'Custom Hardware & Embossing',
    'Bulk Order Worldwide Export',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#171717] text-white rounded-xs p-8 sm:p-14 border border-stone-800 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Info Column */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A66A3F]/20 text-[#A66A3F] border border-[#A66A3F]/30 rounded-xs text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>B2B & Export Services</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Custom & Wholesale Leather Manufacturing
          </h2>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            We work with retailers, fashion brands, motorcycle clubs, and international businesses seeking reliable custom leather products and private-label manufacturing direct from our Sialkot factory.
          </p>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-stone-200">
                <div className="w-4 h-4 rounded-full bg-[#A66A3F] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span>{cap}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/contact">
              <Button variant="accent" size="md" className="gap-2 font-bold px-6">
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/contact">
              <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white hover:text-black">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Visual Feature */}
        <div className="relative">
          <div className="aspect-4/3 rounded-xs overflow-hidden border border-stone-800 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85"
              alt="B2B Wholesale Custom Leather Manufacturing Workshop"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 bg-[#3A2418] text-white p-4 rounded-xs border border-amber-900/40 hidden sm:block max-w-xs shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#A66A3F]">Direct Exporter</p>
            <p className="text-xs text-stone-300 mt-1">
              Low MOQs, comprehensive sample prototyping, and global CIF/FOB logistics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomWholesale;
