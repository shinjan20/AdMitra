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
  Target,
  Image as ImageIcon,
  IndianRupee,
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
  const { activeBusiness } = useApp();
  const [isLaunching, setIsLaunching] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  const checks = [
    {
      id: 'biz',
      label: 'Business Profile Verified',
      valid: Boolean(activeBusiness.businessName && activeBusiness.location.city),
      step: 1,
    },
    {
      id: 'objective',
      label: 'Campaign Objective Set',
      valid: Boolean(draft.objective),
      step: 1,
    },
    {
      id: 'creative',
      label: 'Ad Creative Approved',
      valid: Boolean(draft.creative?.headline && draft.creative?.imageUrl),
      step: 3,
    },
    {
      id: 'audience',
      label: 'Target Location & Radius Defined',
      valid: Boolean(draft.audience?.locationCity && (draft.audience?.radiusKm || 0) > 0),
      step: 4,
    },
    {
      id: 'budget',
      label: 'Campaign Budget Allocated',
      valid: Boolean((draft.totalBudget || 0) >= 1000 && (draft.durationDays || 0) >= 3),
      step: 5,
    },
  ];

  const allPassed = checks.every((c) => c.valid);

  const handleLaunch = async () => {
    if (!allPassed || !confirmCheckbox) return;

    setIsLaunching(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      confetti({
        particleCount: 70,
        spread: 60,
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
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          Review & Launch Your Campaign
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify your configuration below before activating your campaign.
        </p>
      </div>

      <DemoNoticeBadge />

      {/* Pre-flight Checklist */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2">
        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          Validation Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
            >
              <span className="flex items-center gap-2 text-slate-700">
                {chk.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                )}
                {chk.label}
              </span>
              {!chk.valid && (
                <button
                  type="button"
                  onClick={() => onEditStep(chk.step)}
                  className="text-blue-600 hover:underline font-medium text-[11px]"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Creative Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              Creative & Messaging
            </span>
            <button
              onClick={() => onEditStep(3)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Edit
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
                {draft.creative?.headline}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                {draft.creative?.description}
              </p>
              <span className="inline-block mt-1.5 text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                CTA: {draft.creative?.cta}
              </span>
            </div>
          </div>
        </div>

        {/* Audience Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-500" />
              Target Audience
            </span>
            <button
              onClick={() => onEditStep(4)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Edit
            </button>
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong>{draft.audience?.locationCity}</strong> · {draft.audience?.radiusKm} km radius
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ages {draft.audience?.ageRangeMin} - {draft.audience?.ageRangeMax} · {draft.audience?.gender}
            </p>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Estimated Reach: <strong>{draft.audience?.estimatedAudienceSize || '50k - 80k'}</strong>
            </p>
          </div>
        </div>

        {/* Budget Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
              Budget Summary
            </span>
            <button
              onClick={() => onEditStep(5)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase">Total Budget</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {formatINR(draft.totalBudget || 5000)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase">Daily Spend</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {formatINR(Math.round((draft.totalBudget || 5000) / (draft.durationDays || 10)))} / day
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase">Duration</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {draft.durationDays || 10} Days
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase">Start Date</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {formatDate(draft.startDate || new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmCheckbox}
            onChange={(e) => setConfirmCheckbox(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
          />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900">
              I have reviewed this campaign configuration.
            </strong>{' '}
            I understand this creates an active test campaign in CampaignPilot so I can monitor customer inquiries in the dashboard.
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <button
          onClick={handleLaunch}
          disabled={!allPassed || !confirmCheckbox || isLaunching}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket className="w-3.5 h-3.5" />
          {isLaunching ? 'Launching...' : 'Launch Demo Campaign'}
        </button>
      </div>
    </div>
  );
};
