import React, { useState, useEffect } from 'react';
import { CampaignObjective, AIRecommendation, CTAType } from '../../types';
import { useApp } from '../../context/AppContext';
import { AIEngine } from '../../services/aiEngine';
import { formatINR } from '../../utils/currency';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Edit3,
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

  // Generate strategy on first mount if none exists
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
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
              Step 2 of 6
            </span>
            <span className="text-xs text-slate-500 font-medium">AI Strategy Recommendation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Recommended Campaign Strategy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crafted specifically for {activeBusiness.businessName} in {activeBusiness.location.city}.
            You can modify any detail.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Regenerate Strategy'}
        </button>
      </div>

      {loading && !recommendation ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Synthesizing Local Market Insights for {activeBusiness.location.city}...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Reviewing target audience behaviors, optimal messaging hooks, and budget efficiencies for{' '}
            {activeBusiness.category}.
          </p>
        </div>
      ) : recommendation ? (
        <div className="space-y-4">
          {/* Campaign Name Field */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName || recommendation.campaignName}
              onChange={(e) => onUpdateCampaignName(e.target.value)}
              className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Give your campaign an identifiable name"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Internal name to track this campaign in your dashboard.
            </p>
          </div>

          {/* AI Strategic Blueprint Card */}
          <div className="p-5 bg-gradient-to-br from-white to-slate-50/60 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    AI Strategic Rationale
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Why this strategy works best for your business
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {recommendation.confidenceScore}% Match Score
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {recommendation.strategySummary}
            </p>

            {/* Key Hook (Editable) */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                  Primary Marketing Hook
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingHook(!isEditingHook)}
                  className="text-[11px] text-blue-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  {isEditingHook ? 'Done Editing' : 'Edit Hook'}
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
                  className="w-full mt-1 p-2 text-xs border border-blue-300 rounded-lg bg-white"
                />
              ) : (
                <p className="text-xs text-blue-950 font-semibold leading-relaxed">
                  "{recommendation.keyMarketingHook}"
                </p>
              )}
            </div>

            {/* Plain English explanation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Targeting Rationale: </strong>
                {recommendation.targetAudienceRationale}
              </div>
            </div>

            {/* Strategy Highlights Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Recommended CTA</span>
                <span className="text-xs font-bold text-blue-700">{recommendation.recommendedCTA}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Duration</span>
                <span className="text-xs font-bold">{recommendation.suggestedDurationDays} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Suggested Daily</span>
                <span className="text-xs font-bold">{formatINR(recommendation.suggestedDailyBudget)}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Total Budget</span>
                <span className="text-xs font-bold text-emerald-700">{formatINR(recommendation.suggestedTotalBudget)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Goal
        </button>

        <button
          onClick={onNext}
          disabled={loading || !recommendation}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow disabled:opacity-50"
        >
          Next: AI Creative Studio
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

