import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Button from '../../components/common/Button';

export const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      {/* Hero Header */}
      <div className="py-12 border-b border-[#DDD8D0]">
        <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
          Sialkot Atelier & Manufacturing
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171717] tracking-tight max-w-3xl">
          Precision Leather Craftsmanship, Direct From Sialkot, Pakistan.
        </h1>
        <p className="text-sm sm:text-base text-[#6B665F] mt-4 max-w-2xl leading-relaxed">
          JAB Leather is a dedicated leather goods manufacturer and exporter based in Sialkot, Pakistan—a world-renowned center for leather tanning, garment production, and equestrian craft.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-16 items-center">
        <div className="space-y-6 text-sm text-[#1C1C1C] leading-relaxed">
          <h2 className="text-2xl font-extrabold text-[#171717]">
            The Art of Genuine Leather Construction
          </h2>
          <p>
            At JAB Leather, our manufacturing philosophy is grounded in honoring the raw integrity of genuine animal hides. We work primarily with drum-dyed full-grain cowhide, durable buffalo hide, supple lambskin, and split suede.
          </p>
          <p>
            Rather than mass-stamping panels with automated blades, our pattern cutters manually inspect every square foot of leather to determine grain alignment, natural stretch, and thickness. This ensures our jackets and bags endure years of active use while developing a rich, distinctive patina.
          </p>
          <div className="pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#A66A3F] shrink-0 mt-0.5" />
              <span>Full-grain drum-dyed leather hides hand-selected for outerwear durability.</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#A66A3F] shrink-0 mt-0.5" />
              <span>Double-needle French seams with heavy bonded nylon threads on all stress joints.</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#A66A3F] shrink-0 mt-0.5" />
              <span>Antique solid brass and heavy nickel hardware engineered for smooth operation.</span>
            </div>
          </div>
        </div>

        <div className="aspect-4/3 rounded-xs overflow-hidden border border-[#DDD8D0] shadow-md">
          <img
            src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85"
            alt="Handcrafting leather goods in Sialkot, Pakistan"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* OEM & Export Pillars */}
      <div className="bg-[#171717] text-white p-8 sm:p-14 rounded-xs border border-stone-800 my-12">
        <div className="max-w-2xl mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
            Global Trade & Manufacturing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bespoke OEM & Private Label Solutions
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-2">
            Serving international fashion brands, motorcycle clubs, and luxury retailers worldwide with custom manufacturing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-5 bg-stone-900/60 rounded-xs border border-stone-800">
            <h4 className="font-bold text-sm text-white mb-2">Custom Patterns</h4>
            <p className="text-stone-400 leading-relaxed">
              Complete CAD pattern digitizing and sample prototyping built strictly according to client tech-packs and size specs.
            </p>
          </div>
          <div className="p-5 bg-stone-900/60 rounded-xs border border-stone-800">
            <h4 className="font-bold text-sm text-white mb-2">Custom Finishes</h4>
            <p className="text-stone-400 leading-relaxed">
              Bespoke Pantone color dying, distressed pull-up finishes, custom hardware debossing, and woven neck label integration.
            </p>
          </div>
          <div className="p-5 bg-stone-900/60 rounded-xs border border-stone-800">
            <h4 className="font-bold text-sm text-white mb-2">Worldwide Logistics</h4>
            <p className="text-stone-400 leading-relaxed">
              Direct air courier and sea freight export options with full export customs documentation from Sialkot, Pakistan.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-300">
            Interested in partnering with JAB Leather for custom manufacturing or wholesale orders?
          </p>
          <Link to="/contact">
            <Button variant="accent" size="sm" className="gap-2 font-bold whitespace-nowrap">
              <span>Contact Export Team</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
