import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Plus,
  Store,
  ChevronDown,
  Check,
} from 'lucide-react';
import { DemoNoticeBadge } from './DemoNoticeBadge';

export const Navbar: React.FC = () => {
  const {
    activeBusiness,
    businesses,
    setActiveBusiness,
    navigateTo,
    activeDraft,
    user,
    setShowOnboardingModal,
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
      {/* Left: Brand & Business Switcher */}
      <div className="flex items-center gap-5">
        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight text-sm">
            Campaign<span className="text-blue-600 font-bold">Pilot</span>
          </span>
        </div>

        {/* Quiet Business Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="max-w-[130px] sm:max-w-[170px] truncate font-medium text-slate-900">
              {activeBusiness.businessName}
            </span>
            <span className="text-slate-400 text-[11px] font-normal">
              · {activeBusiness.location.city}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Active Business
                </div>
                <div className="space-y-0.5">
                  {businesses.map((biz) => {
                    const isSelected = biz.id === activeBusiness.id;
                    return (
                      <button
                        key={biz.id}
                        onClick={() => {
                          setActiveBusiness(biz);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate font-medium">{biz.businessName}</p>
                          <p className="text-[10px] text-slate-400">
                            {biz.category} · {biz.location.city}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowOnboardingModal(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50/60 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Switch or Add Business Preset
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Demo Badge, Create Action & User */}
      <div className="flex items-center gap-3">
        <DemoNoticeBadge compact />

        <button
          onClick={() => navigateTo('create-campaign')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-slate-200" />
          <span>{activeDraft ? 'Resume Draft' : 'New Campaign'}</span>
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigateTo('business-profile')}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center transition-colors"
          title={`Signed in as ${user.name}`}
        >
          {user.name[0]}
        </button>
      </div>
    </header>
  );
};
