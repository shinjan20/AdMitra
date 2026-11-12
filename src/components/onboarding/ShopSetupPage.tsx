import React, { useState } from 'react';
import { Building2, Compass, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_CATEGORIES } from '../../services/language';
import { validateShopSetup, getFieldError } from '../../utils/validation';
import { LoadingOverlay } from '../common/LoadingOverlay';

export const ShopSetupPage: React.FC = () => {
  const { user, activeBusiness, t, tr, completeShopSetup, deferShopSetup, showToast } = useApp();
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
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form
    const validation = validateShopSetup({ businessName, category, city });
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setValidationErrors([]);

    try {
      completeShopSetup({ language: 'en', businessName, category, city, area, whatsappNumber });
      showToast({
        type: 'success',
        title: tr('Shop details saved'),
        message: tr('Your shop details have been saved.'),
      });
      // Clear demo scenario data after use
      localStorage.removeItem('admitra:demo-scenario');
    } catch (error) {
      setValidationErrors([
        {
          field: 'submit',
          message: 'Failed to save shop details. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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

        <form onSubmit={handleSubmit} noValidate className="surface-raised space-y-5 rounded-2xl p-5 sm:p-8">
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

          {/* Error Messages */}
          {validationErrors.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 text-sm">Please fix the following errors:</h3>
                  <ul className="mt-2 space-y-1 text-sm text-red-800">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>• {error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="shop-language" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('chooseLanguage')}
            </label>
            <select
              id="shop-language"
              value="en"
              disabled
              className="min-h-12 w-full rounded-lg border border-slate-300 bg-gray-100 px-3 text-base text-slate-900 cursor-not-allowed"
            >
              <option value="en">English</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">Ads are created in English</p>
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
              disabled={isLoading}
              className="min-h-11 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              {t('skip')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="brand-button min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                tr('Next: make my ad')
              )}
            </button>
          </div>
        </form>

        <LoadingOverlay
          isVisible={isLoading}
          message="Saving your shop details..."
          progressText="This should only take a moment"
        />
      </section>
    </main>
  );
};
