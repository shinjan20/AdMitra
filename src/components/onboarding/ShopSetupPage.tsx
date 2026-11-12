import React, { useState } from 'react';
import { Building2, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_LANGUAGES, BUSINESS_CATEGORIES } from '../../services/language';

export const ShopSetupPage: React.FC = () => {
  const { user, activeBusiness, language, setLanguage, t, tr, completeShopSetup, deferShopSetup } = useApp();
  const hasSavedBusiness = activeBusiness.userId === user?.id;

  // Check for demo scenario data
  const demoScenarioData = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('admitra:demo-scenario');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse demo scenario:', e);
    }
    return null;
  }, []);

  const [businessName, setBusinessName] = useState(
    hasSavedBusiness ? activeBusiness.businessName : demoScenarioData?.businessName || ''
  );
  const [category, setCategory] = useState<string>(
    hasSavedBusiness && activeBusiness.category
      ? activeBusiness.category
      : demoScenarioData?.category || BUSINESS_CATEGORIES[0].key
  );
  const [city, setCity] = useState(
    hasSavedBusiness ? activeBusiness.location.city : demoScenarioData?.city || ''
  );
  const [area, setArea] = useState(
    hasSavedBusiness ? activeBusiness.location.area : demoScenarioData?.area || ''
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    hasSavedBusiness ? activeBusiness.whatsappNumber || '' : ''
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    completeShopSetup({ language, businessName, category, city, area, whatsappNumber });
    // Clear demo scenario data after use
    localStorage.removeItem('admitra:demo-scenario');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-4 py-8">
      <section className="w-full max-w-xl">
        <div className="mb-7 flex items-center gap-2.5 text-sm font-bold text-[color:var(--ink)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--ink)] text-[color:var(--marigold)]">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg">Ad<span className="brand-accent">Mitra</span></span>
        </div>

        <form onSubmit={handleSubmit} className="surface-raised space-y-5 rounded-2xl p-5 sm:p-8">
          <header>
            <div className="chip">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              {tr('Step 1 of 2 · Your shop')}
            </div>
            <h1 className="display mt-3 text-3xl font-bold sm:text-4xl">
              {tr('Tell us about your shop')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
              {tr('A few quick answers so your ad sounds right. You can change them later.')}
            </p>
          </header>

          <div>
            <label htmlFor="shop-language" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('chooseLanguage')}
            </label>
            <select
              id="shop-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
              className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              {APP_LANGUAGES.map((option) => (
                <option key={option.code} value={option.code}>{option.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="setup-business-name" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('businessName')}
            </label>
            <input
              id="setup-business-name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              maxLength={100}
              autoComplete="organization"
              required
              className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label htmlFor="setup-business-type" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('businessType')}
            </label>
            <select
              id="setup-business-type"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {BUSINESS_CATEGORIES.map(({ key, value }) => (
                <option key={key} value={key}>{t(key)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="setup-city" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('city')}
            </label>
            <input
              id="setup-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              maxLength={100}
              autoComplete="address-level2"
              required
              className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>

          <details className="border-t border-slate-200 pt-3">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
              {t('optionalDetails')}
            </summary>
            <div className="mt-4 space-y-5">
              <div>
                <label htmlFor="setup-area" className="mb-1.5 block text-sm font-medium text-slate-800">
                  {t('area')}
                </label>
                <input
                  id="setup-area"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  maxLength={100}
                  autoComplete="address-level3"
                  className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <div>
                <label htmlFor="setup-whatsapp" className="mb-1.5 block text-sm font-medium text-slate-800">
                  {t('whatsapp')}
                </label>
                <input
                  id="setup-whatsapp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  maxLength={20}
                  autoComplete="tel"
                  className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
            </div>
          </details>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={deferShopSetup}
              className="min-h-11 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              {t('skip')}
            </button>
            <button
              type="submit"
              className="brand-button min-h-11 rounded-lg px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            >
              {tr('Next: make my ad')}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};
