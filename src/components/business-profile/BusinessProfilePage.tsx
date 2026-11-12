import React, { useState } from 'react';
import { ArrowLeft, Building2, IndianRupee, Info, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_CATEGORIES } from '../../services/language';

const numberOrUndefined = (value: string): number | undefined => {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const BusinessProfilePage: React.FC = () => {
  const { activeBusiness, updateBusiness, navigateTo, t, tr } = useApp();
  const [formData, setFormData] = useState({
    businessName: activeBusiness.businessName,
    category: activeBusiness.category,
    description: activeBusiness.description,
    city: activeBusiness.location.city,
    area: activeBusiness.location.area || '',
    whatsappNumber: activeBusiness.whatsappNumber || '',
    phone: activeBusiness.phone || '',
    websiteUrl: activeBusiness.digitalPresence?.website || activeBusiness.websiteUrl || '',
    instagramHandle: activeBusiness.instagramHandle || '',
    operatingHours: activeBusiness.operatingHours || '',
    serviceAreaKm: activeBusiness.serviceAreaKm?.toString() || '',
    primaryContactMethod: activeBusiness.primaryContactMethod || 'whatsapp',
    tone: activeBusiness.tone || '',
    prohibitedClaims: activeBusiness.prohibitedClaims || '',
    languages: (activeBusiness.preferredLanguages || []).join(', '),
    averageOrderValue: activeBusiness.economics?.averageOrderValue?.toString() || '',
    grossMarginPct: activeBusiness.economics?.grossMarginPct?.toString() || '',
    acceptableCostPerLead: activeBusiness.economics?.acceptableCostPerLead?.toString() || '',
    capacityLeadsPerMonth: activeBusiness.economics?.capacityLeadsPerMonth?.toString() || '',
    targetLeadsPerMonth: activeBusiness.economics?.targetLeadsPerMonth?.toString() || '',
    monthlyBudget: activeBusiness.investment?.monthlyBudget?.toString() || '',
    comfortableStart: activeBusiness.investment?.comfortableStart?.toString() || '',
    maximumSpend: activeBusiness.investment?.maximumSpend?.toString() || '',
    cadence: activeBusiness.investment?.cadence || 'monthly',
    confidence: activeBusiness.investment?.confidence || 'medium',
    willingToTest: activeBusiness.investment?.willingToTest ?? true,
    googleBusinessProfile: activeBusiness.digitalPresence?.googleBusinessProfile ?? false,
    facebookPage: activeBusiness.digitalPresence?.facebookPage ?? false,
    instagram: activeBusiness.digitalPresence?.instagram ?? false,
    hasAdAccounts: activeBusiness.digitalPresence?.hasAdAccounts ?? false,
  });

  const update = (field: keyof typeof formData, value: string | boolean) =>
    setFormData((previous) => ({ ...previous, [field]: value }));

  const [isSaving, setIsSaving] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.businessName.trim() || !formData.city.trim()) {
      setProfileError(tr('Shop or business name and city are required.'));
      return;
    }
    setProfileError('');
    setIsSaving(true);
    try {
      updateBusiness({
      ...activeBusiness,
      businessName: formData.businessName.trim(),
      category: formData.category,
      description: formData.description.trim(),
      location: {
        ...activeBusiness.location,
        city: formData.city.trim(),
        area: formData.area.trim(),
      },
      whatsappNumber: formData.whatsappNumber.trim(),
      phone: formData.phone.trim(),
      websiteUrl: formData.websiteUrl.trim() || undefined,
      instagramHandle: formData.instagramHandle.trim() || undefined,
      operatingHours: formData.operatingHours.trim() || undefined,
      serviceAreaKm: numberOrUndefined(formData.serviceAreaKm),
      primaryContactMethod: formData.primaryContactMethod as typeof activeBusiness.primaryContactMethod,
      tone: formData.tone.trim() || undefined,
      prohibitedClaims: formData.prohibitedClaims.trim() || undefined,
      preferredLanguages: formData.languages
        .split(',')
        .map((language) => language.trim())
        .filter(Boolean),
      economics: {
        averageOrderValue: numberOrUndefined(formData.averageOrderValue),
        grossMarginPct: numberOrUndefined(formData.grossMarginPct),
        acceptableCostPerLead: numberOrUndefined(formData.acceptableCostPerLead),
        capacityLeadsPerMonth: numberOrUndefined(formData.capacityLeadsPerMonth),
        targetLeadsPerMonth: numberOrUndefined(formData.targetLeadsPerMonth),
      },
      investment: {
        monthlyBudget: numberOrUndefined(formData.monthlyBudget),
        comfortableStart: numberOrUndefined(formData.comfortableStart),
        maximumSpend: numberOrUndefined(formData.maximumSpend),
        cadence: formData.cadence as 'daily' | 'monthly',
        confidence: formData.confidence as 'low' | 'medium' | 'high',
        willingToTest: formData.willingToTest,
      },
      digitalPresence: {
        website: formData.websiteUrl.trim() || undefined,
        googleBusinessProfile: formData.googleBusinessProfile,
        facebookPage: formData.facebookPage,
        instagram: formData.instagram,
        hasAdAccounts: formData.hasAdAccounts,
      },
    });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900';

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <button
        type="button"
        onClick={() => navigateTo('marketing-plan')}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('back')}
      </button>

      <header>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          {tr('Business profile')}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {tr('A few details about your shop')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {tr('These details help the suggestions fit your shop. If you do not know a number, leave it blank. We will not make one up.')}
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <section className="surface-panel space-y-5 rounded-xl p-5 sm:p-7">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{tr('Business basics')}</h2>
            <p className="mt-1 text-sm text-slate-500">{tr('Used to choose the offer, language and service area.')}</p>
          </div>

          <div>
            <label htmlFor="business-name" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('businessName')}
            </label>
            <input
              id="business-name"
              value={formData.businessName}
              onChange={(event) => update('businessName', event.target.value)}
              maxLength={100}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="business-type" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('businessType')}
            </label>
            <select
              id="business-type"
              value={formData.category}
              onChange={(event) => update('category', event.target.value)}
              required
              className={`${inputClass} bg-white`}
            >
              <option value="" disabled>{t('businessType')}</option>
              {!BUSINESS_CATEGORIES.some((item) => item.value === formData.category) && (
                <option value={formData.category}>{formData.category}</option>
              )}
              {BUSINESS_CATEGORIES.map(({ key, value }) => (
                <option key={value} value={value}>{t(key)}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="business-city" className="mb-1.5 block text-sm font-medium text-slate-800">
                {t('city')}
              </label>
              <input
                id="business-city"
                value={formData.city}
                onChange={(event) => update('city', event.target.value)}
                maxLength={100}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business-area" className="mb-1.5 block text-sm font-medium text-slate-800">
                {t('area')}
              </label>
              <input
                id="business-area"
                value={formData.area}
                onChange={(event) => update('area', event.target.value)}
                maxLength={100}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="business-description" className="mb-1.5 block text-sm font-medium text-slate-800">
              {tr('What do you offer?')}
            </label>
            <textarea
              id="business-description"
              value={formData.description}
              onChange={(event) => update('description', event.target.value)}
              rows={3}
              maxLength={500}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="business-hours" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Operating hours')}
              </label>
              <input
                id="business-hours"
                value={formData.operatingHours}
                onChange={(event) => update('operatingHours', event.target.value)}
                placeholder={tr('Mon–Sun, 10:00–20:00')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business-radius" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Service area (km)')}
              </label>
              <input
                id="business-radius"
                type="number"
                min="0"
                max="100"
                value={formData.serviceAreaKm}
                onChange={(event) => update('serviceAreaKm', event.target.value)}
                placeholder="12"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business-contact" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Primary contact')}
              </label>
              <select
                id="business-contact"
                value={formData.primaryContactMethod}
                onChange={(event) => update('primaryContactMethod', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="whatsapp">{tr('WhatsApp')}</option>
                <option value="phone">{tr('Phone')}</option>
                <option value="website">{tr('Website')}</option>
                <option value="form">{tr('Lead form')}</option>
                <option value="booking">{tr('Booking link')}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="surface-panel space-y-5 rounded-xl p-5 sm:p-7">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
              {tr('Contact and digital presence')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {tr('These destinations determine which channels are feasible. Leave a field blank if it does not exist.')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="business-phone" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Phone number')}
              </label>
              <input
                id="business-phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder="+91"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business-whatsapp" className="mb-1.5 block text-sm font-medium text-slate-800">
                {t('whatsapp')}
              </label>
              <input
                id="business-whatsapp"
                type="tel"
                value={formData.whatsappNumber}
                onChange={(event) => update('whatsappNumber', event.target.value)}
                placeholder="+91"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business-website" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Website or landing page')}
              </label>
              <input
                id="business-website"
                type="url"
                value={formData.websiteUrl}
                onChange={(event) => update('websiteUrl', event.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business-instagram" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Instagram handle')}
              </label>
              <input
                id="business-instagram"
                value={formData.instagramHandle}
                onChange={(event) => update('instagramHandle', event.target.value)}
                placeholder="@yourshop"
                className={inputClass}
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-800">{tr('Which of these already exist?')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { field: 'googleBusinessProfile' as const, label: 'Google Business Profile' },
                { field: 'facebookPage' as const, label: 'Facebook Page' },
                { field: 'instagram' as const, label: 'Instagram account' },
                { field: 'hasAdAccounts' as const, label: 'Google Ads or Meta ad account' },
              ].map((item) => (
                <label key={item.field} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData[item.field]}
                    onChange={(event) => update(item.field, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                  {tr(item.label)}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <details className="surface-panel space-y-5 rounded-xl p-5 sm:p-7" open={false}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">{tr('Money basics (optional)')}</summary>
          <div className="mt-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <IndianRupee className="h-4 w-4 text-slate-500" aria-hidden="true" />
              {tr('Money basics')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {tr('Used to judge whether an enquiry is affordable. Leave anything you do not know blank.')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { field: 'averageOrderValue' as const, label: 'Average transaction value (₹)', placeholder: '4500' },
              { field: 'grossMarginPct' as const, label: 'Gross margin (%)', placeholder: '60' },
              { field: 'acceptableCostPerLead' as const, label: 'Acceptable cost per enquiry (₹)', placeholder: '450' },
              { field: 'targetLeadsPerMonth' as const, label: 'Target enquiries per month', placeholder: '30' },
              { field: 'capacityLeadsPerMonth' as const, label: 'Enquiry capacity per month', placeholder: '60' },
            ].map((item) => (
              <div key={item.field}>
                <label htmlFor={item.field} className="mb-1.5 block text-sm font-medium text-slate-800">
                  {tr(item.label)}
                </label>
                <input
                  id={item.field}
                  type="number"
                  min="0"
                  value={formData[item.field]}
                  onChange={(event) => update(item.field, event.target.value)}
                  placeholder={item.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {tr('Budget recommendations are estimates, not guaranteed results. Capacity matters: a plan should not create more enquiries than the business can answer.')}
          </div>
        </details>

        <details className="surface-panel space-y-5 rounded-xl p-5 sm:p-7">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">{tr('Investment discovery (optional)')}</summary>
          <div className="mt-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" aria-hidden="true" />
              {tr('Investment discovery')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {tr("Share a comfortable range. This is only a practice estimate, not a commitment.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { field: 'monthlyBudget' as const, label: 'Proposed monthly media budget (₹)', placeholder: '18000' },
              { field: 'comfortableStart' as const, label: 'Comfortable starting amount (₹)', placeholder: '6000' },
              { field: 'maximumSpend' as const, label: 'Maximum acceptable spend (₹)', placeholder: '25000' },
            ].map((item) => (
              <div key={item.field}>
                <label htmlFor={item.field} className="mb-1.5 block text-sm font-medium text-slate-800">
                  {tr(item.label)}
                </label>
                <input
                  id={item.field}
                  type="number"
                  min="0"
                  step="500"
                  value={formData[item.field]}
                  onChange={(event) => update(item.field, event.target.value)}
                  placeholder={item.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
            <div>
              <label htmlFor="cadence" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Budget cadence')}
              </label>
              <select
                id="cadence"
                value={formData.cadence}
                onChange={(event) => update('cadence', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="monthly">{tr('Monthly')}</option>
                <option value="daily">{tr('Daily')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="investment-confidence" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('How sure are you about this range?')}
              </label>
              <select
                id="investment-confidence"
                value={formData.confidence}
                onChange={(event) => update('confidence', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="low">{tr('Low — rough guess')}</option>
                <option value="medium">{tr('Medium — likely')}</option>
                <option value="high">{tr('High — I checked')}</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formData.willingToTest}
              onChange={(event) => update('willingToTest', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900"
            />
            <span>
              {tr('I am willing to run a small, focused test before committing a larger budget.')}
              <span className="mt-0.5 block text-xs text-slate-500">
                {tr('A test-first plan spends the same budget but concentrates it on one channel.')}
              </span>
            </span>
          </label>
        </details>

        <section className="surface-panel space-y-5 rounded-xl p-5 sm:p-7">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{tr('Brand preferences and guardrails')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tr('Used when generating copy. Prohibited claims are passed to the creative workflow as a guardrail, not treated as a suggestion.')}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="business-languages" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Preferred languages')}
              </label>
              <input
                id="business-languages"
                value={formData.languages}
                onChange={(event) => update('languages', event.target.value)}
                placeholder={tr('Hindi, English')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business-tone" className="mb-1.5 block text-sm font-medium text-slate-800">
                {tr('Tone')}
              </label>
              <input
                id="business-tone"
                value={formData.tone}
                onChange={(event) => update('tone', event.target.value)}
                placeholder={tr('Warm, clear and premium')}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="business-claims" className="mb-1.5 block text-sm font-medium text-slate-800">
              {tr('Claims to avoid')}
            </label>
            <textarea
              id="business-claims"
              value={formData.prohibitedClaims}
              onChange={(event) => update('prohibitedClaims', event.target.value)}
              rows={2}
              placeholder={tr('For example: guaranteed results, medical claims, superlatives without evidence')}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </section>

        {profileError && (
          <p role="alert" className="text-sm text-rose-700">{profileError}</p>
        )}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {tr('Saved in this browser. No ad account is connected and no financial data is sent to a provider.')}
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="brand-button inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold disabled:opacity-70"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {tr('Saving...')}
              </span>
            ) : (
              tr('Save business context')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
