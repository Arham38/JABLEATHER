import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav aria-label="Breadcrumbs" className="py-3 text-xs text-[#6B665F]">
      <ol className="flex items-center space-x-2 flex-wrap">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-[#171717] transition"
            title="Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              {isLast || !item.to ? (
                <span className="font-semibold text-[#1C1C1C] truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-[#171717] transition truncate max-w-[150px]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
