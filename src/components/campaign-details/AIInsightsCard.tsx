import React from 'react';
import { Campaign } from '../../types';
import { AIEngine } from '../../services/aiEngine';
import { Sparkles, Check, Lightbulb } from 'lucide-react';

interface AIInsightsCardProps {
  campaign: Campaign;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ campaign }) => {
  const metrics = campaign.metrics;
  if (!metrics) return null;

  const insights = AIEngine.generateInsights(campaign.objective, {
    totalSpend: metrics.totalSpend,
    impressions: metrics.totalImpressions,
    clicks: metrics.totalClicks,
    leads: metrics.totalLeads,
    messages: metrics.totalMessages,
    costPerOutcome: metrics.costPerLead || metrics.costPerMessage,
  });

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-semibold text-slate-900">
            Performance Analysis
          </h4>
        </div>

        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          AI Summary
        </span>
      </div>

      {/* Main Headline & Summary */}
      <div>
        <h3 className="text-xs font-semibold text-slate-900">{insights.headline}</h3>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{insights.summary}</p>
      </div>

      {/* What this means in plain language */}
      <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 space-y-0.5">
        <span className="font-semibold text-slate-900 block text-[10px] uppercase">
          What This Means
        </span>
        <p className="leading-relaxed text-[11px] text-slate-600">{insights.plainExplanation}</p>
      </div>

      {/* Recommendations */}
      <div className="space-y-1.5 pt-1">
        <span className="text-xs font-medium text-slate-800 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
          Actionable Advice
        </span>
        <ul className="space-y-1">
          {insights.tips.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 p-2 rounded-lg"
            >
              <span className="text-slate-400 font-semibold text-[10px] flex-shrink-0 mt-0.5">
                {idx + 1}.
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
