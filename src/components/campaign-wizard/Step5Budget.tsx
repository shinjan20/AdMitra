import React, { useState, useEffect } from 'react';
import { CampaignObjective } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { addDays, toISODateOnly, formatDate } from '../../utils/date';
import {
  IndianRupee,
  Calendar,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface Step5BudgetProps {
  objective: CampaignObjective;
  totalBudget: number;
  durationDays: number;
  startDate: string;
  onUpdateBudget: (budget: number, duration: number, start: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5Budget: React.FC<Step5BudgetProps> = ({
  objective,
  totalBudget,
  durationDays,
  startDate,
  onUpdateBudget,
  onNext,
  onBack,
}) => {
  const [budget, setBudget] = useState(totalBudget || 5000);
  const [duration, setDuration] = useState(durationDays || 10);
  const [start, setStart] = useState(startDate || toISODateOnly(new Date()));
  const [validationError, setValidationError] = useState<string | null>(null);

  const dailyBudget = Math.round(budget / Math.max(1, duration));
  const calculatedEndDate = addDays(new Date(start), duration);

  useEffect(() => {
    if (budget < 1000) {
      setValidationError('Minimum recommended campaign budget is ₹1,000');
    } else if (duration < 3) {
      setValidationError('Minimum duration is 3 days');
    } else {
      setValidationError(null);
      onUpdateBudget(budget, duration, start);
    }
  }, [budget, duration, start]);

  const presetPackages = [
    {
      id: 'starter',
      name: 'Starter Trial',
      badge: 'Test Run',
      total: 2500,
      days: 5,
      description: 'Test messaging and get your first inquiries.',
    },
    {
      id: 'growth',
      name: 'Growth Push',
      badge: 'Recommended',
      total: 5000,
      days: 10,
      description: 'Steady daily inquiries and optimal ad learning.',
    },
    {
      id: 'scale',
      name: 'Maximum Reach',
      badge: 'High Impact',
      total: 10000,
      days: 14,
      description: 'Dominates local feeds across your neighborhood.',
    },
  ];

  const getProjectedOutcomes = () => {
    if (objective === 'messages') {
      const lower = Math.round(budget / 160);
      const upper = Math.round(budget / 100);
      return {
        metric: 'WhatsApp Chats',
        range: `${lower} - ${upper} direct inquiries`,
        estCost: `~₹${Math.round(budget / ((lower + upper) / 2))} per chat`,
      };
    } else if (objective === 'leads') {
      const lower = Math.round(budget / 280);
      const upper = Math.round(budget / 180);
      return {
        metric: 'Customer Leads',
        range: `${lower} - ${upper} phone inquiries`,
        estCost: `~₹${Math.round(budget / ((lower + upper) / 2))} per lead`,
      };
    } else {
      const impressions = Math.round(budget * 8.5);
      const reach = Math.round(impressions * 0.78);
      return {
        metric: 'Local Impressions',
        range: `${(reach / 1000).toFixed(1)}k - ${(impressions / 1000).toFixed(1)}k views`,
        estCost: '~₹120 per 1,000 views',
      };
    }
  };

  const projections = getProjectedOutcomes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          How much would you like to invest?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Transparent spending in Indian Rupees (₹). No hidden fees.
        </p>
      </div>

      {/* Preset Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presetPackages.map((pkg) => {
          const isSelected = budget === pkg.total && duration === pkg.days;
          return (
            <div
              key={pkg.id}
              onClick={() => {
                setBudget(pkg.total);
                setDuration(pkg.days);
              }}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-50/70 shadow-2xs ring-1 ring-slate-900'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-900">{pkg.name}</span>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                  {pkg.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {formatINR(pkg.total)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {pkg.days} days · {formatINR(Math.round(pkg.total / pkg.days))}/day
              </p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {pkg.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Custom Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
              Custom Budget & Schedule
            </span>

            {/* Total Budget */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Total Budget (₹)</span>
                <span className="text-slate-900 font-semibold">{formatINR(budget)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-medium text-xs">₹</span>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Campaign Duration</span>
                <span className="text-slate-900 font-semibold px-2 py-0.5 bg-slate-100 rounded">
                  {duration} Days
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3 days</span>
                <span>30 days</span>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date
              </label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ends on: <strong className="text-slate-700">{formatDate(calculatedEndDate.toISOString())}</strong>
              </p>
            </div>

            {validationError && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {validationError}
              </div>
            )}
          </div>
        </div>

        {/* Projected Outcomes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block pb-2 border-b border-slate-100">
              Expected Outcomes
            </span>

            <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-medium">
                Expected {projections.metric}
              </span>
              <p className="text-base font-bold text-slate-900">{projections.range}</p>
              <p className="text-[10px] text-slate-500">{projections.estCost}</p>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                <span>Total Spend:</span>
                <span className="font-semibold text-slate-900">{formatINR(budget)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                <span>Duration:</span>
                <span className="font-semibold text-slate-900">{duration} Days</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Daily Spend:</span>
                <span className="font-semibold text-slate-900">{formatINR(dailyBudget)} / day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          disabled={Boolean(validationError)}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-all disabled:opacity-50"
        >
          Confirm Budget & Next: Review
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
