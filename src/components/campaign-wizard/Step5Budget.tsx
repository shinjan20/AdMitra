import React, { useState, useEffect } from 'react';
import { CampaignObjective } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { addDays, toISODateOnly, formatDate } from '../../utils/date';
import {
  IndianRupee,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
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
  const { activeBusiness } = useApp();

  const [budget, setBudget] = useState(totalBudget || 5000);
  const [duration, setDuration] = useState(durationDays || 10);
  const [start, setStart] = useState(startDate || toISODateOnly(new Date()));
  const [validationError, setValidationError] = useState<string | null>(null);

  const dailyBudget = Math.round(budget / Math.max(1, duration));
  const calculatedEndDate = addDays(new Date(start), duration);

  // Sync to parent
  useEffect(() => {
    if (budget < 1000) {
      setValidationError('Minimum recommended campaign budget is ₹1,000');
    } else if (duration < 3) {
      setValidationError('Minimum campaign duration is 3 days to allow ad learning');
    } else {
      setValidationError(null);
      onUpdateBudget(budget, duration, start);
    }
  }, [budget, duration, start]);

  const presetPackages = [
    {
      id: 'starter',
      name: 'Starter Trial',
      badge: 'Low Risk',
      total: 2500,
      days: 5,
      description: 'Ideal to test ad messaging and get your first batch of inquiries.',
    },
    {
      id: 'growth',
      name: 'Growth Push',
      badge: 'Recommended',
      total: 5000,
      days: 10,
      description: 'Optimal balance of learning and steady daily customer inquiries.',
    },
    {
      id: 'scale',
      name: 'Maximum Reach',
      badge: 'Best Value',
      total: 10000,
      days: 14,
      description: 'Dominates local search and feeds across your entire neighborhood.',
    },
  ];

  // Projected outcomes based on objective & budget
  const getProjectedOutcomes = () => {
    if (objective === 'messages') {
      const lower = Math.round(budget / 160);
      const upper = Math.round(budget / 100);
      return {
        metric: 'WhatsApp Conversations',
        range: `${lower} - ${upper} direct customer chats`,
        estCost: `~₹${Math.round(budget / ((lower + upper) / 2))} per conversation`,
      };
    } else if (objective === 'leads') {
      const lower = Math.round(budget / 280);
      const upper = Math.round(budget / 180);
      return {
        metric: 'Direct Customer Leads',
        range: `${lower} - ${upper} verified phone enquiries`,
        estCost: `~₹${Math.round(budget / ((lower + upper) / 2))} per lead`,
      };
    } else {
      const impressions = Math.round(budget * 8.5);
      const reach = Math.round(impressions * 0.78);
      return {
        metric: 'Total Local Impressions',
        range: `${(reach / 1000).toFixed(1)}k - ${(impressions / 1000).toFixed(1)}k views`,
        estCost: '~₹120 per 1,000 views',
      };
    }
  };

  const projections = getProjectedOutcomes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
            Step 5 of 6
          </span>
          <span className="text-xs text-slate-500 font-medium">Budget & Schedule Planner</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
          How much would you like to invest?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Clear, transparent spending in Indian Rupees (₹). No hidden fees or surprise billings.
        </p>
      </div>

      {/* Preset Packages */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Suggested Budget Packages
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {presetPackages.map((pkg) => {
            const isSelected = budget === pkg.total && duration === pkg.days;
            return (
              <div
                key={pkg.id}
                onClick={() => {
                  setBudget(pkg.total);
                  setDuration(pkg.days);
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{pkg.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.id === 'growth'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pkg.badge}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {formatINR(pkg.total)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {pkg.days} days • {formatINR(Math.round(pkg.total / pkg.days))}/day
                </p>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  {pkg.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Custom Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
              Custom Budget & Duration
            </span>

            {/* Total Budget Input */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Total Campaign Budget (₹)</span>
                <span className="text-blue-600 font-bold">{formatINR(budget)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Campaign Duration</span>
                <span className="text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
                  {duration} Days
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Quick Sprint (3 days)</span>
                <span>Full Month (30 days)</span>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date
              </label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Runs through: <strong>{formatDate(calculatedEndDate.toISOString())}</strong>
              </p>
            </div>

            {validationError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {validationError}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown & Outcomes Projection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Projected Outcomes
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                High Confidence
              </span>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 space-y-1">
              <p className="text-[11px] text-blue-800 font-semibold uppercase tracking-wide">
                Expected {projections.metric}
              </p>
              <p className="text-base font-extrabold text-blue-950">{projections.range}</p>
              <p className="text-[10px] text-blue-700 font-medium pt-0.5">{projections.estCost}</p>
            </div>

            {/* Daily Breakdown Math */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Total Expenditure:</span>
                <span className="font-bold text-slate-900">{formatINR(budget)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Duration:</span>
                <span className="font-bold text-slate-900">{duration} Days</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Daily Spend:</span>
                <span className="font-bold text-blue-600">{formatINR(dailyBudget)} / day</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 text-[11px] text-slate-600 leading-relaxed">
              <strong>Zero Risk Protection:</strong> In this MVP prototype, campaign launch is simulated so you can verify the workflow and test creative engagement safely.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Audience
        </button>

        <button
          onClick={onNext}
          disabled={Boolean(validationError)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow disabled:opacity-50"
        >
          Confirm Budget & Next: Review
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

