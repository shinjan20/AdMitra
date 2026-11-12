import React, { useState } from 'react';
import { Campaign, CampaignStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PerformanceChart } from './PerformanceChart';
import { AIInsightsCard } from './AIInsightsCard';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import {
  Play,
  Pause,
  Square,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

interface CampaignDetailModalProps {
  campaignId: string | null;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaignId,
  onClose,
}) => {
  const { campaigns, updateCampaignStatus, tr } = useApp();
  const [activeTab, setActiveTab] = useState<'analytics' | 'creative' | 'audience' | 'setup'>('analytics');

  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!campaign) return null;

  const metrics = campaign.metrics;
  const isSimulated = campaign.executionMode === 'simulated';
  const spend = metrics?.totalSpend || 0;
  const leads = metrics?.totalLeads || 0;
  const messages = metrics?.totalMessages || 0;
  const clicks = metrics?.totalClicks || 0;
  const impressions = metrics?.totalImpressions || 0;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0';

  return (
    <Modal
      isOpen={Boolean(campaignId)}
      onClose={onClose}
      title={tr(campaign.campaignName)}
      subtitle={`${tr(campaign.objective)} · ${campaign.audience.locationCity} · ${tr('{start} to {end}', { start: formatDate(campaign.startDate), end: formatDate(campaign.endDate) })}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${
                !isSimulated && campaign.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {!isSimulated && campaign.status === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
              {isSimulated ? tr('Simulated plan') : tr(campaign.status)}
            </span>
            <span className="text-xs text-slate-500">
              {isSimulated
                ? metrics
                  ? <>{tr('Example spend:')} <strong>{formatINR(spend)}</strong> {tr('of {amount} proposed', { amount: formatINR(campaign.totalBudget) })}</>
                  : <>{tr('Proposed budget:')} <strong>{formatINR(campaign.totalBudget)}</strong> · {tr('Not run')}</>
                : <>{tr('Spent:')} <strong>{formatINR(spend)}</strong> {tr('of {amount}', { amount: formatINR(campaign.totalBudget) })}</>}
            </span>
          </div>

          {!isSimulated && <div className="flex items-center gap-2">
            {campaign.status === 'active' ? (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                {tr('Pause')}
              </button>
            ) : campaign.status === 'paused' ? (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'active')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {tr('Resume')}
              </button>
            ) : null}

            {campaign.status !== 'completed' && (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                {tr('Stop')}
              </button>
            )}
          </div>}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 space-x-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tr('Sample Summary')}
          </button>
          <button
            onClick={() => setActiveTab('creative')}
            className={`pb-2 transition-colors ${
              activeTab === 'creative'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tr('Ad Creative')}
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`pb-2 transition-colors ${
              activeTab === 'audience'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tr('Who should see this')}
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tr('Setup & approval')}
          </button>
        </div>

        {/* TAB 1: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {isSimulated && (
              <div className="space-y-2">
                <DemoNoticeBadge />
                <p className="text-sm leading-relaxed text-slate-600">
                  {metrics
                    ? tr('Example results only. This campaign was not delivered and no spend or enquiries occurred.')
                    : tr('This plan has no performance results because it was not run.')}
                </p>
              </div>
            )}
            {metrics && (
              <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-3">
                <div>
                  <span className="block font-medium text-slate-800">{tr('Metric source')}</span>
                  {metrics.source === 'simulated' || isSimulated
                    ? tr('Practice numbers')
                    : metrics.source === 'platform'
                      ? tr('Reported by Google or Meta')
                      : metrics.source === 'first_party'
                        ? tr('Counted on your own website')
                        : tr('Manually entered')}
                </div>
                <div>
                  <span className="block font-medium text-slate-800">{tr('How we counted')}</span>
                  {metrics.attributionWindow || tr('Not specified')}
                </div>
                <div>
                  <span className="block font-medium text-slate-800">{tr('Date range')}</span>
                  {metrics.dateRange
                    ? `${formatDate(metrics.dateRange.start)} – ${formatDate(metrics.dateRange.end)}`
                    : tr('Not specified')}
                </div>
              </div>
            )}
            {metrics?.note && (
              <p className="text-xs leading-relaxed text-slate-500">{tr(metrics.note)}</p>
            )}
            {isSimulated && !metrics ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-sm font-semibold text-slate-900">{tr('No live results')}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {tr('Publishing, spend, and performance tracking are not available in this demo.')}
                </p>
              </div>
            ) : (
              <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  {isSimulated ? tr('Example spend') : tr('Total spent')}
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{formatINR(spend)}</p>
                <span className="text-[10px] text-slate-400">
                  {tr('{amount}/day', { amount: formatINR(campaign.dailyBudget) })}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-medium uppercase">
                  {campaign.objective === 'messages'
                    ? tr('WhatsApp Chats')
                    : campaign.objective === 'leads'
                    ? tr('Leads')
                    : tr('Clicks')}
                </span>
                <p className="text-base font-bold text-emerald-950 mt-0.5">
                  {campaign.objective === 'messages'
                    ? messages
                    : campaign.objective === 'leads'
                    ? leads
                    : clicks}
                </p>
                <span className="text-[10px] text-emerald-700">
                  {isSimulated ? tr('Example enquiries') : tr('Direct inquiries')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  {isSimulated ? tr('Example cost / inquiry') : tr('Cost / inquiry')}
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {formatINR(
                    campaign.objective === 'messages' && messages > 0
                      ? spend / messages
                      : campaign.objective === 'leads' && leads > 0
                      ? spend / leads
                      : clicks > 0
                      ? spend / clicks
                      : 0
                  )}
                </p>
                <span className="text-[10px] text-slate-400">{tr('Average')}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  {isSimulated ? tr('Example views') : tr('Impressions')}
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {impressions.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-600 font-medium">{tr('{ctr}% click rate', { ctr })}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/80">
              <PerformanceChart
                data={metrics?.dailyData || []}
                objective={campaign.objective}
              />
            </div>

            <AIInsightsCard campaign={campaign} />
              </>
            )}
          </div>
        )}

        {/* TAB 2: Creative */}
        {activeTab === 'creative' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
              <img
                src={campaign.creative.imageUrl}
                alt=""
                className="w-full h-44 object-cover rounded-lg border border-slate-200"
              />
              <div>
                <h3 className="text-xs font-semibold text-slate-900">{tr(campaign.creative.headline)}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tr(campaign.creative.description)}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-400">{tr('Button:')}</span>
                <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg">
                  {tr(campaign.creative.cta)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span>{tr('Destination:')}</span>
                <span className="font-medium text-slate-900">
                  {campaign.objective === 'messages' ? tr('Direct WhatsApp Chat') : tr('Lead Form')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span>{tr('Approval:')}</span>
                <span className="font-medium text-emerald-600 uppercase">
                  {tr(campaign.creative.approvalStatus)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Audience */}
        {activeTab === 'audience' && (
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {tr('Target Location & Audience')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">{tr('Location')}</span>
                <span className="font-semibold text-slate-900">
                  {campaign.audience.locationCity}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">{tr('Radius')}</span>
                <span className="font-semibold text-slate-900">
                  {tr('{distance} km radius', { distance: campaign.audience.radiusKm })}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">{tr('Age Range')}</span>
                <span className="font-semibold text-slate-900">
                  {tr('{min} - {max} yrs', { min: campaign.audience.ageRangeMin, max: campaign.audience.ageRangeMax })}
                </span>
              </div>
            </div>
            {campaign.audience.rationale && (
              <p className="text-xs leading-relaxed text-slate-600">{tr(campaign.audience.rationale)}</p>
            )}
          </div>
        )}

        {/* TAB 4: Setup and approval */}
        {activeTab === 'setup' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tr('Channel')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {campaign.channel === 'google_search'
                    ? tr('Google Search')
                    : campaign.channel === 'meta'
                      ? tr('Meta ads (Facebook / Instagram)')
                      : tr('Not recorded')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tr('Destination')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {campaign.destinationType ? tr(campaign.destinationType) : tr('Not recorded')}
                </p>
                <p className="mt-1 break-all text-xs text-slate-600">
                  {campaign.destinationValue || tr('No destination value recorded')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tr('Owner approval')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {campaign.ownerApprovedAt
                    ? tr('Approved {date}', { date: formatDate(campaign.ownerApprovedAt) })
                    : tr('No owner approval recorded')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tr('Publishing')}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {tr('Demo only — not published')}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-slate-900">{tr('Before you save')}</h4>
              {campaign.preflight?.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {campaign.preflight.map((check) => (
                    <li key={check.id} className="flex items-start gap-2">
                      {check.status === 'pass' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      ) : check.status === 'warn' ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                      )}
                      <span>
                        <span className="font-medium text-slate-900">{tr(check.label)}: </span>
                        <span className="text-slate-600">{tr(check.detail)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">{tr('No checks are attached to this plan.')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
