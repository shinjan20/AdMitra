import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DailyMetricPoint, CampaignObjective } from '../../types';
import { formatINR } from '../../utils/currency';
import { useApp } from '../../context/AppContext';

interface PerformanceChartProps {
  data: DailyMetricPoint[];
  objective: CampaignObjective;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, objective }) => {
  const { tr } = useApp();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
        {tr('No metric data points recorded yet.')}
      </div>
    );
  }

  // Format dates to short "10 Nov"
  const chartData = data.map((d) => {
    const parts = d.date.split('-');
    const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.date;
    return {
      ...d,
      shortDate,
      outcomes: objective === 'messages' ? d.messages : objective === 'leads' ? d.leads : d.clicks,
    };
  });

  const outcomeLabel =
    objective === 'messages' ? tr('WhatsApp Chats') : objective === 'leads' ? tr('Leads') : tr('Clicks');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700 uppercase tracking-wider">
          {tr('Daily Spend vs. {metric}', { metric: outcomeLabel })}
        </span>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            {tr('Spend (₹)')}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {outcomeLabel}
          </span>
        </div>
      </div>

      <div className="h-64 w-full bg-white rounded-xl pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#334155" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#334155" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOutcomes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="shortDate"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              yAxisId="spendAxis"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <YAxis
              yAxisId="outcomeAxis"
              orientation="right"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const spendVal = payload[0]?.value;
                  const outcomeVal = payload[1]?.value;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl space-y-1">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="text-slate-300 font-semibold">
                        {tr('Daily Spend:')} {formatINR(Number(spendVal))}
                      </p>
                      <p className="text-emerald-400 font-semibold">
                        {outcomeLabel}: {outcomeVal}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              yAxisId="spendAxis"
              type="monotone"
              dataKey="spend"
              stroke="#334155"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSpend)"
            />
            <Area
              yAxisId="outcomeAxis"
              type="monotone"
              dataKey="outcomes"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOutcomes)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {tr('Daily {metric}', { metric: outcomeLabel })}
          </div>
          <div className="h-48 w-full bg-white rounded-xl pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={Math.ceil(chartData.length / 6)}
                />
                <YAxis
                  yAxisId="outcomeAxis"
                  orientation="right"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDataOverflow
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0]?.value;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl space-y-1">
                          <p className="font-bold text-slate-300">{label}</p>
                          <p className="text-emerald-400 font-semibold">
                            {outcomeLabel}: {value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  yAxisId="outcomeAxis"
                  dataKey="outcomes"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

