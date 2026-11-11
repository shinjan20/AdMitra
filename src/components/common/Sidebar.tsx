import React from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  Palette,
  Building,
  Settings,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activePage, navigateTo, campaigns, activeDraft } = useApp();

  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'create-campaign',
      label: 'Create Campaign',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />,
      badge: activeDraft ? 'Draft' : undefined,
    },
    {
      id: 'creative-studio',
      label: 'Creative Studio',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'business-profile',
      label: 'Business Profile',
      icon: <Building className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings & Demo',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Campaign Summary Widget in Sidebar */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Active Campaigns
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {activeCampaignsCount} Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All ads are running on simulated local audiences with real-time feedback.
          </p>
        </div>
      </div>

      {/* Bottom Help & Info */}
      <div className="pt-4 border-t border-slate-100">
        <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-slate-700 space-y-1.5">
          <p className="text-xs font-semibold text-blue-950 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            Vibecoding MVP
          </p>
          <p className="text-[11px] text-blue-900/80 leading-relaxed">
            Designed specifically for Indian SMBs to launch ads in under 10 minutes.
          </p>
        </div>
      </div>
    </aside>
  );
};

