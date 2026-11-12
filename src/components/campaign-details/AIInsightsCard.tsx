import React from 'react';
import { Campaign } from '../../types';
import { AIEngine } from '../../services/aiEngine';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Lightbulb, Search, Sparkles } from 'lucide-react';

interface AIInsightsCardProps {
  campaign: Campaign;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ campaign }) => {
  const { activeBusiness, tr } = useApp();
  const recommendations = AIEngine.generatePerformanceRecommendations(campaign, {
    acceptableCostPerLead: activeBusiness.economics?.acceptableCostPerLead,
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <h4 className="text-sm font-semibold text-slate-900">{tr('Evidence-backed suggestions')}</h4>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
          {tr('Demo data · not verified')}
        </span>
      </div>

      {recommendations.map((recommendation) => (
        <div key={recommendation.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{tr(recommendation.title)}</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {recommendation.source === 'observed'
                ? tr('Observed signal')
                : recommendation.source === 'diagnostic'
                  ? tr('Diagnostic')
                  : tr('General best practice')}
            </span>
          </div>

          <dl className="mt-3 grid gap-3 text-xs leading-relaxed sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-800">{tr('What happened')}</dt>
              <dd className="mt-0.5 text-slate-600">{tr(recommendation.whatHappened)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">{tr('What it may mean')}</dt>
              <dd className="mt-0.5 text-slate-600">{tr(recommendation.whatItMayMean)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">{tr('Why it matters')}</dt>
              <dd className="mt-0.5 text-slate-600">{tr(recommendation.whyItMatters)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">{tr('Suggested next action')}</dt>
              <dd className="mt-0.5 text-slate-600">{tr(recommendation.suggestedAction)}</dd>
            </div>
          </dl>

          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs leading-relaxed">
            <p className="flex items-start gap-2 text-slate-600">
              <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span><strong className="text-slate-800">{tr('Evidence:')}</strong> {tr(recommendation.evidence)}</span>
            </p>
            <p className="flex items-start gap-2 text-slate-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
              <span><strong className="text-slate-800">{tr('Uncertainty:')}</strong> {tr(recommendation.uncertainty)}</span>
            </p>
            <p className="flex items-start gap-2 text-slate-600">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span>
                <strong className="text-slate-800">{tr('Trade-off:')}</strong> {tr(recommendation.tradeoff)}{' '}
                <strong className="text-slate-800">{tr('Watch:')}</strong> {tr(recommendation.metricToWatch)}
              </span>
            </p>
          </div>
        </div>
      ))}

      <p className="text-xs leading-relaxed text-slate-500">
        {tr('Recommendations never change spend, audiences or publishing automatically. Review the evidence and approve any material change yourself.')}
      </p>
    </div>
  );
};
