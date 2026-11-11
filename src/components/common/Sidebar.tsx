import React from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  LayoutDashboard,
  Sparkles,
  Palette,
  Building2,
  Settings,
  Circle,
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
      icon: <Sparkles className="w-4 h-4" />,
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
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-56 bg-[#F9FAFB] border-r border-slate-200/60 min-h-[calc(100vh-3.5rem)] p-3 flex flex-col justify-between hidden md:flex select-none">
      <div className="space-y-4">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-slate-900' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quiet Status Footer */}
      <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-medium">Active Ads</span>
          <span className="flex items-center gap-1 font-semibold text-slate-900 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {activeCampaignsCount} Live
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal">
          Simulated local audience delivery.
        </p>
      </div>
    </aside>
  );
};
