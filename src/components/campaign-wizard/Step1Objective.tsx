import React from 'react';
import { CampaignObjective } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Users,
  MessageSquare,
  Eye,
  Check,
  ArrowRight,
} from 'lucide-react';

interface Step1ObjectiveProps {
  selectedObjective: CampaignObjective;
  onSelectObjective: (obj: CampaignObjective) => void;
  onNext: () => void;
}

export const Step1Objective: React.FC<Step1ObjectiveProps> = ({
  selectedObjective,
  onSelectObjective,
  onNext,
}) => {
  const { tr } = useApp();
  const objectives: {
    id: CampaignObjective;
    title: string;
    description: string;
    icon: React.ReactNode;
    bestFor: string;
  }[] = [
    {
      id: 'messages',
      title: 'Get WhatsApp messages',
      description: 'People can message you to ask questions or book an appointment.',
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      bestFor: 'Good for salons, restaurants, and local services',
    },
    {
      id: 'leads',
      title: 'Get phone enquiries',
      description: 'People share their name and number so you can call them back.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bestFor: 'Good for classes, gyms, and clinics',
    },
    {
      id: 'awareness',
      title: 'Help local people find your shop',
      description: 'Show nearby people what you offer and where to find you.',
      icon: <Eye className="w-5 h-5 text-slate-700" />,
      bestFor: 'Good for shops, cafes, and restaurants',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display text-2xl font-bold">
          {tr('What would you like people to do?')}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
          {tr('Pick the option that suits your business. You can change it later.')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {objectives.map((obj) => {
          const isSelected = selectedObjective === obj.id;
          return (
            <button
              type="button"
              key={obj.id}
              onClick={() => onSelectObjective(obj.id)}
              aria-pressed={isSelected}
              className={`relative flex min-h-48 w-full flex-col justify-start rounded-2xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)] ${
                isSelected
                  ? 'border-[color:var(--marigold)] bg-[color:var(--marigold-soft)]/60 shadow-sm'
                  : 'border-[color:var(--line)] bg-white hover:border-[color:var(--line-strong)] hover:bg-[color:var(--paper)]/40'
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white">
                  {obj.icon}
                </span>
                {isSelected ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--marigold)] text-[color:var(--ink)]">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="h-6 w-6 rounded-full border border-[color:var(--line-strong)]" />
                )}
              </span>

              <span className="mt-4 block text-xs font-semibold text-[color:var(--ink-soft)]">
                {tr(obj.bestFor)}
              </span>

              <span className="mt-1 block text-base font-bold text-[color:var(--ink)]">{tr(obj.title)}</span>

              <span className="mt-2 block text-sm leading-relaxed text-[color:var(--ink-soft)]">
                {tr(obj.description)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end border-t border-[color:var(--line)] pt-4">
        <button onClick={onNext} className="btn-primary text-sm">
          {tr('Continue')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
