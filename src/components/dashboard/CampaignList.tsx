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
  Plus,
  Search,
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
        return <Eye className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
            Completed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-400">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-2xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Campaign Performance
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active and past campaigns for {activeBusiness.businessName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter ads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-36 sm:w-40"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>

          {/* Objective Filter */}
          <select
            value={objectiveFilter}
            onChange={(e) => setObjectiveFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 font-medium"
          >
            <option value="all">All Goals</option>
            <option value="messages">WhatsApp Chats</option>
            <option value="leads">Direct Leads</option>
            <option value="awareness">Store Views</option>
          </select>

          <button
            onClick={() => navigateTo('create-campaign')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="py-12 px-4 text-center space-y-3">
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || objectiveFilter !== 'all'
              ? 'No campaigns match your current filters.'
              : 'No campaigns created yet. Choose a goal above to get started.'}
          </p>
          <button
            onClick={() => navigateTo('create-campaign')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Campaign</th>
                <th className="py-2.5 px-4">Goal</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Spent / Budget</th>
                <th className="py-2.5 px-4">Outcome</th>
                <th className="py-2.5 px-4">Duration</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
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
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectCampaign(c.id)}
                  >
                    {/* Campaign & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.creative?.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200/80 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-xs">
                            {c.campaignName}
                          </p>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {c.audience?.locationCity} · {c.audience?.radiusKm} km radius
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Objective */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-600 capitalize">
                        {getObjectiveIcon(c.objective)}
                        <span>{c.objective}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* Spent / Budget */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{formatINR(spend)}</span>
                      <span className="text-[11px] text-slate-400"> / {formatINR(c.totalBudget)}</span>
                    </td>

                    {/* Outcome */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.objective === 'messages' && (
                        <div>
                          <p className="font-semibold text-emerald-700">{messages} WhatsApp chats</p>
                          <p className="text-[10px] text-slate-400">
                            ~{formatINR(spend > 0 && messages > 0 ? spend / messages : 0)} / chat
                          </p>
                        </div>
                      )}
                      {c.objective === 'leads' && (
                        <div>
                          <p className="font-semibold text-blue-700">{leads} Leads</p>
                          <p className="text-[10px] text-slate-400">
                            ~{formatINR(spend > 0 && leads > 0 ? spend / leads : 0)} / lead
                          </p>
                        </div>
                      )}
                      {c.objective === 'awareness' && (
                        <div>
                          <p className="font-semibold text-slate-800">
                            {impressions.toLocaleString('en-IN')} Views
                          </p>
                          <p className="text-[10px] text-slate-400">Local Reach</p>
                        </div>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      <div>{formatDate(c.startDate)}</div>
                      <div className="text-slate-400">to {formatDate(c.endDate)}</div>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {c.status === 'active' && (
                          <button
                            onClick={() => updateCampaignStatus(c.id, 'paused')}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Pause Campaign"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.status === 'paused' && (
                          <button
                            onClick={() => updateCampaignStatus(c.id, 'active')}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Resume Campaign"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectCampaign(c.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Analytics"
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
