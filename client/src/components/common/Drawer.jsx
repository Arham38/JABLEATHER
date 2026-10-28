import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right', // 'right' | 'left' | 'bottom'
  width = 'max-w-md',
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let placementClasses = 'inset-y-0 right-0 h-full';
  let animationClasses = 'translate-x-0';

  if (side === 'left') {
    placementClasses = 'inset-y-0 left-0 h-full';
  } else if (side === 'bottom') {
    placementClasses = 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl';
  }

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className={`fixed ${placementClasses} w-full ${width} bg-white shadow-2xl z-10 flex flex-col transition-transform duration-300 ${animationClasses}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD8D0] bg-[#F7F5F0]">
          {title ? (
            <h3 className="text-base font-bold uppercase tracking-wider text-[#171717]">
              {title}
            </h3>
          ) : <div />}
          {showClose && (
            <button
              onClick={onClose}
              className="text-[#6B665F] hover:text-[#171717] p-2 transition rounded-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
