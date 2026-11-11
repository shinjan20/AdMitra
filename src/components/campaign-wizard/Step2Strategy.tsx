import React, { useState, useEffect } from 'react';
import { CampaignObjective, AIRecommendation } from '../../types';
import { useApp } from '../../context/AppContext';
import { AIEngine } from '../../services/aiEngine';
import { formatINR } from '../../utils/currency';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Check,
  Edit2,
  HelpCircle,
} from 'lucide-react';

interface Step2StrategyProps {
  objective: CampaignObjective;
  recommendation: AIRecommendation | null;
  onUpdateRecommendation: (rec: AIRecommendation) => void;
  campaignName: string;
  onUpdateCampaignName: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Strategy: React.FC<Step2StrategyProps> = ({
  objective,
  recommendation,
  onUpdateRecommendation,
  campaignName,
  onUpdateCampaignName,
  onNext,
  onBack,
}) => {
  const { activeBusiness, settings } = useApp();
  const [loading, setLoading] = useState(false);
  const [isEditingHook, setIsEditingHook] = useState(false);

  useEffect(() => {
    if (!recommendation) {
      handleGenerate();
    }
  }, [objective, activeBusiness]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const rec = await AIEngine.generateStrategy({
        business: activeBusiness,
        objective,
        budget: 5000,
        durationDays: 10,
        openAIApiKey: settings.openAIApiKey,
      });
      onUpdateRecommendation(rec);
      if (!campaignName || campaignName.trim() === '') {
        onUpdateCampaignName(rec.campaignName);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
            Recommended Campaign Strategy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tailored for {activeBusiness.businessName} in {activeBusiness.location.city}.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      {loading && !recommendation ? (
        <div className="py-12 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200/60">
          <Sparkles className="w-5 h-5 text-slate-600 animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-700">
            Synthesizing strategy for {activeBusiness.category}...
          </p>
        </div>
      ) : recommendation ? (
        <div className="space-y-4">
          {/* Campaign Name Field */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName || recommendation.campaignName}
              onChange={(e) => onUpdateCampaignName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="e.g. Wedding Season Special"
            />
          </div>

          {/* AI Strategy Overview */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Strategic Approach
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                {recommendation.confidenceScore}% Local Fit
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {recommendation.strategySummary}
            </p>

            {/* Editable Marketing Hook */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                  Core Offer / Marketing Hook
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingHook(!isEditingHook)}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit2 className="w-3 h-3" />
                  {isEditingHook ? 'Done' : 'Edit'}
                </button>
              </div>

              {isEditingHook ? (
                <textarea
                  rows={2}
                  value={recommendation.keyMarketingHook}
                  onChange={(e) =>
                    onUpdateRecommendation({
                      ...recommendation,
                      keyMarketingHook: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
              ) : (
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  "{recommendation.keyMarketingHook}"
                </p>
              )}
            </div>

            {/* Targeting Rationale */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-slate-800">Targeting Rationale: </strong>
                {recommendation.targetAudienceRationale}
              </span>
            </div>

            {/* Strategy Highlights Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-medium">CTA Button</span>
                <span className="text-xs font-semibold text-slate-900">{recommendation.recommendedCTA}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-medium">Duration</span>
                <span className="text-xs font-semibold text-slate-900">{recommendation.suggestedDurationDays} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-medium">Daily Budget</span>
                <span className="text-xs font-semibold text-slate-900">{formatINR(recommendation.suggestedDailyBudget)}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-medium">Total Budget</span>
                <span className="text-xs font-semibold text-emerald-700">{formatINR(recommendation.suggestedTotalBudget)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={loading || !recommendation}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-all disabled:opacity-50"
        >
          Next: Creatives
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
