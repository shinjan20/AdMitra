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
  MessageSquare,
  Users,
  Eye,
  IndianRupee,
  Play,
  Pause,
  Square,
  Sparkles,
  MapPin,
  Calendar,
  Share2,
} from 'lucide-react';

interface CampaignDetailModalProps {
  campaignId: string | null;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaignId,
  onClose,
}) => {
  const { campaigns, updateCampaignStatus, showToast } = useApp();
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
      subtitle={`${campaign.objective.toUpperCase()} Campaign • ${campaign.audience.locationCity} • ${formatDate(campaign.startDate)} to ${formatDate(campaign.endDate)}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Control Bar: Status, Action Buttons, Demo Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                campaign.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : campaign.status === 'paused'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {campaign.status === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              )}
              {campaign.status}
            </span>
            <span className="text-xs text-slate-500">
              Budget: <strong>{formatINR(spend)}</strong> of {formatINR(campaign.totalBudget)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status === 'active' ? (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause Delivery
              </button>
            ) : campaign.status === 'paused' ? (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'active')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Resume Delivery
              </button>
            ) : null}

            {campaign.status !== 'completed' && (
              <button
                onClick={() => updateCampaignStatus(campaign.id, 'completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                End Campaign
              </button>
            )}
          </div>
        </div>

        {/* Prototype notice */}
        <DemoNoticeBadge />

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Performance Analytics & AI Coach
          </button>
          <button
            onClick={() => setActiveTab('creative')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'creative'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ad Creative & Messaging
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'audience'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Audience & Location
          </button>
        </div>

        {/* TAB 1: Analytics & Coach */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Spend</span>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{formatINR(spend)}</p>
                <span className="text-[10px] text-slate-400">
                  {formatINR(campaign.dailyBudget)}/day avg
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-semibold uppercase">
                  {campaign.objective === 'messages'
                    ? 'WhatsApp Chats'
                    : campaign.objective === 'leads'
                    ? 'Leads Collected'
                    : 'Clicks'}
                </span>
                <p className="text-lg font-extrabold text-emerald-950 mt-0.5">
                  {campaign.objective === 'messages'
                    ? messages
                    : campaign.objective === 'leads'
                    ? leads
                    : clicks}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">Direct Inquiries</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Cost / Inquiry</span>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
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
                <span className="text-[10px] text-slate-400">Per Conversion</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Impressions & CTR
                </span>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {impressions.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-blue-600 font-bold">{ctr}% click rate</span>
              </div>
            </div>

            {/* Recharts Spend vs Outcomes Chart */}
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <PerformanceChart
                data={metrics?.dailyData || []}
                objective={campaign.objective}
              />
            </div>

            {/* AI Insights Card */}
            <AIInsightsCard campaign={campaign} />
          </div>
        )}

        {/* TAB 2: Creative */}
        {activeTab === 'creative' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Ad Creative
              </h4>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <img
                  src={campaign.creative.imageUrl}
                  alt="Ad preview"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{campaign.creative.headline}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {campaign.creative.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500">CTA:</span>
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">
                    {campaign.creative.cta}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Creative Details
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Type:</span>
                  <span className="font-semibold text-slate-800">
                    {campaign.creative.isAIGenerated ? 'AI Generated (Reviewed & Approved)' : 'Custom'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Target Destination:</span>
                  <span className="font-semibold text-slate-800">
                    {campaign.objective === 'messages' ? 'Direct WhatsApp Chat' : 'Lead Form'}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Approval Status:</span>
                  <span className="font-bold text-emerald-600 uppercase">
                    {campaign.creative.approvalStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Audience */}
        {activeTab === 'audience' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Target Geography & Demographics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <span className="font-bold text-slate-900">
                    {campaign.audience.locationCity}
                  </span>
                  {campaign.audience.locationArea && (
                    <span className="text-slate-500 block text-[10px]">
                      {campaign.audience.locationArea}
                    </span>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Radius</span>
                  <span className="font-bold text-slate-900">
                    {campaign.audience.radiusKm} km radius
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Age Range</span>
                  <span className="font-bold text-slate-900">
                    {campaign.audience.ageRangeMin} - {campaign.audience.ageRangeMax} yrs
                  </span>
                </div>
              </div>

              {campaign.audience.interests.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Targeted Customer Interests:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {campaign.audience.interests.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

