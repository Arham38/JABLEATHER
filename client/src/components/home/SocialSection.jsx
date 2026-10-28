import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const SocialSection = () => {
  const feedImages = [
    {
      url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80',
      caption: 'Heritage asymmetrical moto jacket in vintage brown cowhide.',
    },
    {
      url: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=500&q=80',
      caption: 'Women’s tailored lambskin jacket in deep obsidian black.',
    },
    {
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
      caption: 'Grand Voyageur full-grain weekender duffel packed for the weekend.',
    },
    {
      url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80',
      caption: 'Hand-burnished bridle leather belts and saddle-stitched wallets.',
    },
    {
      url: 'https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=500&q=80',
      caption: 'Highway patrol armor-ready riding leather jacket.',
    },
    {
      url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80',
      caption: 'Master pattern cutting on 1.4mm drum-dyed leather in Sialkot.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDD8D0]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-1">
            Community & Journal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            Follow JAB Leather
          </h2>
        </div>

        <a
          href="https://www.instagram.com/jabthread/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#A66A3F] transition mt-3 sm:mt-0"
        >
          <InstagramIcon className="w-4 h-4" />
          <span>@jabthread</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {feedImages.map((item, idx) => (
          <a
            key={idx}
            href="https://www.instagram.com/jabthread/"
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square bg-stone-200 rounded-xs overflow-hidden block border border-stone-200"
          >
            <img
              src={item.url}
              alt={item.caption}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center text-white">
              <InstagramIcon className="w-5 h-5 text-white" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default SocialSection;
