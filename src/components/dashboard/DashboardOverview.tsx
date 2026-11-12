import React from 'react';
import { ArrowRight, Info, Lightbulb, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { AIEngine } from '../../services/aiEngine';
import { formatDate } from '../../utils/date';

export const DashboardOverview: React.FC = () => {
  const { campaigns, activeBusiness, navigateTo, tr } = useApp();

  const businessCampaigns = campaigns.filter((c) => c.businessId === activeBusiness.id);
  const savedPlans = businessCampaigns.length;
  const campaignsWithMetrics = businessCampaigns.filter((campaign) => campaign.metrics);

  let totalSpend = 0;
  const totalAllocatedBudget = businessCampaigns.reduce(
    (sum, campaign) => sum + (campaign.totalBudget || 0),
    0,
  );
  let totalLeads = 0;
  let totalMessages = 0;
  let totalClicks = 0;
  let totalImpressions = 0;

  campaignsWithMetrics.forEach((campaign) => {
    const metrics = campaign.metrics!;
    totalSpend += metrics.totalSpend;
    totalLeads += metrics.totalLeads || 0;
    totalMessages += metrics.totalMessages || 0;
    totalClicks += metrics.totalClicks;
    totalImpressions += metrics.totalImpressions;
  });

  const totalInquiries = totalLeads + totalMessages;
  const costPerInquiry = totalInquiries > 0 ? totalSpend / totalInquiries : 0;
  const latestCampaign = [...businessCampaigns].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
  const recommendation = latestCampaign
    ? AIEngine.generatePerformanceRecommendations(latestCampaign, {
        acceptableCostPerLead: activeBusiness.economics?.acceptableCostPerLead,
      })[0]
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--brand)]" aria-hidden="true" />
          <h2 className="text-base font-bold tracking-tight">{tr('Example results')}</h2>
        </div>
        <span className="chip">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {tr('Practice numbers · 7-day example')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div className="space-y-1 rounded-2xl border border-[color:var(--line)] bg-white p-4">
          <span className="block text-xs font-semibold text-[color:var(--ink-soft)]">{tr('Example spend')}</span>
          <h3 className="pt-0.5 text-[1.75rem] font-bold tracking-tight tabular-nums text-[color:var(--ink)]">
            {formatINR(totalSpend)}
          </h3>
          <p className="text-xs text-slate-500">
            {totalAllocatedBudget > 0
              ? tr('of {amount} planned', { amount: formatINR(totalAllocatedBudget) })
              : tr('No ad plans yet')
            }
          </p>
        </div>

        <div className="space-y-1 rounded-2xl border border-[color:var(--line)] bg-white p-4">
          <span className="block text-xs font-semibold text-[color:var(--ink-soft)]">{tr('Example enquiries')}</span>
          <h3 className="pt-0.5 text-[1.75rem] font-bold tracking-tight tabular-nums text-[color:var(--ink)]">{totalInquiries}</h3>
          <p className="text-xs text-slate-500">
            {totalInquiries > 0
              ? tr('{messages} WhatsApp · {leads} call or form', { messages: totalMessages, leads: totalLeads })
              : tr('No sample ads yet')
            }
          </p>
        </div>

        <div className="space-y-1 rounded-2xl border border-[color:var(--line)] bg-white p-4">
          <span className="block text-xs font-semibold text-[color:var(--ink-soft)]">{tr('Example cost per enquiry')}</span>
          <h3 className={`pt-0.5 font-bold tracking-tight tabular-nums ${
            totalInquiries > 0 ? 'text-[1.75rem] text-[color:var(--ink)]' : 'text-base text-[color:var(--ink-soft)]'
          }`}>
            {totalInquiries > 0 ? formatINR(costPerInquiry) : tr('No data')}
          </h3>
          <p className="text-xs text-slate-500">
            {totalInquiries > 0 && activeBusiness.economics?.acceptableCostPerLead
              ? tr('Your target: {amount}', { amount: formatINR(activeBusiness.economics.acceptableCostPerLead) })
              : tr('No target set in your business details')
            }
          </p>
        </div>

        <div className="space-y-1 rounded-2xl border border-[#f0dcae] bg-[color:var(--marigold-soft)] p-4">
          <span className="block text-xs font-semibold text-[color:var(--marigold-ink)]">{tr('Saved ad plans')}</span>
          <h3 className="pt-0.5 text-[1.75rem] font-bold tracking-tight tabular-nums text-[color:var(--ink)]">{savedPlans}</h3>
          <p className="text-xs text-[color:var(--marigold-ink)]/80">
            {savedPlans > 0 ? tr('Sample or draft') : tr('Create your first ad')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-[color:var(--line)] bg-white p-4 sm:grid-cols-[1.3fr_0.7fr] sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900">
              {recommendation ? tr(recommendation.title) : tr('One next best action')}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {recommendation?.source === 'observed'
                ? tr('Based on example data')
                : recommendation?.source === 'diagnostic'
                  ? tr('Check-up')
                  : tr('General tip')}
            </span>
          </div>
          {recommendation ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{tr(recommendation.whatHappened)}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{tr(recommendation.suggestedAction)}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                <strong className="text-slate-700">{tr('How sure we are:')}</strong> {tr(recommendation.uncertainty)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {tr('Create an ad plan to see example results and tips.')}
            </p>
          )}
          {latestCampaign?.metrics?.dateRange && (
            <p className="mt-2 text-xs text-slate-500">
              {tr('Example dates: {start} to {end} · Where the numbers come from: {source}', {
                start: formatDate(latestCampaign.metrics.dateRange.start),
                end: formatDate(latestCampaign.metrics.dateRange.end),
                source: tr(latestCampaign.metrics.source || 'Not set'),
              })}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-xl bg-[color:var(--paper)] p-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold text-[color:var(--marigold-ink)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {tr('What to do next')}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {tr('Check the budget split before you spend more or change who sees the ad.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('marketing-plan')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            {tr('Review the spending plan')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        {tr('Example clicks: {clicks} · Example times shown: {impressions}. In a real account, numbers from Google or Meta, numbers from your own website and anything you type in would be shown separately.', {
          clicks: totalClicks.toLocaleString('en-IN'),
          impressions: totalImpressions.toLocaleString('en-IN'),
        })}
      </p>
    </div>
  );
};
