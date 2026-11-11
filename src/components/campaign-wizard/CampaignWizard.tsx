import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign, CampaignObjective } from '../../types';
import { Step1Objective } from './Step1Objective';
import { Step2Strategy } from './Step2Strategy';
import { Step3Creative } from './Step3Creative';
import { Step4Audience } from './Step4Audience';
import { Step5Budget } from './Step5Budget';
import { Step6Review } from './Step6Review';
import { generateMockMetrics } from '../../services/storage';
import {
  RotateCcw,
  X,
  Target,
  Sparkles,
  Palette,
  Users,
  IndianRupee,
  CheckCircle,
} from 'lucide-react';

export const CampaignWizard: React.FC = () => {
  const {
    activeDraft,
    updateActiveDraft,
    clearActiveDraft,
    saveCampaign,
    navigateTo,
    logFunnel,
    showToast,
    activeBusiness,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Initialize draft if empty
  useEffect(() => {
    if (!activeDraft || !activeDraft.businessId) {
      updateActiveDraft({
        businessId: activeBusiness.id,
        objective: 'messages',
        totalBudget: 5000,
        dailyBudget: 500,
        durationDays: 10,
        startDate: new Date().toISOString().split('T')[0],
        status: 'draft',
      });
      logFunnel('campaign_goal_selected', undefined, { step: 1 });
    }
  }, [activeBusiness.id]);

  const steps = [
    { number: 1, label: 'Objective' },
    { number: 2, label: 'Strategy' },
    { number: 3, label: 'Creative' },
    { number: 4, label: 'Audience' },
    { number: 5, label: 'Budget' },
    { number: 6, label: 'Review' },
  ];

  const handleNextStep = (next: number) => {
    setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const stepEvents: Record<number, any> = {
      2: 'campaign_recommendation_generated',
      3: 'creative_generated',
      4: 'creative_approved',
      5: 'audience_configured',
      6: 'campaign_previewed',
    };
    if (stepEvents[next]) {
      logFunnel(stepEvents[next], activeDraft?.id);
    }
  };

  const handleLaunchSuccess = (launchedCampaign: Campaign) => {
    const metrics = generateMockMetrics(
      launchedCampaign.id,
      launchedCampaign.totalBudget,
      launchedCampaign.objective,
      1
    );

    const fullCampaign: Campaign = {
      ...launchedCampaign,
      metrics,
    };

    saveCampaign(fullCampaign);
    logFunnel('campaign_launch_confirmed', fullCampaign.id);
    logFunnel('campaign_created', fullCampaign.id);

    clearActiveDraft();

    showToast({
      type: 'success',
      title: 'Campaign Launched',
      message: `"${fullCampaign.campaignName}" is now active in demo mode.`,
    });

    navigateTo('dashboard', fullCampaign.id);
  };

  const handleResetDraft = () => {
    if (window.confirm('Discard this campaign draft and start fresh?')) {
      clearActiveDraft();
      setCurrentStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Quiet Top Navigation & Step Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Guided Campaign Setup
            </span>
            <h1 className="text-base font-semibold text-slate-900 mt-0.5">
              New Campaign for {activeBusiness.businessName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDraft}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium px-2 py-1 rounded transition-colors flex items-center gap-1"
              title="Start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50 transition-colors"
              title="Close and save as draft"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimalist Step Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1 pb-0.5">
          {steps.map((st, idx) => {
            const isCurrent = currentStep === st.number;
            const isPast = currentStep > st.number;
            return (
              <React.Fragment key={st.number}>
                <button
                  onClick={() => {
                    if (isPast) setCurrentStep(st.number);
                  }}
                  disabled={!isPast && !isCurrent}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : isPast
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 cursor-pointer'
                      : 'text-slate-400 bg-slate-50 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                      isCurrent
                        ? 'bg-white text-slate-900'
                        : isPast
                        ? 'bg-slate-300 text-slate-800'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {st.number}
                  </span>
                  <span>{st.label}</span>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px min-w-3 max-w-10 ${
                      isPast ? 'bg-slate-300' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Body */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-7 shadow-2xs">
        {currentStep === 1 && (
          <Step1Objective
            selectedObjective={activeDraft?.objective || 'messages'}
            onSelectObjective={(obj) => {
              updateActiveDraft({ objective: obj });
              logFunnel('campaign_goal_selected', undefined, { objective: obj });
            }}
            onNext={() => handleNextStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Strategy
            objective={activeDraft?.objective || 'messages'}
            recommendation={activeDraft?.recommendation || null}
            onUpdateRecommendation={(rec) =>
              updateActiveDraft({
                recommendation: rec,
                strategy: rec.strategySummary,
                totalBudget: rec.suggestedTotalBudget,
                dailyBudget: rec.suggestedDailyBudget,
                durationDays: rec.suggestedDurationDays,
              })
            }
            campaignName={activeDraft?.campaignName || ''}
            onUpdateCampaignName={(name) => updateActiveDraft({ campaignName: name })}
            onNext={() => handleNextStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Creative
            objective={activeDraft?.objective || 'messages'}
            creative={activeDraft?.creative || null}
            onUpdateCreative={(cr) => updateActiveDraft({ creative: cr })}
            onNext={() => handleNextStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Audience
            audience={activeDraft?.audience || null}
            onUpdateAudience={(aud) => updateActiveDraft({ audience: aud })}
            onNext={() => handleNextStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5Budget
            objective={activeDraft?.objective || 'messages'}
            totalBudget={activeDraft?.totalBudget || 5000}
            durationDays={activeDraft?.durationDays || 10}
            startDate={activeDraft?.startDate || new Date().toISOString().split('T')[0]}
            onUpdateBudget={(budget, duration, start) => {
              updateActiveDraft({
                totalBudget: budget,
                durationDays: duration,
                dailyBudget: Math.round(budget / duration),
                startDate: start,
              });
            }}
            onNext={() => handleNextStep(6)}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 6 && (
          <Step6Review
            draft={activeDraft || {}}
            onLaunchSuccess={handleLaunchSuccess}
            onBack={() => setCurrentStep(5)}
            onEditStep={(step) => setCurrentStep(step)}
          />
        )}
      </div>
    </div>
  );
};
