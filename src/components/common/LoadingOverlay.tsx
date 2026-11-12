import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progressText?: string;
  showProgress?: boolean;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  progressText,
  showProgress,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="rounded-lg bg-white p-6 shadow-lg sm:max-w-sm">
        {/* Spinner */}
        <div className="flex justify-center">
          <Loader className="h-12 w-12 animate-spin text-[var(--brand)]" />
        </div>

        {/* Message */}
        <p className="mt-4 text-center text-base font-semibold text-slate-900">{message}</p>

        {/* Progress Text */}
        {progressText && (
          <p className="mt-2 text-center text-sm text-slate-600">{progressText}</p>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-[var(--brand)] transition-all duration-300"
              style={{
                width: '65%',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};
