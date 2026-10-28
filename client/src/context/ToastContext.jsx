import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast({ message, type: 'success', duration }),
    error: (message, duration) => addToast({ message, type: 'error', duration }),
    warning: (message, duration) => addToast({ message, type: 'warning', duration }),
    info: (message, duration) => addToast({ message, type: 'info', duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bgClass = 'bg-stone-900 text-white border-stone-800';
          let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

          if (t.type === 'success') {
            bgClass = 'bg-stone-950 text-white border-amber-800/40';
            icon = <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-red-950 text-white border-red-800';
            icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-amber-950 text-white border-amber-700';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-md shadow-2xl border ${bgClass} text-sm transition-all duration-300 animate-fade-in`}
              role="alert"
            >
              <div className="flex items-center gap-3">
                {icon}
                <p className="font-medium text-stone-100">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-stone-400 hover:text-white p-1 transition"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
