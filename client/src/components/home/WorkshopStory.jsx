import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const WorkshopStory = () => {
  const steps = [
    {
      step: '01',
      title: 'Leather Selection',
      desc: 'Top-tier drum-dyed full-grain cowhide, goatskin, and soft lambskin hides carefully graded for tensile strength.',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    },
    {
      step: '02',
      title: 'Precision Cutting',
      desc: 'Pattern panels individually hand-cut following the natural stretch and grain direction of each individual hide.',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    },
    {
      step: '03',
      title: 'Artisan Stitching',
      desc: 'Assembled using bonded heavy-gauge nylon threads with reinforced stress points, French seams, and leather piping.',
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80',
    },
    {
      step: '04',
      title: 'Finishing & Inspection',
      desc: 'Every zipper, snap, lining seam, and hardware rivet undergoes meticulous hands-on quality inspection before dispatch.',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-xs border border-[#DDD8D0] my-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#DDD8D0]">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
            Sialkot Heritage
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
            From Leather to Finished Product
          </h2>
          <p className="text-sm text-[#6B665F] mt-2">
            Discover how raw full-grain hides are transformed into enduring motorcycle jackets, tailored outerwear, and leather luggage.
          </p>
        </div>

        <Link to="/about" className="mt-4 md:mt-0 shrink-0">
          <Button variant="outline" size="sm" className="gap-2 font-bold">
            <span>Explore Our Workshop</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* 4 Process Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => (
          <div key={idx} className="flex flex-col group">
            <div className="aspect-4/3 bg-stone-100 rounded-xs overflow-hidden border border-[#DDD8D0] mb-4 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 bg-[#171717] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-xs">
                {item.step}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#171717] mb-1.5 group-hover:text-[#A66A3F] transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-[#6B665F] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkshopStory;
