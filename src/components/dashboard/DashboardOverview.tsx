import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR } from '../../utils/currency';
import {
  TrendingUp,
  Users,
  MessageSquare,
  IndianRupee,
  Layers,
  Sparkles,
  ArrowUpRight,
  Wallet,
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

  const remainingBudget = Math.max(0, totalAllocatedBudget - totalSpend);
  const totalInquiries = totalLeads + totalMessages;
  const avgCostPerInquiry =
    totalInquiries > 0 ? Math.round(totalSpend / totalInquiries) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Spend */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Spend</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(totalSpend)}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            of {formatINR(totalAllocatedBudget)}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 pt-0.5">
          {formatINR(remainingBudget)} remaining budget
        </p>
      </div>

      {/* 2. Customer Enquiries & WhatsApp chats */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Enquiries
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {totalInquiries}
          </h3>
          <span className="text-xs font-semibold text-emerald-600 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" /> Direct
          </span>
        </div>
        <p className="text-[11px] text-slate-500 pt-0.5">
          {totalMessages} WhatsApp chats • {totalLeads} calls/leads
        </p>
      </div>

      {/* 3. Average Cost per Enquiry */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Avg. Cost / Customer
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {avgCostPerInquiry > 0 ? formatINR(avgCostPerInquiry) : '₹0'}
          </h3>
          <span className="text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
            Cost / Lead
          </span>
        </div>
        <p className="text-[11px] text-slate-500 pt-0.5">
          {totalImpressions.toLocaleString('en-IN')} local impressions
        </p>
      </div>

      {/* 4. Active Campaigns */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Campaigns</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {activeCampaigns}{' '}
            <span className="text-sm font-normal text-slate-500">Active</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">({totalCampaigns} total)</span>
        </div>
        <p className="text-[11px] text-emerald-700 font-medium pt-0.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          Running on simulated local audiences
        </p>
      </div>
    </div>
  );
};

