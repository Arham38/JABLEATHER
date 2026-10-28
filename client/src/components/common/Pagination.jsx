import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center space-x-2 my-10"
      aria-label="Pagination Navigation"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-[#DDD8D0] rounded-sm text-[#1C1C1C] hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[40px] h-[40px] text-sm font-medium rounded-sm border transition ${
            currentPage === page
              ? 'bg-[#171717] text-white border-[#171717]'
              : 'border-[#DDD8D0] bg-white text-[#1C1C1C] hover:bg-stone-50'
          }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-[#DDD8D0] rounded-sm text-[#1C1C1C] hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
