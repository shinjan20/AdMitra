import React, { useState } from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  ArrowLeft,
  Building2,
  Compass,
  LayoutDashboard,
  Link2,
  LogIn,
  LogOut,
  PlusCircle,
  Settings,
  Target,
} from 'lucide-react';


export const Navbar: React.FC = () => {
  const {
    activeBusiness,
    navigateTo,
    user,
    setShowAuthModal,
    logout,
    t,
    tr,
    activePage,
  } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems: Array<{ id: NavigationPage; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: tr('Home'), icon: <LayoutDashboard className="h-5 w-5" aria-hidden="true" /> },
    { id: 'creative-studio', label: tr('Make an ad'), icon: <PlusCircle className="h-5 w-5" aria-hidden="true" /> },
    { id: 'marketing-plan', label: tr('Plan'), icon: <Target className="h-5 w-5" aria-hidden="true" /> },
  ];

  const isNavActive = (id: NavigationPage) =>
    activePage === id || (id === 'dashboard' && activePage === 'campaign-details');

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--paper)]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigateTo(user ? 'dashboard' : 'landing')}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg text-sm font-bold text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
            aria-label={user ? tr('AdMitra home') : tr('AdMitra landing page')}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--ink)] text-[color:var(--marigold)]">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-base tracking-tight sm:text-lg">
              Ad<span className="brand-accent">Mitra</span>
            </span>
          </button>

          {user ? (
            <button
              type="button"
              data-tour="business"
              onClick={() => navigateTo('business-profile')}
              className="flex min-h-11 min-w-0 items-center gap-1.5 rounded-lg border border-transparent px-2 text-left text-sm text-[color:var(--ink-soft)] hover:border-[color:var(--line)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
            >
              <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="max-w-[7rem] truncate font-medium sm:max-w-[14rem]">{activeBusiness.businessName}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigateTo('landing')}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[color:var(--ink-soft)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('back')}
            </button>
          )}

          {user && (
            <nav aria-label={tr('Primary navigation')} className="ml-2 hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  aria-current={isNavActive(item.id) ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand)] ${
                    isNavActive(item.id)
                      ? 'bg-[color:var(--marigold-soft)] text-[color:var(--marigold-ink)]'
                      : 'text-[color:var(--ink-soft)] hover:bg-white hover:text-[color:var(--ink)]'
                  }`}
                >
                  <span className="[&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-1.5 text-sm font-medium text-[color:var(--ink)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
                  aria-expanded={isUserMenuOpen}
                  aria-label={`${tr('Account menu for {name}', { name: user.name })}`}
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[color:var(--ink)] text-xs font-bold text-[color:var(--paper)]">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : user.name[0]}
                  </span>
                  <span className="hidden max-w-28 truncate sm:inline ml-1">{user.name}</span>
                </button>
                {isUserMenuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label={tr('Close account menu')}
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[color:var(--line)] bg-white p-2 shadow-xl shadow-black/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigateTo('business-profile');
                        }}
                        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-[color:var(--ink)] hover:bg-[color:var(--paper)]"
                      >
                        <Building2 className="h-4 w-4 text-[color:var(--ink-soft)]" aria-hidden="true" />
                        {tr('Your shop')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigateTo('connected-accounts');
                        }}
                        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-[color:var(--ink)] hover:bg-[color:var(--paper)]"
                      >
                        <Link2 className="h-4 w-4 text-[color:var(--ink-soft)]" aria-hidden="true" />
                        {tr('Ad accounts')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigateTo('settings');
                        }}
                        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-[color:var(--ink)] hover:bg-[color:var(--paper)]"
                      >
                        <Settings className="h-4 w-4 text-[color:var(--ink-soft)]" aria-hidden="true" />
                        {tr('Settings')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-rose-700 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {tr('Sign out')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[color:var(--ink)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                {t('signIn')}
              </button>
            )}
          </div>
        </div>
      </header>

      {user && (
        <nav
          aria-label={tr('Primary navigation')}
          className="tab-bar fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-[color:var(--line)] bg-white/95 px-2 pt-1.5 backdrop-blur md:hidden"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              aria-current={isNavActive(item.id) ? 'page' : undefined}
              className="tab-item"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
};
