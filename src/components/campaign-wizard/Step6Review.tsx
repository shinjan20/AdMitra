import React, { useState } from 'react';
import { Campaign, CampaignObjective } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { formatDate, addDays } from '../../utils/date';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  Rocket,
  ArrowLeft,
  Building,
  Target,
  Image as ImageIcon,
  IndianRupee,
  Calendar,
  Sparkles,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  MapPin,
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
  const { activeBusiness, showToast } = useApp();
  const [isLaunching, setIsLaunching] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  // Validation Checks
  const checks = [
    {
      id: 'biz',
      label: 'Business Profile Verified',
      valid: Boolean(activeBusiness.businessName && activeBusiness.location.city),
      step: 1,
    },
    {
      id: 'objective',
      label: 'Campaign Objective Selected',
      valid: Boolean(draft.objective),
      step: 1,
    },
    {
      id: 'creative',
      label: 'Ad Creative Approved (Headline & Description present)',
      valid: Boolean(draft.creative?.headline && draft.creative?.imageUrl),
      step: 3,
    },
    {
      id: 'audience',
      label: 'Target Location & Radius Configured',
      valid: Boolean(draft.audience?.locationCity && (draft.audience?.radiusKm || 0) > 0),
      step: 4,
    },
    {
      id: 'budget',
      label: 'Valid Campaign Budget Allocated',
      valid: Boolean((draft.totalBudget || 0) >= 1000 && (draft.durationDays || 0) >= 3),
      step: 5,
    },
  ];

  const allPassed = checks.every((c) => c.valid);

  const handleLaunch = async () => {
    if (!allPassed || !confirmCheckbox) return;

    setIsLaunching(true);

    // Realistic launch simulation delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const campaignId = draft.id || `camp-${Date.now()}`;
    const startStr = draft.startDate || new Date().toISOString().split('T')[0];
    const duration = draft.durationDays || 10;
    const endStr = addDays(new Date(startStr), duration).toISOString().split('T')[0];

    const finalCampaign: Campaign = {
      id: campaignId,
      businessId: activeBusiness.id,
      campaignName: draft.campaignName || `${activeBusiness.businessName} Campaign`,
      objective: (draft.objective as CampaignObjective) || 'messages',
      strategy: draft.strategy || 'Local SMB growth campaign powered by CampaignPilot AI.',
      status: 'active',
      totalBudget: draft.totalBudget || 5000,
      dailyBudget: draft.dailyBudget || Math.round((draft.totalBudget || 5000) / duration),
      startDate: startStr,
      endDate: endStr,
      durationDays: duration,
      creative: draft.creative!,
      audience: draft.audience!,
      recommendation: draft.recommendation,
      isDemoLaunch: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onLaunchSuccess(finalCampaign);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
            Step 6 of 6
          </span>
          <span className="text-xs text-slate-500 font-medium">Pre-Flight Review & Launch</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
          Review & Launch Your Campaign
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Everything is configured. Review your campaign parameters below before activating.
        </p>
      </div>

      {/* Demo Notice Banner */}
      <DemoNoticeBadge />

      {/* Pre-flight Checklist */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Pre-Flight Validation Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
            >
              <span className="flex items-center gap-2 text-slate-700">
                {chk.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                )}
                {chk.label}
              </span>
              {!chk.valid && (
                <button
                  type="button"
                  onClick={() => onEditStep(chk.step)}
                  className="text-blue-600 hover:underline font-semibold text-[11px]"
                >
                  Fix
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ad Creative Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              Creative & Messaging
            </span>
            <button
              onClick={() => onEditStep(3)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Edit
            </button>
          </div>

          <div className="flex gap-3">
            <img
              src={draft.creative?.imageUrl}
              alt="Creative Thumbnail"
              className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {draft.creative?.headline}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {draft.creative?.description}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                CTA: {draft.creative?.cta}
              </div>
            </div>
          </div>
        </div>

        {/* Audience & Location Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              Target Audience
            </span>
            <button
              onClick={() => onEditStep(4)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Edit
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong>{draft.audience?.locationCity}</strong> (within {draft.audience?.radiusKm} km radius)
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Demographics: Age {draft.audience?.ageRangeMin} - {draft.audience?.ageRangeMax} •{' '}
              {draft.audience?.gender === 'all'
                ? 'All Genders'
                : draft.audience?.gender === 'women'
                ? 'Women Only'
                : 'Men Only'}
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              Estimated Reach:{' '}
              <strong className="text-slate-800">
                {draft.audience?.estimatedAudienceSize || '50,000 - 80,000'}
              </strong>
            </div>
          </div>
        </div>

        {/* Budget & Schedule Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
              Budget & Schedule Summary
            </span>
            <button
              onClick={() => onEditStep(5)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Budget</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {formatINR(draft.totalBudget || 5000)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Daily Spend</span>
              <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                {formatINR(Math.round((draft.totalBudget || 5000) / (draft.durationDays || 10)))} / day
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Duration</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {draft.durationDays || 10} Days
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Start Date</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {formatDate(draft.startDate || new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit User Confirmation Checkbox */}
      <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-200">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmCheckbox}
            onChange={(e) => setConfirmCheckbox(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900">
              I have reviewed and approved this campaign configuration.
            </strong>{' '}
            I understand this simulated launch creates an active test campaign in CampaignPilot,
            allowing me to monitor simulated customer impressions and conversions in the dashboard.
          </div>
        </label>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Budget
        </button>

        <button
          onClick={handleLaunch}
          disabled={!allPassed || !confirmCheckbox || isLaunching}
          className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Rocket className={`w-4 h-4 ${isLaunching ? 'animate-bounce' : ''}`} />
          {isLaunching ? 'Activating Campaign...' : 'Launch Demo Campaign'}
        </button>
      </div>
    </div>
  );
};

