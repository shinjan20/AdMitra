import React, { useState } from 'react';
import { Campaign, CampaignObjective, CampaignStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import {
  MessageSquare,
  Users,
  Eye,
  Play,
  Pause,
  Square,
  Trash2,
  ExternalLink,
  PlusCircle,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';

interface CampaignListProps {
  onSelectCampaign: (campaignId: string) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ onSelectCampaign }) => {
  const {
    campaigns,
    activeBusiness,
    updateCampaignStatus,
    deleteCampaign,
    navigateTo,
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
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'leads':
        return <Users className="w-3.5 h-3.5 text-blue-600" />;
      case 'awareness':
        return <Eye className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Pause className="w-3 h-3" />
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            Completed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Campaigns for {activeBusiness.businessName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, pause, or inspect live simulated advertising performance
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 sm:w-44"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>

          {/* Objective Filter */}
          <select
            value={objectiveFilter}
            onChange={(e) => setObjectiveFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
          >
            <option value="all">All Goals</option>
            <option value="messages">WhatsApp / Chat</option>
            <option value="leads">Lead Enquiries</option>
            <option value="awareness">Brand Reach</option>
          </select>

          <button
            onClick={() => navigateTo('create-campaign')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Ad
          </button>
        </div>
      </div>

      {/* Campaigns Table or Empty State */}
      {filteredCampaigns.length === 0 ? (
        <div className="py-16 px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">No campaigns found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'all' || objectiveFilter !== 'all'
                ? 'Try clearing your search or status filters.'
                : 'Create your first AI-guided advertising campaign in under 5 minutes.'}
            </p>
          </div>
          <button
            onClick={() => navigateTo('create-campaign')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Launch First Campaign
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Campaign & Creative</th>
                <th className="py-3 px-4">Objective</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Spend / Budget</th>
                <th className="py-3 px-4">Results</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCampaigns.map((c) => {
                const spend = c.metrics?.totalSpend || 0;
                const leads = c.metrics?.totalLeads || 0;
                const messages = c.metrics?.totalMessages || 0;
                const impressions = c.metrics?.totalImpressions || 0;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectCampaign(c.id)}
                  >
                    {/* Campaign & Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.creative?.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-xs">
                            {c.campaignName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {c.creative?.headline}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {c.audience?.locationCity} ({c.audience?.radiusKm}km radius)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Objective */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 capitalize">
                        {getObjectiveIcon(c.objective)}
                        <span>{c.objective}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* Budget & Spend */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{formatINR(spend)}</p>
                      <p className="text-[11px] text-slate-400">of {formatINR(c.totalBudget)}</p>
                    </td>

                    {/* Performance outcome */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c.objective === 'messages' && (
                        <div>
                          <p className="font-bold text-emerald-700">{messages} WhatsApp chats</p>
                          <p className="text-[10px] text-slate-400">
                            ~{formatINR(spend > 0 && messages > 0 ? spend / messages : 0)} / chat
                          </p>
                        </div>
                      )}
                      {c.objective === 'leads' && (
                        <div>
                          <p className="font-bold text-blue-700">{leads} Leads</p>
                          <p className="text-[10px] text-slate-400">
                            ~{formatINR(spend > 0 && leads > 0 ? spend / leads : 0)} / lead
                          </p>
                        </div>
                      )}
                      {c.objective === 'awareness' && (
                        <div>
                          <p className="font-bold text-slate-800">
                            {impressions.toLocaleString('en-IN')} Views
                          </p>
                          <p className="text-[10px] text-slate-400">Local Area Reach</p>
                        </div>
                      )}
                    </td>

                    {/* Schedule */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                      <div>{formatDate(c.startDate)}</div>
                      <div className="text-slate-400">to {formatDate(c.endDate)}</div>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === 'active' && (
                          <button
                            onClick={() => updateCampaignStatus(c.id, 'paused')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Pause Campaign"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.status === 'paused' && (
                          <button
                            onClick={() => updateCampaignStatus(c.id, 'active')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Resume Campaign"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.status !== 'completed' && (
                          <button
                            onClick={() => updateCampaignStatus(c.id, 'completed')}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectCampaign(c.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Full Analytics & Insights"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete campaign "${c.campaignName}"?`)) {
                              deleteCampaign(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

