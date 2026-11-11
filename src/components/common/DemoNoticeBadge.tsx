import React from 'react';
import { Info } from 'lucide-react';

interface DemoNoticeBadgeProps {
  compact?: boolean;
  className?: string;
}

export const DemoNoticeBadge: React.FC<DemoNoticeBadgeProps> = ({
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80 ${className}`}
        title="Simulated Demo Launch: Real advertising APIs can be connected in Phase 2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Demo Mode
      </span>
    );
  }

  return (
    <div
      className={`bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2.5 ${className}`}
    >
      <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-slate-800">Simulated MVP:</span>{' '}
        Campaign launches and analytics are simulated in high fidelity for testing. No
        real money is spent, and ads are not published to external platforms until API integration in Phase 2.
      </div>
    </div>
  );
};
