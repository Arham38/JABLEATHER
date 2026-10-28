import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-stone-200 text-stone-800 border-stone-300',
    sale: 'bg-red-950 text-red-100 border-red-800',
    bestseller: 'bg-[#3A2418] text-amber-100 border-[#503222]',
    new: 'bg-[#171717] text-white border-stone-700',
    accent: 'bg-[#A66A3F] text-white border-[#8e5832]',
    success: 'bg-emerald-950 text-emerald-200 border-emerald-800',
    warning: 'bg-amber-950 text-amber-200 border-amber-800',
    outline: 'border border-[#DDD8D0] text-[#1C1C1C] bg-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-sm border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
