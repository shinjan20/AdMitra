import React, { useState } from 'react';
import {
  Campaign,
  CampaignDestination,
  CampaignObjective,
  PreflightCheck,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { formatDate, addDays, toISODateOnly } from '../../utils/date';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

interface Step6ReviewProps {
  draft: Partial<Campaign>;
  onLaunchSuccess: (launchedCampaign: Campaign) => void;
  onBack: () => void;
  onEditStep: (stepNumber: number) => void;
}

export const Step6Review: React.FC<Step6ReviewProps> = ({
  draft,
  onLaunchSuccess,
  onBack,
  onEditStep,
}) => {
  const { activeBusiness, connectedAccounts, tr } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [approved, setApproved] = useState(false);
  const defaultDestination: CampaignDestination =
    draft.destinationType ||
    (draft.objective === 'messages' ? 'whatsapp' : draft.objective === 'leads' ? 'phone' : 'website');
  const [destinationType, setDestinationType] = useState<CampaignDestination>(defaultDestination);
  const [destinationValue, setDestinationValue] = useState(
    draft.destinationValue ||
      (defaultDestination === 'whatsapp'
        ? activeBusiness.whatsappNumber || ''
        : defaultDestination === 'phone'
          ? activeBusiness.phone || ''
          : defaultDestination === 'website'
            ? activeBusiness.digitalPresence?.website || activeBusiness.websiteUrl || ''
            : ''),
  );

  const destinationIsSet = destinationValue.trim().length > 0;
  const budgetIsValid =
    (draft.totalBudget || 0) >= 1000 && (draft.durationDays || 0) >= 3;
  const monthlyBudget =
    (draft.totalBudget || 0) / Math.max(1, draft.durationDays || 1) * 30;
  const hasTracking = connectedAccounts.some(
    (account) => account.provider === 'ga4' && account.status === 'demo_connected',
  );
  const hasAdAccount = connectedAccounts.some(
    (account) =>
      (account.provider === 'google_ads' || account.provider === 'meta') &&
      account.status === 'demo_connected',
  );

  const preflight: PreflightCheck[] = [
    {
      id: 'asset',
      label: tr('The ad'),
      status: draft.creative?.headline && draft.creative?.imageUrl ? 'pass' : 'fail',
      detail:
        draft.creative?.headline && draft.creative?.imageUrl
          ? tr('The ad text, image and button are ready.')
          : tr('Add a headline and an image in the ad step.'),
    },
    {
      id: 'destination',
      label: tr('Where people go'),
      status: destinationIsSet ? 'pass' : 'fail',
      detail: destinationIsSet
        ? tr('People will go to {type}.', { type: tr(destinationType.replace('_', ' ')) })
        : destinationType === 'whatsapp'
          ? tr('Add a WhatsApp number for people to message you.')
          : destinationType === 'phone'
            ? tr('Add a phone number for people to call you.')
            : tr('Add a website link for people to visit.'),
    },
    {
      id: 'audience',
      label: tr('Area'),
      status: draft.audience?.locationCity ? 'pass' : 'fail',
      detail: draft.audience?.locationCity
        ? tr('{area} · {distance} km radius.', {
            area: draft.audience.locationArea || draft.audience.locationCity,
            distance: draft.audience.radiusKm,
          })
        : tr('Add at least a town or city before approval.'),
    },
    {
      id: 'budget',
      label: tr('Amount and dates'),
      status: budgetIsValid ? (monthlyBudget < 5000 ? 'warn' : 'pass') : 'fail',
      detail: budgetIsValid
        ? monthlyBudget < 5000
          ? tr('This amount may be too small to learn much. Try one channel or a little more time.')
          : tr('The amount and number of days look workable.')
        : tr('Choose at least ₹1,000 over 3 days.'),
    },
    {
      id: 'tracking',
      label: tr('Counting enquiries'),
      status: 'warn',
      detail: hasTracking
        ? tr('Website visit counting is not turned on. You can add it later.')
        : tr('Website visit counting is not turned on. You can add it later.'),
    },
    {
      id: 'account',
      label: tr('Ad account'),
      status: 'warn',
      detail: hasAdAccount
        ? tr('You have a practice connection. Nothing will be posted.')
        : tr('No ad account is connected. This plan is saved as practice only.'),
    },
  ];

  const allPassed = preflight.every((check) => check.status !== 'fail');

  const handleLaunch = async () => {
    if (!allPassed || !approved) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const campaignId = draft.id || `camp-${Date.now()}`;
    const startStr = draft.startDate || toISODateOnly(new Date());
    const duration = draft.durationDays || 10;
    const endStr = toISODateOnly(addDays(new Date(startStr), duration));

    const finalCampaign: Campaign = {
      id: campaignId,
      businessId: activeBusiness.id,
      campaignName: draft.campaignName || tr('{business} Campaign', { business: activeBusiness.businessName }),
      creativePrompt: draft.creativePrompt,
      objective: (draft.objective as CampaignObjective) || 'messages',
      strategy: draft.strategy || tr('Sample plan made with AdMitra suggestions.'),
      status: 'simulated',
      executionMode: 'simulated',
      totalBudget: draft.totalBudget || 5000,
      dailyBudget: draft.dailyBudget || Math.round((draft.totalBudget || 5000) / duration),
      startDate: startStr,
      endDate: endStr,
      durationDays: duration,
      creative: draft.creative!,
      audience: draft.audience!,
      recommendation: draft.recommendation,
      channel: draft.channel,
      destinationType,
      destinationValue: destinationValue.trim(),
      planId: draft.planId,
      ownerApprovedAt: new Date().toISOString(),
      preflight,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onLaunchSuccess(finalCampaign);
  };

  return (
    <section id="wizard-step-6" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          {tr('Review your ad')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {tr('Check your sample ad and budget before saving it.')}
        </p>
      </div>

      <DemoNoticeBadge />

      {/* Ad, area, and budget summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Creative Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              {tr('Your ad')}
            </span>
            <button
              onClick={() => onEditStep(3)}
              className="text-xs text-slate-600 hover:text-slate-900 hover:underline font-medium"
            >
              {tr('Edit')}
            </button>
          </div>

          <div className="flex gap-3">
            <img
              src={draft.creative?.imageUrl}
              alt=""
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 truncate">
                {draft.creative?.headline ? tr(draft.creative.headline) : ''}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                {draft.creative?.description ? tr(draft.creative.description) : ''}
              </p>
              <span className="inline-block mt-1.5 text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {tr('Button:')} {draft.creative?.cta ? tr(draft.creative.cta) : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Audience Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {tr('Area')}
            </span>
            <button
              onClick={() => onEditStep(4)}
              className="text-xs text-slate-600 hover:text-slate-900 hover:underline font-medium"
            >
              {tr('Edit')}
            </button>
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong>{draft.audience?.locationArea || draft.audience?.locationCity}</strong>
                {draft.audience?.locationArea && ` · ${draft.audience.locationCity}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {tr('Nearby area · {distance} km', { distance: draft.audience?.radiusKm ?? 0 })}
            </p>
          </div>
        </div>

        {/* Budget Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
              {tr('Sample budget')}
            </span>
            <button
              onClick={() => onEditStep(5)}
              className="text-xs text-slate-600 hover:text-slate-900 hover:underline font-medium"
            >
              {tr('Edit')}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500">{tr('Total amount')}</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {formatINR(draft.totalBudget || 5000)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500">{tr('Example per day')}</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {tr('{amount} / day', { amount: formatINR(Math.round((draft.totalBudget || 5000) / (draft.durationDays || 10))) })}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500">{tr('Number of days')}</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {tr('{days} days', { days: draft.durationDays || 10 })}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500">{tr('Start date')}</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {formatDate(draft.startDate || new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
        {/* Destination Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              {tr('Where people will go')}
            </span>
            <span className="text-xs text-slate-500">
              {draft.channel === 'google_search' ? tr('Google Search') : tr('Meta ads')}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
            <div>
              <label htmlFor="review-destination-type" className="mb-1.5 block text-xs font-medium text-slate-700">
                {tr('Where people go')}
              </label>
              <select
                id="review-destination-type"
                value={destinationType}
                onChange={(event) => {
                  const next = event.target.value as CampaignDestination;
                  setDestinationType(next);
                  setDestinationValue(
                    next === 'whatsapp'
                      ? activeBusiness.whatsappNumber || ''
                      : next === 'phone'
                        ? activeBusiness.phone || ''
                        : next === 'website'
                          ? activeBusiness.digitalPresence?.website || activeBusiness.websiteUrl || ''
                          : '',
                  );
                }}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="whatsapp">{tr('WhatsApp')}</option>
                <option value="phone">{tr('Phone call')}</option>
                <option value="website">{tr('Website')}</option>
                <option value="lead_form">{tr('Lead form')}</option>
                <option value="booking_link">{tr('Booking link')}</option>
                <option value="directions">{tr('Directions')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="review-destination-value" className="mb-1.5 block text-xs font-medium text-slate-700">
                {tr('Phone number, link or instructions')}
              </label>
              <input
                id="review-destination-value"
                value={destinationValue}
                onChange={(event) => setDestinationValue(event.target.value)}
                placeholder={
                  destinationType === 'whatsapp'
                    ? '+91 98765 43210'
                    : destinationType === 'phone'
                      ? '+91 98765 43210'
                      : 'https://'
                }
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">
                {tr('Check this yourself before saving. The demo will not contact anyone.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{tr('Before you save')}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            allPassed ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {allPassed ? tr('Ready to save') : tr('Needs attention')}
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {preflight.map((check) => (
            <li key={check.id} className="flex items-start gap-2 text-sm">
              {check.status === 'pass' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              ) : check.status === 'warn' ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              )}
              <span>
                <span className="font-medium text-slate-900">{check.label}: </span>
                <span className="text-slate-600">{check.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900"
        />
        <span>
          <span className="font-semibold text-slate-900">{tr('I approve this practice plan.')}</span>{' '}
          {tr('I checked where people go, the area, the amount and the dates above. I understand nothing will be posted, charged or sent to Google or Meta.')}
        </span>
      </label>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        {tr('This is a practice plan. Saving it does not post an ad, contact Google or Meta, or spend money.')}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {tr('Back')}
        </button>

        <button
          onClick={handleLaunch}
          disabled={!allPassed || !approved || isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? tr('Saving…') : tr('Approve and save plan')}
        </button>
      </div>
    </section>
  );
};
