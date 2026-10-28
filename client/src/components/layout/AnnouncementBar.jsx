import React from 'react';

export const AnnouncementBar = ({
  message = 'Worldwide Shipping • Custom & Wholesale Orders Welcome',
}) => {
  return (
    <div className="bg-[#171717] text-white py-2 px-4 text-xs font-medium tracking-wide text-center border-b border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <span>{message}</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
