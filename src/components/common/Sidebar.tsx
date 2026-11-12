import React from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  LayoutDashboard,
  Sparkles,
  MessageSquareText,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activePage, navigateTo, activeDraft } = useApp();

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'create-campaign',
      label: activeDraft ? 'Continue your ad' : 'Create an ad',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'creative-studio',
      label: 'Ad text ideas',
      icon: <MessageSquareText className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden min-h-[calc(100vh-3.5rem)] w-52 select-none flex-col border-r border-slate-200/60 bg-[#F9FAFB] p-3 md:flex">
      <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`min-h-11 w-full flex items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border border-slate-200/60 bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex items-center gap-3">
                  <span className={isActive ? 'text-slate-900' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>
    </aside>
  );
};
