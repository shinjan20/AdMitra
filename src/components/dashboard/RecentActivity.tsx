import React from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { formatTimeAgo } from '../../utils/date';
import {
  Rocket,
  Pause,
  Play,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const events = StorageService.getFunnelEvents();

  const getEventBadge = (name: string) => {
    switch (name) {
      case 'campaign_launch_confirmed':
      case 'campaign_created':
        return {
          icon: <Rocket className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Campaign Launched',
        };
      case 'campaign_paused':
        return {
          icon: <Pause className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Campaign Paused',
        };
      case 'campaign_resumed':
        return {
          icon: <Play className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Campaign Resumed',
        };
      case 'creative_approved':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-700" />,
          label: 'Creative Approved',
        };
      case 'business_profile_created':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-slate-700" />,
          label: 'Profile Configured',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />,
          label: name.replace(/_/g, ' '),
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="text-xs font-semibold text-slate-900">
          Activity Log
        </h4>
        <span className="text-[10px] text-slate-400">Real-time</span>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-slate-400 py-2 text-center">
          No activity recorded yet.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {events.slice(0, 7).map((evt) => {
            const badge = getEventBadge(evt.eventName);
            return (
              <div
                key={evt.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-shrink-0">{badge.icon}</div>
                  <span className="text-slate-700 truncate font-medium">
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
