import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BudgetEngine, PlanScenario } from '../../services/budgetEngine';
import { CampaignObjective, MarketingPlan } from '../../types';
import { formatINR } from '../../utils/currency';
import { toISODateOnly } from '../../utils/date';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';

const objectives: Array<{
  id: CampaignObjective;
  title: string;
  description: string;
}> = [
  {
    id: 'messages',
    title: 'WhatsApp messages',
    description: 'People nearby message you on WhatsApp.',
  },
  {
    id: 'leads',
    title: 'Phone calls or form fills',
    description: 'People call you or fill in your enquiry form.',
  },
  {
    id: 'awareness',
    title: 'Get noticed nearby',
    description: 'More people nearby see your shop or service.',
  },
];

const scenarioCopy: Record<PlanScenario, { label: string; description: string }> = {
  recommended: {
    label: 'Recommended',
    description: 'A balanced split based on your goal, your type of business and what is set up.',
  },
  conservative: {
    label: 'Cautious start',
    description: 'Keeps most of the budget where people are already looking, with a little elsewhere.',
  },
  test_first: {
    label: 'Try one place',
    description: 'Puts the whole budget into one place so you can see if it works.',
  },
};

const confidenceStyles = {
  low: 'bg-amber-50 text-amber-900 border-amber-200',
  medium: 'bg-blue-50 text-blue-900 border-blue-200',
  high: 'bg-emerald-50 text-emerald-900 border-emerald-200',
};

export const MarketingPlanPage: React.FC = () => {
  const {
    activeBusiness,
    connectedAccounts,
    marketingPlans,
    saveMarketingPlan,
    approveMarketingPlan,
    updateActiveDraft,
    navigateTo,
    showToast,
    tr,
  } = useApp();

  const defaultBudget = activeBusiness.investment?.monthlyBudget ||
    activeBusiness.investment?.comfortableStart ||
    12000;
  const destinationLabels: Record<string, string> = {
    whatsapp: tr('WhatsApp'),
    phone: tr('Phone'),
    website: tr('Website'),
    form: tr('Lead form'),
    booking: tr('Booking link'),
  };
  const destinationLabel = activeBusiness.primaryContactMethod
    ? destinationLabels[activeBusiness.primaryContactMethod] || tr('Not set')
    : activeBusiness.whatsappNumber
      ? tr('WhatsApp')
      : tr('Not set');
  const [objective, setObjective] = useState<CampaignObjective>('messages');
  const [budget, setBudget] = useState<number>(defaultBudget);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [scenario, setScenario] = useState<PlanScenario>('recommended');
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const connectedProviders = connectedAccounts
    .filter((account) => account.status === 'demo_connected')
    .map((account) => account.provider);

  const basePlan = useMemo(
    () =>
      BudgetEngine.buildPlan({
        business: activeBusiness,
        objective,
        budget,
        durationDays,
        scenario,
        connectedProviders,
      }),
    [activeBusiness, objective, budget, durationDays, scenario, connectedProviders.join('|')],
  );

  useEffect(() => {
    setAmounts(
      Object.fromEntries(basePlan.allocations.map((allocation) => [allocation.provider, allocation.amount])),
    );
  }, [basePlan.id, basePlan.totalBudget, basePlan.durationDays, basePlan.scenario]);

  const editedAllocations = basePlan.allocations.map((allocation) => {
    const amount = amounts[allocation.provider] ?? allocation.amount;
    return {
      ...allocation,
      amount,
      percentage: budget > 0 ? Math.round((amount / budget) * 100) : 0,
    };
  });

  const allocatedTotal = editedAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  const isBalanced = allocatedTotal === budget;
  const allocationKey = (allocations: MarketingPlan['allocations']) =>
    allocations
      .map((allocation) => `${allocation.provider}:${allocation.amount}`)
      .sort()
      .join('|');
  const approvedPlan = marketingPlans.find(
    (plan) => plan.id === basePlan.id && plan.approvalState === 'approved',
  );
  const isApproved = Boolean(
    approvedPlan &&
      approvedPlan.totalBudget === budget &&
      allocationKey(approvedPlan.allocations) === allocationKey(editedAllocations),
  );

  const hasEconomics = Boolean(
    activeBusiness.economics?.averageOrderValue ||
      activeBusiness.economics?.acceptableCostPerLead ||
      activeBusiness.economics?.capacityLeadsPerMonth,
  );
  const hasDestination = Boolean(
    activeBusiness.whatsappNumber ||
      activeBusiness.phone ||
      activeBusiness.websiteUrl ||
      activeBusiness.digitalPresence?.website,
  );

  const buildEditedPlan = (approvalState: MarketingPlan['approvalState']): MarketingPlan => ({
    ...basePlan,
    allocations: editedAllocations,
    approvalState,
    approvedAt: approvalState === 'approved' ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  });

  const handleApprove = () => {
    if (!isBalanced) {
      showToast({
        type: 'error',
        title: 'The amounts do not add up',
        message: 'Change the amounts so they add up to your total budget.',
      });
      return;
    }
    const saved = saveMarketingPlan(buildEditedPlan('draft'), { silent: true });
    const approved = approveMarketingPlan(saved.id);
    if (approved) {
      // Keep the page's local approval state in sync with storage.
      setAmounts(
        Object.fromEntries(
          approved.allocations.map((allocation) => [allocation.provider, allocation.amount]),
        ),
      );
    }
  };

  const handleCreateCampaign = () => {
    if (!isApproved) {
      showToast({
        type: 'warning',
        title: 'Approve the plan first',
        message: 'Approve the budget split before creating an ad plan.',
      });
      return;
    }
    updateActiveDraft({
      businessId: activeBusiness.id,
      objective,
      planId: basePlan.id,
      strategy: basePlan.rationale,
      totalBudget: budget,
      dailyBudget: Math.round(budget / Math.max(1, durationDays)),
      durationDays,
      startDate: toISODateOnly(new Date()),
      status: 'draft',
      channel: editedAllocations[0]?.provider,
      // Pre-fill with plan data
      campaignName: `${activeBusiness.businessName} - ${objective === 'messages' ? 'WhatsApp' : objective === 'leads' ? 'Leads' : 'Awareness'}`,
    });
    
    // Store the step to jump to in localStorage
    localStorage.setItem('admitra:wizard-start-step', '2');
    
    navigateTo('create-campaign');
  };

  const resetAllocation = () => {
    setAmounts(
      Object.fromEntries(basePlan.allocations.map((allocation) => [allocation.provider, allocation.amount])),
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{tr('Marketing plan')}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {tr('Decide how much to spend, and where')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {tr(
              'Build a clear starting plan for {business}. You can change every amount, and nothing is spent or published until you approve it.',
              { business: activeBusiness.businessName || tr('your business') },
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigateTo('business-profile')}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {tr('Your business details')}
          </button>
          <button
            type="button"
            onClick={() => navigateTo('connected-accounts')}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {tr('Linked accounts')}
          </button>
        </div>
      </header>

      <DemoNoticeBadge />

      {(!hasEconomics || !hasDestination) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{tr('This plan is based on what we know about your business.')}</p>
            <p className="mt-1 leading-relaxed">
              {!hasEconomics && `${tr('Add money basics such as your average sale value, profit margin or the most you can pay for an enquiry.')} `}
              {!hasDestination && `${tr('Add at least one way for customers to reach you — phone, WhatsApp, website or enquiry form.')} `}
              {tr('You can still make a plan, but it is less precise until this is filled in.')}
            </p>
            <button
              type="button"
              onClick={() => navigateTo('business-profile')}
              className="mt-2 inline-flex min-h-10 items-center gap-1.5 font-semibold text-amber-900 underline"
            >
              {tr('Finish your business details')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Target className="h-4 w-4 text-slate-500" aria-hidden="true" />
              {tr('What do you want from this ad?')}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {objectives.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setObjective(item.id)}
                  aria-pressed={objective === item.id}
                  className={`min-h-24 rounded-xl border p-3 text-left transition-colors ${
                    objective === item.id
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-900">{tr(item.title)}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">{tr(item.description)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="plan-budget" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Wallet className="h-4 w-4 text-slate-500" aria-hidden="true" />
                {tr('Ad budget for this plan')}
              </label>
              <input
                id="plan-budget"
                type="number"
                min="1000"
                step="500"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value) || 0)}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">
                {tr('In a live campaign, this money would go to Google or Meta. In this demo it is only an example.')}
              </p>
            </div>
            <div>
              <label htmlFor="plan-duration" className="mb-1.5 block text-sm font-medium text-slate-700">
                {tr('How many days?')}
              </label>
              <input
                id="plan-duration"
                type="number"
                min="7"
                max="60"
                value={durationDays}
                onChange={(event) => setDurationDays(Number(event.target.value) || 30)}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">
                {tr('That is about {amount} a month at this pace.', { amount: formatINR(basePlan.monthlyBudget) })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{tr('Your business')}</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{tr('Category')}</dt>
              <dd className="text-right font-medium text-slate-900">{activeBusiness.category ? tr(activeBusiness.category) : tr('Not set')}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{tr('Location')}</dt>
              <dd className="text-right font-medium text-slate-900">
                {activeBusiness.location.area || activeBusiness.location.city || tr('Not set')}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{tr('Destination')}</dt>
              <dd className="text-right font-medium text-slate-900">
                {destinationLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{tr('How sure we are')}</dt>
              <dd>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${confidenceStyles[basePlan.confidence]}`}>
                  {tr(basePlan.confidence)}
                </span>
              </dd>
            </div>
          </dl>
          <p className="border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-600">
            {tr(basePlan.confidenceReason)}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-slate-500" aria-hidden="true" />
              {tr('Suggested budget split')}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{tr(basePlan.rationale)}</p>
          </div>
          <button
            type="button"
            onClick={resetAllocation}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {tr('Use the suggestion')}
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(scenarioCopy) as PlanScenario[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setScenario(item)}
              aria-pressed={scenario === item}
              className={`rounded-xl border p-3 text-left transition-colors ${
                scenario === item
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="block text-sm font-semibold text-slate-900">{tr(scenarioCopy[item].label)}</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                {tr(scenarioCopy[item].description)}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {editedAllocations.map((allocation) => (
            <div key={allocation.provider} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{tr(allocation.label)}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {tr('{percentage}% of plan', { percentage: allocation.percentage })}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${confidenceStyles[allocation.confidence]}`}>
                      {tr('{confidence} confidence', { confidence: tr(allocation.confidence) })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{tr(allocation.role)}</p>
                </div>
                <div className="w-full sm:w-40">
                  <label htmlFor={`amount-${allocation.provider}`} className="mb-1 block text-xs font-medium text-slate-500">
                    {tr('Amount (₹)')}
                  </label>
                  <input
                    id={`amount-${allocation.provider}`}
                    type="number"
                    min="0"
                    step="100"
                    value={allocation.amount}
                    onChange={(event) =>
                      setAmounts((previous) => ({
                        ...previous,
                        [allocation.provider]: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="font-medium text-slate-800">{tr('What to watch')}</p>
                  <p className="mt-0.5 leading-relaxed">{tr(allocation.measurementSignal)}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{tr('What could go wrong')}</p>
                  <p className="mt-0.5 leading-relaxed">{tr(allocation.risk)}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{tr('Smallest useful budget')}</p>
                  <p className="mt-0.5 leading-relaxed">
                    {allocation.minimumViableSpend > 0
                      ? tr('{amount} per month', { amount: formatINR(allocation.minimumViableSpend) })
                      : tr('No paid minimum')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
          isBalanced ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-amber-200 bg-amber-50 text-amber-950'
        }`}>
          <span className="inline-flex items-center gap-2 font-medium">
            {isBalanced ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
            {isBalanced
              ? tr('{amount} split across {count} places.', {
                  amount: formatINR(allocatedTotal),
                  count: editedAllocations.length,
                })
              : tr('{amount} of {budget} used. Change the amounts so they add up to your budget.', {
                  amount: formatINR(allocatedTotal),
                  budget: formatINR(budget),
                })}
          </span>
          <span className="text-xs">{tr('Nothing is charged here.')}</span>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{tr('What this plan assumes')}</h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
              {basePlan.assumptions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                  {tr(item)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{tr('When to change this plan')}</h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
              {basePlan.changeTriggers.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                  {tr(item)}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900">{tr('Things to watch out for')}</h3>
            <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-slate-600 sm:grid-cols-2">
              {basePlan.risks.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                  {tr(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="max-w-xl text-xs leading-relaxed text-slate-500">
            {tr('Approving only confirms the budget split. It does not publish an ad, connect an account or spend money.')}
          </p>
          <div className="flex flex-wrap gap-2">
            {!isApproved ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={!isBalanced}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {tr('Approve this budget split')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateCampaign}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {tr('Create an ad plan from this')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {isApproved && approvedPlan?.approvedAt && (
          <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {tr('Approved on {date}. No budget has been charged.', {
              date: new Date(approvedPlan.approvedAt).toLocaleString('en-IN'),
            })}
          </p>
        )}
      </section>
    </div>
  );
};
