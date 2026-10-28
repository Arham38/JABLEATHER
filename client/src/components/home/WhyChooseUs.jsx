import React from 'react';
import { ShieldCheck, Scissors, Sliders, Globe } from 'lucide-react';

export const WhyChooseUs = () => {
  const pillars = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#A66A3F]" />,
      title: 'Genuine Leather',
      description: 'Quality leather selected for our products, sourced from ethically raised cattle, sheep, and goat hides.',
    },
    {
      icon: <Scissors className="w-8 h-8 text-[#A66A3F]" />,
      title: 'Skilled Craftsmanship',
      description: 'Careful cutting, stitching, finishing, and inspection performed by experienced master leather artisans in Sialkot.',
    },
    {
      icon: <Sliders className="w-8 h-8 text-[#A66A3F]" />,
      title: 'Custom Options',
      description: 'Custom designs, colors, sizing, and private-label branding options available for individual and wholesale orders.',
    },
    {
      icon: <Globe className="w-8 h-8 text-[#A66A3F]" />,
      title: 'Worldwide Shipping',
      description: 'Reliable express door-to-door courier shipping options available for customers and businesses worldwide.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDD8D0]">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
          Our Commitment
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          Why Choose JAB Leather
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pillars.map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-xs border border-[#DDD8D0] shadow-xs hover:border-[#171717] transition duration-300 flex flex-col items-start"
          >
            <div className="p-3 bg-[#F7F5F0] rounded-xs mb-5">
              {item.icon}
            </div>
            <h3 className="text-base font-bold text-[#171717] mb-2">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B665F] leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
