import React from 'react';
import { Campaign } from '../../types';
import { AIEngine } from '../../services/aiEngine';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';

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
    <div className="p-5 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 rounded-2xl border border-blue-200/70 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              AI Performance Coach
            </h4>
            <p className="text-[11px] text-blue-800/80">
              Plain English translation of your campaign results
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
            insights.sentiment === 'positive'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {insights.sentiment === 'positive' ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-amber-600" />
          )}
          {insights.sentiment === 'positive' ? 'Healthy Delivery' : 'Optimization Recommended'}
        </span>
      </div>

      {/* Main Headline & Summary */}
      <div>
        <h3 className="text-sm font-bold text-slate-900">{insights.headline}</h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insights.summary}</p>
      </div>

      {/* What this means in plain language */}
      <div className="p-3 bg-white rounded-xl border border-blue-100/80 text-xs text-slate-700 space-y-1">
        <span className="font-bold text-blue-900 block uppercase text-[10px] tracking-wider">
          What This Means For Your Business
        </span>
        <p className="leading-relaxed">{insights.plainExplanation}</p>
      </div>

      {/* Actionable Recommendations */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Actionable Recommendations
        </span>
        <ul className="space-y-1.5">
          {insights.tips.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-600 flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-slate-100"
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

