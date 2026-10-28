import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export const GallerySection = () => {
  const images = [
    {
      title: 'Full-Grain Vegetable-Tanned Leather Hides',
      category: 'Raw Materials',
      url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Hand Pattern Drafting & Precision Cutting',
      category: 'Workshop Cutting',
      url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Heavy-Gauge Bonded Nylon Stitching',
      category: 'Artisan Assembly',
      url: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Sialkot Master Workshop Floor',
      category: 'Facility & Tools',
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Finished Asymmetrical Moto Jacket',
      category: 'Finished Outerwear',
      url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Heirloom Travel Luggage & Duffels',
      category: 'Finished Products',
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
    },
  ];

  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIdx === null) return;
      if (e.key === 'Escape') setActiveIdx(null);
      if (e.key === 'ArrowRight') setActiveIdx((prev) => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    };

    if (activeIdx !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeIdx, images.length]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
          Atelier Imagery
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          Behind JAB Leather
        </h2>
        <p className="text-xs sm:text-sm text-[#6B665F] mt-2">
          A visual glimpse into our leather grading, cutting, stitching, and finishing ateliers in Sialkot.
        </p>
      </div>

      {/* Gallery Masonry / Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className="group relative aspect-4/3 bg-stone-200 rounded-xs overflow-hidden cursor-pointer border border-[#DDD8D0]"
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#A66A3F] font-bold">
                {img.category}
              </span>
              <h4 className="text-xs sm:text-sm font-bold truncate">{img.title}</h4>
              <div className="absolute top-3 right-3 text-white/80">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Lightbox Modal */}
      {activeIdx !== null && (
        <div
          className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-20 focus:outline-none"
            aria-label="Close lightbox"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Previous button */}
          <button
            onClick={() => setActiveIdx((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-4 sm:left-8 text-white/70 hover:text-white p-3 z-20 focus:outline-none"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Next button */}
          <button
            onClick={() => setActiveIdx((prev) => (prev + 1) % images.length)}
            className="absolute right-4 sm:right-8 text-white/70 hover:text-white p-3 z-20 focus:outline-none"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Image Container */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={images[activeIdx].url}
              alt={images[activeIdx].title}
              className="max-h-[75vh] w-auto object-contain rounded-xs shadow-2xl border border-stone-800"
            />
            <div className="text-center mt-4 text-white">
              <span className="text-xs uppercase tracking-widest text-[#A66A3F] font-bold block mb-1">
                {images[activeIdx].category} ({activeIdx + 1} of {images.length})
              </span>
              <p className="text-sm font-semibold">{images[activeIdx].title}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
