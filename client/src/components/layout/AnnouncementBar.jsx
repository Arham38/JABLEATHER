import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export const AnnouncementBar = ({
  message = 'Handcrafted in Sialkot, Pakistan • Complimentary Worldwide DHL Express Shipping on Orders Over $150',
}) => {
  const { currency, supportedCurrencies, setCurrency } = useCurrency();

  return (
    <div className="bg-[#171717] text-white py-1.5 px-4 text-xs font-medium tracking-wide border-b border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex-1 text-center sm:text-left">
          <span>{message}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-stone-400">Currency:</span>
          <select
            value={currency}
            aria-label="Currency"
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-1.5 py-0.5 focus:outline-none focus:border-[#A66A3F]"
          >
            {supportedCurrencies.map((c) => (
              <option key={c} value={c} className="bg-stone-900 text-white">
                {c === 'USD' ? 'USD ($)' : c === 'PKR' ? 'PKR (₨)' : c === 'EUR' ? 'EUR (€)' : c === 'GBP' ? 'GBP (£)' : c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
