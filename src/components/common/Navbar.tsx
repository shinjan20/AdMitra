import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  PlusCircle,
  Building2,
  ChevronDown,
  Sparkles,
  Store,
  User,
  ExternalLink,
  Plus,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                Campaign<span className="text-blue-600">Pilot</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-700 bg-blue-50 border border-blue-200/60 rounded">
                SMB ADTECH
              </span>
            </div>
            <p className="text-[10px] text-slate-500 -mt-1 hidden sm:block">
              AI-Powered Advertising for Indian SMBs
            </p>
          </div>
        </div>

        {/* Business Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate font-semibold text-slate-900">
              {activeBusiness.businessName}
            </span>
            <span className="text-slate-400 text-[10px]">({activeBusiness.location.city})</span>
            <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Business Profile
                </div>
                <div className="space-y-1">
                  {businesses.map((biz) => {
                    const isSelected = biz.id === activeBusiness.id;
                    return (
                      <button
                        key={biz.id}
                        onClick={() => {
                          setActiveBusiness(biz);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-medium truncate">{biz.businessName}</p>
                          <p className="text-[10px] text-slate-500">
                            {biz.category} • {biz.location.city}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowOnboardingModal(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add or Switch Business Profile
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions, Demo Badge & Profile */}
      <div className="flex items-center gap-3">
        <DemoNoticeBadge compact />

        <button
          onClick={() => navigateTo('create-campaign')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">
            {activeDraft ? 'Resume Draft' : 'Create Campaign'}
          </span>
          <span className="sm:hidden">New Ad</span>
        </button>

        {/* User preview */}
        <div
          onClick={() => navigateTo('business-profile')}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
          title="Manage Business Profile & Account"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-semibold text-xs flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-400 transition-all">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400">Business Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
};

