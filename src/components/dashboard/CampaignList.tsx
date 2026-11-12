import React, { useState } from 'react';
import { Campaign, CampaignObjective, CampaignStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import {
  MessageSquare,
  Users,
  Eye,
  Trash2,
  ExternalLink,
  Search,
} from 'lucide-react';

interface CampaignListProps {
  onSelectCampaign: (campaignId: string) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ onSelectCampaign }) => {
  const {
    campaigns,
    activeBusiness,
    deleteCampaign,
    navigateTo,
    tr,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');
  const [objectiveFilter, setObjectiveFilter] = useState<'all' | CampaignObjective>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const businessCampaigns = campaigns.filter((c) => c.businessId === activeBusiness.id);

  const filteredCampaigns = businessCampaigns.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (objectiveFilter !== 'all' && c.objective !== objectiveFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.campaignName.toLowerCase().includes(q) ||
        c.creative.headline.toLowerCase().includes(q) ||
        c.audience.locationCity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getObjectiveIcon = (obj: CampaignObjective) => {
    switch (obj) {
      case 'messages':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />;
      case 'leads':
        return <Users className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />;
      case 'awareness':
        return <Eye className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />;
    }
  };

  const getObjectiveLabel = (obj: CampaignObjective) => {
    switch (obj) {
      case 'messages':
        return tr('WhatsApp enquiries');
      case 'leads':
        return tr('Phone enquiries');
      case 'awareness':
        return tr('Shop visits');
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {tr('Live')}
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-600">
            {tr('Paused')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-500">
            {tr('Completed')}
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-600">
            {tr('Draft')}
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-blue-800">
            {tr('Pending approval')}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-rose-800">
            {tr('Failed')}
          </span>
        );
      case 'simulated':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#f0dcae] bg-[#fff7e6] px-2 py-0.5 text-[0.6875rem] font-semibold text-[color:var(--marigold-ink)]">
            {tr('Sample plan')}
          </span>
        );
    }
  };

  return (
    <div data-tour="campaigns" className="surface-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[color:var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight">{tr('Ad plans')}</h2>
          <p className="mt-0.5 text-xs text-[color:var(--ink-soft)]">
            {tr('Plans for {business}. Nothing goes live and nothing is charged.', { business: activeBusiness.businessName })}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--ink-soft)]" aria-hidden="true" />
            <input
              type="text"
              placeholder={tr('Find an ad')}
              aria-label={tr('Find an ad')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-10 w-full rounded-lg border border-[color:var(--line-strong)] bg-white py-1.5 pl-8 pr-3 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-soft)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] sm:w-44"
            />
          </div>

          <select
            aria-label={tr('Any status')}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="min-h-10 min-w-0 flex-1 rounded-lg border border-[color:var(--line-strong)] bg-white px-2.5 text-sm font-medium text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] sm:flex-none"
          >
            <option value="all">{tr('Any status')}</option>
            <option value="simulated">{tr('Sample plan')}</option>
            <option value="draft">{tr('Draft')}</option>
            <option value="pending_approval">{tr('Pending approval')}</option>
            <option value="failed">{tr('Failed')}</option>
          </select>

          <select
            aria-label={tr('Any customer action')}
            value={objectiveFilter}
            onChange={(e) => setObjectiveFilter(e.target.value as any)}
            className="min-h-10 min-w-0 flex-1 rounded-lg border border-[color:var(--line-strong)] bg-white px-2.5 text-sm font-medium text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] sm:flex-none"
          >
            <option value="all">{tr('Any customer action')}</option>
            <option value="messages">{tr('WhatsApp enquiries')}</option>
            <option value="leads">{tr('Phone enquiries')}</option>
            <option value="awareness">{tr('Shop visits')}</option>
          </select>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="space-y-3 px-4 py-12 text-center">
          <p className="mx-auto max-w-sm text-sm text-[color:var(--ink-soft)]">
            {searchQuery || statusFilter !== 'all' || objectiveFilter !== 'all'
              ? tr('No ads match those choices.')
              : tr('No ads yet. Start with one offer.')}
          </p>
          <button
            onClick={() => navigateTo('creative-studio')}
            className="btn-primary min-h-11 text-sm"
          >
            {tr('Make an ad')}
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-[color:var(--line)]">
          {filteredCampaigns.map((c) => {
            const spend = c.metrics?.totalSpend;
            const leads = c.metrics?.totalLeads || 0;
            const messages = c.metrics?.totalMessages || 0;
            const impressions = c.metrics?.totalImpressions;

            return (
              <li key={c.id}>
                <div
                  className="group flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-[color:var(--paper)]/60"
                  onClick={() => onSelectCampaign(c.id)}
                >
                  <img
                    src={c.creative?.imageUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl border border-[color:var(--line)] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCampaign(c.id);
                      }}
                      className="block w-full truncate text-left text-sm font-semibold group-hover:text-[color:var(--brand)]"
                    >
                      {tr(c.campaignName)}
                    </button>
                    <p className="mt-0.5 truncate text-xs text-[color:var(--ink-soft)]">
                      {c.channel === 'google_search' ? tr('Google Search') : c.channel === 'meta' ? tr('Meta ads') : tr('Channel not set')}
                      {' · '}
                      {c.audience?.locationCity}
                      {' · '}
                      {tr('nearby {radius} km', { radius: c.audience?.radiusKm ?? 0 })}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {getStatusBadge(c.status)}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--paper)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[color:var(--ink-soft)]">
                        {getObjectiveIcon(c.objective)}
                        {getObjectiveLabel(c.objective)}
                      </span>
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-[color:var(--ink-soft)]">
                      {!c.metrics
                        ? tr('No live results')
                        : c.objective === 'messages'
                          ? tr('{count} sample WhatsApp chats', { count: messages })
                          : c.objective === 'leads'
                            ? tr('{count} sample leads', { count: leads })
                            : tr('{count} sample views', { count: impressions?.toLocaleString('en-IN') ?? 0 })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums">
                      {spend === undefined ? formatINR(c.totalBudget) : formatINR(spend)}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] text-[color:var(--ink-soft)]">
                      {spend === undefined ? tr('Not run') : tr('{amount} proposed', { amount: formatINR(c.totalBudget) })}
                    </p>
                    <p className="mt-1 text-[0.6875rem] text-[color:var(--ink-soft)]">
                      {formatDate(c.startDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCampaign(c.id);
                      }}
                      className="rounded-lg p-2 text-[color:var(--ink-soft)] transition-colors hover:bg-white hover:text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
                      title={tr('View plan')}
                      aria-label={tr('View plan')}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(tr('Delete campaign "{name}"?', { name: c.campaignName }))) {
                          deleteCampaign(c.id);
                        }
                      }}
                      className="rounded-lg p-2 text-[color:var(--line-strong)] transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
                      title={tr('Delete campaign')}
                      aria-label={tr('Delete campaign')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
