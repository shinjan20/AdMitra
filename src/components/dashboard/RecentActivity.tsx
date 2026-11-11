import React from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { formatTimeAgo } from '../../utils/date';
import {
  Activity,
  CheckCircle2,
  Rocket,
  Pause,
  Play,
  Sparkles,
  Building2,
  Target,
} from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const events = StorageService.getFunnelEvents();

  const getEventBadge = (name: string) => {
    switch (name) {
      case 'campaign_launch_confirmed':
      case 'campaign_created':
        return {
          icon: <Rocket className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Campaign Launched (Demo)',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'campaign_paused':
        return {
          icon: <Pause className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Campaign Paused',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'campaign_resumed':
        return {
          icon: <Play className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Campaign Resumed',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'creative_approved':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Creative Approved',
          color: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'business_profile_created':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Business Profile Set',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
          label: name.replace(/_/g, ' '),
          color: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          Funnel Events & Activity Log
        </h4>
        <span className="text-[11px] text-slate-400">PRD Section 7 Funnel KPIs</span>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center">
          No recent events recorded yet. Create or launch a campaign to start logging funnel events.
        </p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {events.slice(0, 8).map((evt) => {
            const badge = getEventBadge(evt.eventName);
            return (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded-lg bg-white shadow-2xs">{badge.icon}</div>
                  <span className="font-semibold text-slate-800 capitalize truncate">
                    {badge.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                  {formatTimeAgo(evt.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

