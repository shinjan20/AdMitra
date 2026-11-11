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
} from 'lucide-react';

interface CampaignDetailModalProps {
  campaignId: string | null;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaignId,
  onClose,
}) => {
  const { campaigns, updateCampaignStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'analytics' | 'creative' | 'audience'>('analytics');

  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!campaign) return null;

  const metrics = campaign.metrics;
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
      title={campaign.campaignName}
      subtitle={`${campaign.objective.toUpperCase()} · ${campaign.audience.locationCity} · ${formatDate(campaign.startDate)} to ${formatDate(campaign.endDate)}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${
                campaign.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {campaign.status === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
              {campaign.status}
            </span>
            <span className="text-xs text-slate-500">
              Spent: <strong>{formatINR(spend)}</strong> of {formatINR(campaign.totalBudget)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status === 'active' ? (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : campaign.status === 'paused' ? (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'active')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </button>
            ) : null}

            {campaign.status !== 'completed' && (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
            )}
          </div>
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
            Analytics & Coach
          </button>
          <button
            onClick={() => setActiveTab('creative')}
            className={`pb-2 transition-colors ${
              activeTab === 'creative'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Ad Creative
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`pb-2 transition-colors ${
              activeTab === 'audience'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Audience Targeting
          </button>
        </div>

        {/* TAB 1: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium uppercase">Total Spent</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{formatINR(spend)}</p>
                <span className="text-[10px] text-slate-400">
                  {formatINR(campaign.dailyBudget)}/day
                </span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-medium uppercase">
                  {campaign.objective === 'messages'
                    ? 'WhatsApp Chats'
                    : campaign.objective === 'leads'
                    ? 'Leads'
                    : 'Clicks'}
                </span>
                <p className="text-base font-bold text-emerald-950 mt-0.5">
                  {campaign.objective === 'messages'
                    ? messages
                    : campaign.objective === 'leads'
                    ? leads
                    : clicks}
                </p>
                <span className="text-[10px] text-emerald-700">Direct Inquiries</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium uppercase">Cost / Inquiry</span>
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
                <span className="text-[10px] text-slate-400">Average</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  Impressions
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {impressions.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-600 font-medium">{ctr}% click rate</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/80">
              <PerformanceChart
                data={metrics?.dailyData || []}
                objective={campaign.objective}
              />
            </div>

            <AIInsightsCard campaign={campaign} />
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
                <h3 className="text-xs font-semibold text-slate-900">{campaign.creative.headline}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {campaign.creative.description}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-400">Button:</span>
                <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg">
                  {campaign.creative.cta}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span>Destination:</span>
                <span className="font-medium text-slate-900">
                  {campaign.objective === 'messages' ? 'Direct WhatsApp Chat' : 'Lead Form'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span>Approval:</span>
                <span className="font-medium text-emerald-600 uppercase">
                  {campaign.creative.approvalStatus}
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
              Target Location & Audience
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Location</span>
                <span className="font-semibold text-slate-900">
                  {campaign.audience.locationCity}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Radius</span>
                <span className="font-semibold text-slate-900">
                  {campaign.audience.radiusKm} km radius
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Age Range</span>
                <span className="font-semibold text-slate-900">
                  {campaign.audience.ageRangeMin} - {campaign.audience.ageRangeMax} yrs
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
