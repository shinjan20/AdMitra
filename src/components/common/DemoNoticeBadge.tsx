import React from 'react';
import { Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DemoNoticeBadgeProps {
  compact?: boolean;
  className?: string;
}

export const DemoNoticeBadge: React.FC<DemoNoticeBadgeProps> = ({
  compact = false,
  className = '',
}) => {
  const { tr } = useApp();

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-[#f0dcae] bg-[#fff7e6] px-2.5 py-1 text-[0.6875rem] font-semibold text-[color:var(--marigold-ink)] ${className}`}
        title={tr('This is a sample plan. Nothing goes live and no money is spent.')}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--marigold)]" aria-hidden="true" />
        {tr('Practice only')}
      </span>
    );
  }

  return (
    <div className={`notice ${className}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand)]" aria-hidden="true" />
      <div className="leading-relaxed">
        <span className="font-bold text-[#5a3c05]">{tr('This is a sample plan.')}</span>{' '}
        {tr('Nothing goes live, the numbers are examples, and no money is spent.')}
      </div>
    </div>
  );
};
