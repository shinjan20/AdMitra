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
  Target,
  Sparkles,
  Palette,
  Users,
  IndianRupee,
  CheckCircle,
  X,
  RotateCcw,
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
    { number: 1, label: 'Objective', icon: <Target className="w-3.5 h-3.5" /> },
    { number: 2, label: 'Strategy', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { number: 3, label: 'Creative', icon: <Palette className="w-3.5 h-3.5" /> },
    { number: 4, label: 'Audience', icon: <Users className="w-3.5 h-3.5" /> },
    { number: 5, label: 'Budget', icon: <IndianRupee className="w-3.5 h-3.5" /> },
    { number: 6, label: 'Review', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ];

  const handleNextStep = (next: number) => {
    setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Funnel event logging for each step transition
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
    // Generate initial live metrics for the new campaign
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
      title: '🚀 Campaign Launched Successfully!',
      message: `"${fullCampaign.campaignName}" is now active in demo mode.`,
    });

    navigateTo('dashboard', fullCampaign.id);
  };

  const handleResetDraft = () => {
    if (window.confirm('Are you sure you want to discard this campaign draft?')) {
      clearActiveDraft();
      setCurrentStep(1);
      showToast({
        type: 'info',
        title: 'Draft Cleared',
        message: 'Started fresh campaign creation.',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Wizard Header Bar & Step Progress */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Guided Campaign Builder
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Launch Campaign for {activeBusiness.businessName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDraft}
              className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-50"
              title="Clear draft and start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Draft
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Save and exit to dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="pt-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[550px]">
            {steps.map((st, idx) => {
              const isCurrent = currentStep === st.number;
              const isPast = currentStep > st.number;
              return (
                <React.Fragment key={st.number}>
                  <button
                    onClick={() => {
                      if (isPast || st.number < currentStep) {
                        setCurrentStep(st.number);
                      }
                    }}
                    disabled={st.number > currentStep}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                        : isPast
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                        : 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-white text-blue-600'
                          : isPast
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {st.number}
                    </span>
                    <span>{st.label}</span>
                  </button>

                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isPast ? 'bg-blue-300' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
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

