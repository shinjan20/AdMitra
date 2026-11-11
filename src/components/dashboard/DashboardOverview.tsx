import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import {
  MessageSquare,
  IndianRupee,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { campaigns, activeBusiness } = useApp();

  const businessCampaigns = campaigns.filter((c) => c.businessId === activeBusiness.id);

  const totalCampaigns = businessCampaigns.length;
  const activeCampaigns = businessCampaigns.filter((c) => c.status === 'active').length;

  let totalSpend = 0;
  let totalAllocatedBudget = 0;
  let totalLeads = 0;
  let totalMessages = 0;
  let totalImpressions = 0;

  businessCampaigns.forEach((c) => {
    totalAllocatedBudget += c.totalBudget;
    if (c.metrics) {
      totalSpend += c.metrics.totalSpend;
      totalLeads += c.metrics.totalLeads || 0;
      totalMessages += c.metrics.totalMessages || 0;
      totalImpressions += c.metrics.totalImpressions;
    }
  });

  const totalInquiries = totalLeads + totalMessages;
  const avgCostPerInquiry =
    totalInquiries > 0 ? Math.round(totalSpend / totalInquiries) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Inquiries Generated (Most important to SMB) */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
          Inquiries Received
        </span>
        <div className="flex items-baseline gap-2 pt-0.5">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalInquiries}
          </h3>
          <span className="text-xs font-medium text-emerald-600 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" /> Direct
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          {totalMessages} WhatsApp chats · {totalLeads} calls
        </p>
      </div>

      {/* 2. Total Spend */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
          Total Spent
        </span>
        <div className="flex items-baseline gap-2 pt-0.5">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatINR(totalSpend)}
          </h3>
          <span className="text-[11px] text-slate-400">
            of {formatINR(totalAllocatedBudget)}
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          {formatINR(Math.max(0, totalAllocatedBudget - totalSpend))} remaining budget
        </p>
      </div>

      {/* 3. Cost per Customer Inquiry */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
          Cost / Inquiry
        </span>
        <div className="flex items-baseline gap-2 pt-0.5">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {avgCostPerInquiry > 0 ? formatINR(avgCostPerInquiry) : '₹0'}
          </h3>
          <span className="text-[11px] text-slate-500 font-normal">avg</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {totalImpressions.toLocaleString('en-IN')} local impressions
        </p>
      </div>

      {/* 4. Active Ads */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
          Active Campaigns
        </span>
        <div className="flex items-baseline gap-2 pt-0.5">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeCampaigns}
          </h3>
          <span className="text-[11px] text-slate-400 font-normal">
            ({totalCampaigns} total)
          </span>
        </div>
        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Running on local audience
        </p>
      </div>
    </div>
  );
};
