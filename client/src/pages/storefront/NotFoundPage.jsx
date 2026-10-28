import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-full bg-stone-200/60 mb-6">
          <Compass className="w-12 h-12 text-[#A66A3F] animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#171717] mb-2 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-[#6B665F] mb-8 leading-relaxed">
          The leather collection, catalog article, or account portal page you are seeking cannot be located.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#171717] hover:bg-[#A66A3F] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#DDD8D0] hover:bg-stone-100 text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xs transition"
          >
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
