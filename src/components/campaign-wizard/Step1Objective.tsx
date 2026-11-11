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
  const { activeBusiness } = useApp();

  const objectives: {
    id: CampaignObjective;
    title: string;
    description: string;
    example: string;
    icon: React.ReactNode;
    channel: string;
    bestFor: string;
  }[] = [
    {
      id: 'messages',
      title: 'Get WhatsApp Enquiries',
      description:
        'Customers tap your ad to start a chat directly on WhatsApp. Best for price estimates, custom requests, and booking appointments.',
      example: `Example: ${activeBusiness.businessName} getting WhatsApp chats from customers asking about pricing and availability.`,
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      channel: 'WhatsApp Direct Chat',
      bestFor: 'Recommended for Salons, Bakeries & Local Services',
    },
    {
      id: 'leads',
      title: 'Collect Direct Leads & Phone Numbers',
      description:
        'Customers submit their name and phone number directly in the ad. Best for callbacks, consultations, and high-intent bookings.',
      example:
        'Example: Parents or students requesting a free counseling call or campus visit.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      channel: 'Lead Form & Direct Callback',
      bestFor: 'Recommended for Coaching, Gyms & Clinics',
    },
    {
      id: 'awareness',
      title: 'Attract Local Store Footfall',
      description:
        'Maximize visibility among nearby residents within 5–10 km to build local recognition and drive visits to your physical location.',
      example:
        'Example: A restaurant or boutique promoting weekend specials or grand opening.',
      icon: <Eye className="w-5 h-5 text-slate-700" />,
      channel: 'Feeds & Stories',
      bestFor: 'Recommended for Restaurants & Retail Stores',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          What is the primary goal for this campaign?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose what you want customers to do. AI will tailor your ad copy, CTAs, and audience targeting to this goal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {objectives.map((obj) => {
          const isSelected = selectedObjective === obj.id;
          return (
            <div
              key={obj.id}
              onClick={() => onSelectObjective(obj.id)}
              className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 bg-slate-50/50 shadow-2xs ring-1 ring-slate-900'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center">
                    {obj.icon}
                  </div>
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>

                <span className="text-[10px] font-medium text-slate-500 block mb-1">
                  {obj.bestFor}
                </span>

                <h3 className="text-sm font-semibold text-slate-900">{obj.title}</h3>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {obj.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                <p className="text-[11px] text-slate-500 italic bg-slate-100/70 p-2 rounded-lg">
                  {obj.example}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Channel:</span>
                  <span className="font-medium text-slate-700">{obj.channel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end pt-3 border-t border-slate-100">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-all"
        >
          Next: Strategy
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
