import React from 'react';
import { useApp } from '../../context/AppContext';
import { CampaignObjective } from '../../types';
import {
  MessageSquare,
  Users,
  Eye,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const JTBDLauncher: React.FC = () => {
  const { activeBusiness, updateActiveDraft, navigateTo, logFunnel } = useApp();

  const handleLaunchGoal = (objective: CampaignObjective) => {
    updateActiveDraft({
      businessId: activeBusiness.id,
      objective,
      totalBudget: 5000,
      dailyBudget: 500,
      durationDays: 10,
      startDate: new Date().toISOString().split('T')[0],
      status: 'draft',
    });
    logFunnel('campaign_goal_selected', undefined, { objective, source: 'jtbd_launcher' });
    navigateTo('create-campaign');
  };

  const goals: {
    id: CampaignObjective;
    title: string;
    actionLabel: string;
    description: string;
    icon: React.ReactNode;
    suitableFor: string;
  }[] = [
    {
      id: 'messages',
      title: 'Get WhatsApp Enquiries',
      actionLabel: 'Start WhatsApp Ad',
      description: 'People tap your ad to chat directly on WhatsApp for price quotes and appointments.',
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      suitableFor: 'Highest conversion for salons, bakers, clinics & boutiques',
    },
    {
      id: 'leads',
      title: 'Get Direct Calls & Leads',
      actionLabel: 'Start Lead Campaign',
      description: 'Collect phone numbers of parents, students, or prospects for immediate callbacks.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      suitableFor: 'Ideal for coaching centres, gyms & consultations',
    },
    {
      id: 'awareness',
      title: 'Attract Nearby Footfall',
      actionLabel: 'Promote Store',
      description: 'Show your business to residents living within 5–10 km to build local recall.',
      icon: <Eye className="w-5 h-5 text-indigo-600" />,
      suitableFor: 'Best for restaurant launches & retail shops',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Header with clear JTBD focus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            What do you want to achieve for {activeBusiness.businessName}?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your goal below. AI generates your ad copy, image, and local audience in under 5 minutes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60 w-fit">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Launch in ~3 minutes</span>
        </div>
      </div>

      {/* 3 Intent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {goals.map((g) => (
          <div
            key={g.id}
            onClick={() => handleLaunchGoal(g.id)}
            className="group relative p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-900/40 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {g.icon}
              </div>

              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {g.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {g.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100/80">
              <span className="text-[10px] text-slate-400 block mb-2 line-clamp-1">
                {g.suitableFor}
              </span>
              <div className="flex items-center justify-between text-xs font-medium text-slate-900">
                <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-blue-600">
                  {g.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
