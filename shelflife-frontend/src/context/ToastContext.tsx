import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (messageOrTitle: string, typeOrSubtitle?: ToastType | string, optionalType?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (messageOrTitle: string, typeOrSubtitle?: ToastType | string, optionalType?: ToastType) => {
      const id = Math.random().toString(36).substring(2, 9);

      let title = messageOrTitle;
      let message: string | undefined = undefined;
      let type: ToastType = 'info';

      if (optionalType) {
        title = messageOrTitle;
        message = typeOrSubtitle as string;
        type = optionalType;
      } else if (typeOrSubtitle === 'success' || typeOrSubtitle === 'error' || typeOrSubtitle === 'info') {
        type = typeOrSubtitle;
        if (messageOrTitle.includes('!')) {
          const parts = messageOrTitle.split('!');
          title = parts[0] + '!';
          message = parts.slice(1).join('!').trim() || undefined;
        } else if (messageOrTitle.includes(':')) {
          const parts = messageOrTitle.split(':');
          title = parts[0].trim();
          message = parts.slice(1).join(':').trim() || undefined;
        } else {
          title = messageOrTitle;
        }
      } else if (typeof typeOrSubtitle === 'string') {
        title = messageOrTitle;
        message = typeOrSubtitle;
      }

      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container - clean, restrained, academic */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start p-3 rounded-lg shadow-sm border border-slate-200 bg-white"
            role="status"
          >
            {/* Small icon */}
            <div className="mr-2.5 mt-0.5 flex-shrink-0">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-[#C53030]" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-[#1769AA]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-xs">
              <div className="font-semibold text-[#172033] leading-snug">
                {toast.title}
              </div>
              {toast.message && (
                <div className="text-slate-500 mt-0.5 leading-snug">
                  {toast.message}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600 transition"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
