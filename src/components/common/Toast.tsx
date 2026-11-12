import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, tr } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 md:bottom-5 md:right-5">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
        let borderClass = 'border-blue-200 bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
          borderClass = 'border-emerald-200 bg-emerald-50/50';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
          borderClass = 'border-amber-200 bg-amber-50/50';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
          borderClass = 'border-rose-200 bg-rose-50/50';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{tr(toast.title)}</p>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{tr(toast.message)}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label={tr('Dismiss')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

