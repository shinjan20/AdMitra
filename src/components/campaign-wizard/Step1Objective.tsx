import React from 'react';
import { CampaignObjective } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Users,
  MessageSquare,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
    subtitle: string;
    description: string;
    example: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
    channel: string;
  }[] = [
    {
      id: 'messages',
      title: 'Get More Messages',
      subtitle: 'Direct conversations on WhatsApp or Instagram',
      description:
        'Customers tap your ad to immediately open a chat with your business. Ideal for scheduling appointments, price quotes, and answering questions.',
      example: `Example: ${activeBusiness.businessName} getting direct WhatsApp chats from brides-to-be wanting makeup package prices.`,
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-500 bg-emerald-50/20',
      badge: 'Most Popular for Local SMBs',
      channel: 'WhatsApp / Direct Chat',
    },
    {
      id: 'leads',
      title: 'Generate More Leads',
      subtitle: 'Collect contact enquiries & phone numbers',
      description:
        'Customers fill out a fast contact form right inside the ad. Perfect for booking consultations, course admissions, or high-value services.',
      example:
        'Example: Coaching centres or gyms collecting student/prospect phone numbers for direct callback.',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50/20',
      badge: 'Best for Consultations & High Value',
      channel: 'Lead Form & Phone Callbacks',
    },
    {
      id: 'awareness',
      title: 'Increase Local Brand Awareness',
      subtitle: 'Maximum visibility & neighbourhood recall',
      description:
        'Show your advertisement to the maximum number of people living or working within your local radius. Builds strong top-of-mind recall.',
      example:
        'Example: A new restaurant, cafe, or store announcing its grand opening to nearby residents.',
      icon: <Eye className="w-6 h-6 text-indigo-600" />,
      color: 'border-indigo-500 bg-indigo-50/20',
      badge: 'Best for Grand Openings & Retail',
      channel: 'Feeds, Stories & Local Reach',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          What is your primary goal for this campaign?
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select what you want customers to do when they see your advertisement. We will tailor
          all AI creatives, audience targeting, and budgets to this goal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {objectives.map((obj) => {
          const isSelected = selectedObjective === obj.id;
          return (
            <div
              key={obj.id}
              onClick={() => onSelectObjective(obj.id)}
              className={`relative p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? `${obj.color} border-blue-600 shadow-md ring-2 ring-blue-500/20`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    {obj.icon}
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>

                <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mb-2">
                  {obj.badge}
                </span>

                <h3 className="text-base font-bold text-slate-900">{obj.title}</h3>
                <p className="text-xs font-medium text-slate-600 mt-0.5">{obj.subtitle}</p>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {obj.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80">
                <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {obj.example}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Channel:</span>
                  <span className="font-semibold text-slate-800">{obj.channel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rationale Callout */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold">AI Recommendation for {activeBusiness.category}:</span>{' '}
          Most {activeBusiness.category.toLowerCase()} businesses in {activeBusiness.location.city}{' '}
          experience the highest conversion rate with <strong>Get More Messages (WhatsApp)</strong>{' '}
          or <strong>Generate Leads</strong> because clients prefer discussing custom requirements before visiting.
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow"
        >
          Next: Generate AI Strategy
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

