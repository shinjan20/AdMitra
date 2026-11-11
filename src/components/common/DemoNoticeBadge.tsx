import React from 'react';
import { Sparkles, Info, ShieldCheck } from 'lucide-react';

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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}
        title="Simulated Demo Launch: Real advertising APIs can be connected in Phase 2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Demo Prototype
      </span>
    );
  }

  return (
    <div
      className={`bg-amber-50/90 border border-amber-200/90 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5 ${className}`}
    >
      <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <strong className="font-semibold text-amber-950">Prototype Simulation Notice:</strong>{' '}
        Campaign launches and analytics in this MVP are simulated in high fidelity for testing. No
        actual ad spend is charged to credit cards, and ads are not live on external platforms until
        real Ad APIs are enabled in Phase 2.
      </div>
    </div>
  );
};

