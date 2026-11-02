'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { ...item, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-lg shadow-lg text-xs animate-in slide-in-from-right-4 duration-200"
          >
            {t.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />}
            {(!t.type || t.type === 'info') && <Info className="h-4 w-4 text-slate-700 flex-shrink-0 mt-0.5" />}

            <div className="flex-1">
              <p className="font-semibold text-slate-900">{t.title}</p>
              {t.message && <p className="text-slate-500 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
