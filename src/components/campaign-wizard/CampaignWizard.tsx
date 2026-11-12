import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign, CampaignObjective } from '../../types';
import { toISODateOnly } from '../../utils/date';
import { Step1Objective } from './Step1Objective';
import { Step2Strategy } from './Step2Strategy';
import { Step3Creative } from './Step3Creative';
import { Step4Audience } from './Step4Audience';
import { Step5Budget } from './Step5Budget';
import { Step6Review } from './Step6Review';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import {
  RotateCcw,
  X,
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
    tr,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    // First check for one-time start step (from marketing plan)
    const storedStep = localStorage.getItem('admitra:wizard-start-step');
    if (storedStep) {
      const step = parseInt(storedStep, 10);
      localStorage.removeItem('admitra:wizard-start-step');
      return step;
    }
    // Then check for persisted step (resume)
    const persistedStep = localStorage.getItem('admitra:wizard-current-step');
    if (persistedStep) {
      return parseInt(persistedStep, 10);
    }
    return 1;
  });

  // Persist current step on change
  useEffect(() => {
    localStorage.setItem('admitra:wizard-current-step', currentStep.toString());
  }, [currentStep]);

  // Initialize draft if empty or missing key fields
  useEffect(() => {
    if (!activeDraft || !activeDraft.businessId || !activeDraft.objective) {
      // Check for demo scenario data
      let demoScenarioData = null;
      try {
        const stored = localStorage.getItem('admitra:demo-scenario');
        if (stored) {
          demoScenarioData = JSON.parse(stored);
          localStorage.removeItem('admitra:demo-scenario');
        }
      } catch (e) {
        console.error('Failed to parse demo scenario:', e);
      }

      const budget = demoScenarioData?.budget || 5000;
      const duration = demoScenarioData?.duration || 10;

      // Get local date string (not UTC) to avoid timezone issues
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Step 3: Full creative with all required fields including imageUrl
      const creative = demoScenarioData?.headline ? {
        id: `cr-${Date.now()}`,
        campaignId: '',
        headline: demoScenarioData.headline,
        description: demoScenarioData.description || '',
        cta: (demoScenarioData.cta || 'Send WhatsApp Message') as any,
        imageUrl: demoScenarioData.imageUrl || '', // Ensure imageUrl is populated
        approvalStatus: 'approved' as const,
        createdAt: new Date().toISOString(),
      } : undefined;

      // Step 4: Full audience with all required fields
      const audience = demoScenarioData?.city ? {
        id: `aud-${Date.now()}`,
        campaignId: '',
        locationCity: demoScenarioData.city,
        locationArea: demoScenarioData.area || '',
        radiusKm: demoScenarioData.radiusKm || 5,
        ageRangeMin: 20,
        ageRangeMax: 55,
        gender: 'all' as const,
        interests: [],
        estimatedAudienceSize: '50K - 100K',
        rationale: `People within ${demoScenarioData.radiusKm || 5}km of ${demoScenarioData.area || demoScenarioData.city}, ${demoScenarioData.city}`,
      } : undefined;

      // Step 2: AI recommendation
      const recommendation = demoScenarioData?.campaignName ? {
        id: `rec-${Date.now()}`,
        campaignName: demoScenarioData.campaignName,
        strategySummary: `Reach local audience in ${demoScenarioData.city} with focus on ${demoScenarioData.objective}`,
        targetAudienceRationale: `Target people aged 20-55 interested in your services within ${demoScenarioData.radiusKm || 5}km radius`,
        suggestedDurationDays: duration,
        suggestedDailyBudget: Math.round(budget / duration),
        suggestedTotalBudget: budget,
        recommendedCTA: (demoScenarioData.cta || 'Send WhatsApp Message') as any,
        keyMarketingHook: demoScenarioData.offer || 'Exclusive offer this month',
        creativeThemes: ['local', 'promotional', 'engagement'],
        suggestedInterests: ['local_businesses', demoScenarioData.objective],
      } : undefined;

      updateActiveDraft({
        businessId: activeBusiness.id,
        objective: demoScenarioData?.objective || 'messages',
        campaignName: demoScenarioData?.campaignName || 'Demo Campaign',
        creativePrompt: demoScenarioData?.offer,
        totalBudget: budget,
        dailyBudget: Math.round(budget / duration),
        durationDays: duration,
        startDate: localDate,
        status: 'draft',
        channel: (demoScenarioData?.channel || 'meta') as any,
        destinationType: (demoScenarioData?.objective === 'messages' ? 'whatsapp' : 'phone') as any,
        destinationValue: '+91 98765 43210', // Demo placeholder
        strategy: demoScenarioData?.offer || 'Sample advertising plan',
        // Step 3: Creative
        creative,
        // Step 4: Audience
        audience,
        // Step 2: Recommendation
        recommendation,
      });
      logFunnel('campaign_goal_selected', undefined, { step: 1 });
    }
  }, [activeBusiness.id]);

  const steps = [
    { number: 1, label: tr('Goal') },
    { number: 2, label: tr('Plan') },
    { number: 3, label: tr('Ad') },
    { number: 4, label: tr('Area') },
    { number: 5, label: tr('Budget') },
    { number: 6, label: tr('Review') },
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
    const savedCampaign: Campaign = {
      ...launchedCampaign,
      status: 'simulated',
      executionMode: 'simulated',
    };

    saveCampaign(savedCampaign);
    logFunnel('campaign_approved', savedCampaign.id);
    logFunnel('campaign_plan_saved', savedCampaign.id);

    clearActiveDraft();

    showToast({
      type: 'success',
      title: tr('Simulated plan saved'),
      message: tr('"{name}" is saved. Nothing was published and no money was spent.', { name: savedCampaign.campaignName }),
    });

    navigateTo('dashboard', savedCampaign.id);
  };

  const handleResetDraft = () => {
    if (window.confirm(tr('Clear this ad and start again?'))) {
      clearActiveDraft();
      setCurrentStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Quiet Top Navigation & Step Tracker */}
      <div className="surface-card space-y-4 p-4">
        <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-3">
          <div>
            <span className="chip">
              {tr('Plan an ad')}
            </span>
            <h1 className="display mt-2 text-2xl font-bold sm:text-3xl">
              {tr('For {business}', { business: activeBusiness.businessName })}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDraft}
              className="min-h-10 rounded-lg px-3 text-sm font-medium text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]"
              title={tr('Clear this ad and start again')}
            >
              <RotateCcw className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              {tr('Start over')}
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="rounded-lg p-1.5 text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]"
              title={tr('Close and save your progress')}
              aria-label={tr('Close and save your progress')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimalist Step Pills */}
        <div className="grid min-w-0 grid-cols-3 gap-2 pt-1 pb-0.5 sm:flex sm:items-center sm:justify-between sm:gap-1">
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
                  className={`flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all sm:w-auto sm:justify-start sm:px-3 ${
                    isCurrent
                      ? 'bg-[color:var(--marigold-soft)] text-[color:var(--marigold-ink)]'
                      : isPast
                      ? 'bg-white text-[color:var(--ink)] ring-1 ring-[color:var(--line)] hover:bg-[color:var(--paper)] cursor-pointer'
                      : 'bg-transparent text-[color:var(--ink-soft)]/50 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[color:var(--marigold)] text-[color:var(--ink)]'
                        : isPast
                        ? 'bg-[color:var(--leaf-soft)] text-[color:var(--leaf)]'
                        : 'bg-[color:var(--paper-deep)] text-[color:var(--ink-soft)]/60'
                    }`}
                  >
                    {st.number}
                  </span>
                  <span>{st.label}</span>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`hidden h-px min-w-3 max-w-10 flex-1 sm:flex ${
                      isPast ? 'bg-slate-300' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <DemoNoticeBadge />

      {/* Step Body */}
      <div className="surface-raised rounded-2xl p-5 sm:p-7">
        {currentStep === 1 && (
          <Step1Objective
            selectedObjective={activeDraft?.objective || 'messages'}
            onSelectObjective={(obj) => {
              updateActiveDraft((draft) => ({
                ...draft,
                objective: obj,
                ...(draft?.objective !== obj
                  ? { recommendation: undefined, creative: undefined }
                  : {}),
              }));
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
            channel={activeDraft?.channel}
            onUpdateChannel={(channel) => updateActiveDraft({ channel })}
            onNext={() => handleNextStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Creative
            objective={activeDraft?.objective || 'messages'}
            creative={activeDraft?.creative || null}
            creativePrompt={activeDraft?.creativePrompt || ''}
            onUpdateCreativePrompt={(prompt) =>
              updateActiveDraft((draft) => ({
                ...draft,
                creativePrompt: prompt,
                ...(prompt !== (draft?.creativePrompt || '') ? { creative: undefined } : {}),
              }))
            }
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
            startDate={activeDraft?.startDate || toISODateOnly(new Date())}
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
