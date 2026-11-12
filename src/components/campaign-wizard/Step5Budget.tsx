import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, IndianRupee, Info } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { CampaignObjective } from '../../types';
import { useApp } from '../../context/AppContext';
import { BudgetEngine } from '../../services/budgetEngine';

interface Step5BudgetProps {
  objective: CampaignObjective;
  totalBudget: number;
  durationDays: number;
  startDate: string;
  onUpdateBudget: (budget: number, duration: number, start: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const budgetOptions = [
  { name: 'Try it out', total: 2500, days: 5 },
  { name: 'A little longer', total: 5000, days: 10 },
  { name: 'More time', total: 10000, days: 14 },
];

export const Step5Budget: React.FC<Step5BudgetProps> = ({
  objective,
  totalBudget,
  durationDays,
  startDate,
  onUpdateBudget,
  onNext,
  onBack,
}) => {
  const { activeBusiness, tr } = useApp();
  const [budget, setBudget] = useState(totalBudget || 5000);
  const [duration, setDuration] = useState(durationDays || 10);
  const validationError = budget < 1000
    ? tr('Choose at least ₹1,000 for this sample.')
    : duration < 3
      ? tr('Choose at least 3 days.')
      : '';
  const dailyAmount = Math.round(budget / Math.max(1, duration));
  const draftPlan = BudgetEngine.buildPlan({
    business: activeBusiness,
    objective,
    budget,
    durationDays: duration,
  });
  const monthlyBudget = draftPlan.monthlyBudget;
  const budgetTooSmall = monthlyBudget > 0 && monthlyBudget < 5000;

  const handleNext = () => {
    if (validationError) return;
    onUpdateBudget(budget, duration, startDate);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {tr('Choose a sample budget')}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tr('These amounts are examples only. No money is spent.')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {budgetOptions.map((option) => {
          const isSelected = budget === option.total && duration === option.days;
          return (
            <button
              key={option.total}
              type="button"
              onClick={() => {
                setBudget(option.total);
                setDuration(option.days);
              }}
              aria-pressed={isSelected}
              className={`min-h-24 rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <span className="block text-sm font-medium text-slate-600">{tr(option.name)}</span>
              <span className="mt-1 block text-xl font-semibold text-slate-900">
                {formatINR(option.total)}
              </span>
              <span className="mt-1 block text-sm text-slate-500">{tr('For {days} days', { days: option.days })}</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-xl space-y-5 border-t border-slate-100 pt-5">
        <h3 className="text-sm font-semibold text-slate-800">{tr('Or choose your own')}</h3>
        <div>
          <label htmlFor="sample-budget" className="mb-1.5 block text-sm font-medium text-slate-700">
            {tr('Total amount')}
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              id="sample-budget"
              type="number"
              min="1000"
              step="500"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
              className="min-h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="sample-duration" className="text-sm font-medium text-slate-700">
              {tr('Number of days')}
            </label>
            <span className="text-sm font-semibold text-slate-900">{tr('{days} days', { days: duration })}</span>
          </div>
          <input
            id="sample-duration"
            type="range"
            min="3"
            max="60"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            className="h-6 w-full cursor-pointer accent-slate-900"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{tr('3 days')}</span>
            <span>{tr('60 days')}</span>
          </div>
        </div>

        {validationError && (
          <p role="alert" className="text-sm text-rose-700">{validationError}</p>
        )}

        <div className="border-t border-slate-100 pt-4 text-sm text-slate-600">
          <p>
            {tr('Example: {amount} over {days} days is about {daily} a day.', {
              amount: formatINR(budget),
              days: duration,
              daily: formatINR(dailyAmount),
            })}
          </p>
          <p className="mt-1 text-xs text-slate-500">{tr('This is only a planning example, not a real charge.')}</p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">{tr('What this budget could support')}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {tr('A starting guess, not a promise.')} {tr(draftPlan.confidenceReason)}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {draftPlan.allocations.map((allocation) => (
              <div key={allocation.provider} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{tr(allocation.label)}</span>
                  <span className="text-sm font-semibold text-slate-900">{formatINR(allocation.amount)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{tr(allocation.role)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {tr('Suggest about {amount} per month for a comfortable test.', { amount: formatINR(allocation.minimumViableSpend) })}
                </p>
              </div>
            ))}
          </div>
          {budgetTooSmall && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {tr('This is below a comfortable learning budget for two channels. The plan concentrates spend on one channel instead of fragmenting it.')}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tr('Back')}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={Boolean(validationError)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tr('Review your ad')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
