import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const JTBDLauncher: React.FC = () => {
  const { activeBusiness, activeDraft, updateActiveDraft, navigateTo, logFunnel } = useApp();
  const [creativePrompt, setCreativePrompt] = useState(activeDraft?.creativePrompt || '');

  useEffect(() => {
    setCreativePrompt(activeDraft?.creativePrompt || '');
  }, [activeDraft?.creativePrompt]);

  const handleStartCampaign = () => {
    const prompt = creativePrompt.trim();
    const directionChanged = prompt !== (activeDraft?.creativePrompt || '');

    updateActiveDraft({
      businessId: activeBusiness.id,
      creativePrompt: prompt,
      objective: activeDraft?.objective || 'messages',
      totalBudget: activeDraft?.totalBudget || 5000,
      dailyBudget: activeDraft?.dailyBudget || 500,
      durationDays: activeDraft?.durationDays || 10,
      startDate: activeDraft?.startDate || new Date().toISOString().split('T')[0],
      status: activeDraft?.status || 'draft',
      ...(directionChanged ? { recommendation: undefined, creative: undefined } : {}),
    });
    logFunnel('campaign_goal_selected', undefined, { source: 'dashboard' });
    navigateTo('create-campaign');
  };

  const hasDraft = Boolean(activeDraft?.businessId);

  return (
    <section data-tour="ad-prompt" className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-2xs">
      <div className="max-w-2xl">
        <span className="text-sm font-medium text-slate-500">Let’s make an ad</span>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight mt-1">
          {hasDraft ? 'Continue your ad' : 'Create an ad'} for {activeBusiness.businessName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tell us what you want to share. We’ll help with the rest.
        </p>
      </div>

      <div className="mt-5 max-w-2xl space-y-3">
        <div>
          <label
            htmlFor="dashboard-creative-prompt"
            className="block text-sm font-medium text-slate-800 mb-1.5"
          >
            What would you like customers to know? <span className="font-normal text-slate-500">Optional</span>
          </label>
          <textarea
            id="dashboard-creative-prompt"
            value={creativePrompt}
            onChange={(event) => setCreativePrompt(event.target.value)}
            rows={2}
            maxLength={500}
            placeholder="For example: Mention weekend appointments or use a friendly tone."
            className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <p className="mt-1 text-xs text-slate-500">
            You can leave this blank and add or change it later.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCampaign}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {hasDraft ? 'Continue your ad' : 'Create ad'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
