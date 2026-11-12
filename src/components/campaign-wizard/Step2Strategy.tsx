import React, { useState, useEffect } from 'react';
import { CampaignObjective, AIRecommendation, ChannelProvider } from '../../types';
import { useApp } from '../../context/AppContext';
import { AIEngine } from '../../services/aiEngine';
import { BudgetEngine } from '../../services/budgetEngine';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Check,
  Edit2,
  Search,
  Megaphone,
} from 'lucide-react';

interface Step2StrategyProps {
  objective: CampaignObjective;
  recommendation: AIRecommendation | null;
  onUpdateRecommendation: (rec: AIRecommendation) => void;
  campaignName: string;
  onUpdateCampaignName: (name: string) => void;
  channel?: ChannelProvider;
  onUpdateChannel: (channel: ChannelProvider) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Strategy: React.FC<Step2StrategyProps> = ({
  objective,
  recommendation,
  onUpdateRecommendation,
  campaignName,
  onUpdateCampaignName,
  channel,
  onUpdateChannel,
  onNext,
  onBack,
}) => {
  const { activeBusiness, showToast, tr } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditingHook, setIsEditingHook] = useState(false);

  const suggestedPlan = BudgetEngine.buildPlan({
    business: activeBusiness,
    objective,
    budget: 5000,
    durationDays: 10,
  });
  const suggestedChannel = suggestedPlan.allocations[0]?.provider || 'meta';
  const selectedChannel = channel || suggestedChannel;

  useEffect(() => {
    if (!recommendation) {
      handleGenerate();
    }
  }, [objective, activeBusiness]);

  useEffect(() => {
    if (!channel) {
      onUpdateChannel(suggestedChannel);
    }
  }, [channel, suggestedChannel]);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const rec = await AIEngine.generateStrategy({
        business: activeBusiness,
        objective,
        budget: 5000,
        durationDays: 10,
      });
      onUpdateRecommendation(rec);
      if (!campaignName || campaignName.trim() === '') {
        onUpdateCampaignName(rec.campaignName);
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : tr('Please try again.');
      setError(message);
      showToast({
        type: 'error',
        title: tr('Could not make a suggestion'),
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="wizard-step-2" className="space-y-6">
      <DemoNoticeBadge />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
            {tr('A starting idea')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tr('A suggestion for {business}. Change it or try another.', { business: activeBusiness.businessName })}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? tr('Working...') : tr('Try another plan')}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}{' '}
          <button type="button" onClick={handleGenerate} className="font-semibold underline">
            {tr('Retry')}
          </button>
        </div>
      )}

      {loading && !recommendation ? (
        <div className="py-12 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200/60">
          <Sparkles className="w-5 h-5 text-slate-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700">{tr('Making a suggestion...')}</p>
        </div>
      ) : recommendation ? (
        <div className="space-y-4">
          <details className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
              {tr('Give this ad a name')} <span className="font-normal text-slate-500">{tr('(optional)')}</span>
            </summary>
            <label htmlFor="campaign-name" className="mt-3 block text-sm text-slate-700">
              {tr('Ad name')}
            </label>
            <input
              id="campaign-name"
              type="text"
              value={campaignName || recommendation.campaignName}
              onChange={(e) => onUpdateCampaignName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder={tr('For example: Summer offer')}
            />
          </details>

          <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">{tr('Suggested idea')}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                {tr('Suggested')}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {tr(recommendation.strategySummary, {
                area: activeBusiness.location.area || activeBusiness.location.city,
                city: activeBusiness.location.city,
              })}
            </p>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {tr('Main message')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingHook(!isEditingHook)}
                  className="min-h-10 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
                >
                  <Edit2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                  {isEditingHook ? tr('Done') : tr('Change')}
                </button>
              </div>

              {isEditingHook ? (
                <textarea
                  aria-label={tr('Main message')}
                  rows={2}
                  value={recommendation.keyMarketingHook}
                  onChange={(e) =>
                    onUpdateRecommendation({
                      ...recommendation,
                      keyMarketingHook: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                />
              ) : (
                <p className="text-sm font-medium leading-relaxed text-slate-900">
                  {tr(recommendation.keyMarketingHook)}
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">
              <span>
                <strong className="text-slate-800">{tr('Why this might suit your business:')} </strong>
                {tr(recommendation.targetAudienceRationale)}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {recommendation && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{tr('Where this ad could appear')}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {tr('We suggest a channel based on what you want and what you sell. People who click a Google ad are not automatically shown your Facebook or Instagram ad.')}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                provider: 'meta' as ChannelProvider,
                title: 'Meta ads (Facebook / Instagram)',
                description: 'Local discovery and message enquiries from nearby audiences.',
                icon: <Megaphone className="h-4 w-4" aria-hidden="true" />,
              },
              {
                provider: 'google_search' as ChannelProvider,
                title: 'Google Search',
                description: 'Capture people already searching for this service nearby.',
                icon: <Search className="h-4 w-4" aria-hidden="true" />,
              },
            ].map((option) => {
              const isSelected = selectedChannel === option.provider;
              return (
                <button
                  key={option.provider}
                  type="button"
                  onClick={() => onUpdateChannel(option.provider)}
                  aria-pressed={isSelected}
                  className={`min-h-24 rounded-xl border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {option.icon}
                    {tr(option.title)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    {tr(option.description)}
                  </span>
                  {option.provider === suggestedChannel && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      {tr('Suggested first test')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            {tr('WhatsApp is treated as a conversation destination, not a standalone paid channel. Google Business Profile is a free local listing and receives no paid media budget.')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {tr('Back')}
        </button>

        <button
          onClick={onNext}
          disabled={loading || !recommendation}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-all disabled:opacity-50"
        >
          {tr('Next: write your ad')}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
