import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../../services/supabaseClient';
import { StorageService } from '../../services/storage';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import {
  Settings,
  Database,
  Key,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Award,
  TrendingUp,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, resetAllData, showToast, campaigns } = useApp();
  const [apiKey, setApiKey] = useState(settings.openAIApiKey || '');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleSaveApiKey = () => {
    StorageService.saveSettings({
      ...settings,
      openAIApiKey: apiKey.trim(),
      useLiveAI: Boolean(apiKey.trim()),
    });
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: apiKey.trim()
        ? 'AI Provider key registered for live text generation.'
        : 'Reverted to smart built-in local engine.',
    });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    showToast({
      type: 'info',
      title: 'SQL Schema Copied',
      message: 'Paste into Supabase SQL Editor to initialize tables.',
    });
  };

  // Funnel calculations from PRD Section 7
  const events = StorageService.getFunnelEvents();
  const totalLaunches = events.filter((e) => e.eventName === 'campaign_launch_confirmed').length;
  const totalDrafts = events.filter((e) => e.eventName === 'campaign_goal_selected').length;
  const launchRate = totalDrafts > 0 ? Math.round((totalLaunches / totalDrafts) * 100) : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Settings className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Configuration
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
          Settings & Architecture Controls
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage demo simulation, API keys, database integration, and funnel metrics.
        </p>
      </div>

      <DemoNoticeBadge />

      {/* KPI North Star Health Card */}
      <div className="p-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-blue-800">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            North Star Metric: Weekly Value-Generating Advertisers (WVGA)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
            PRD Section 7
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <p className="text-[11px] text-blue-200">Active Advertisers</p>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">1 Business (Active)</h3>
            <p className="text-[10px] text-blue-300">Aura Bridal Studio & Luxury Salon</p>
          </div>
          <div>
            <p className="text-[11px] text-blue-200">Campaign Launch Rate</p>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{launchRate}%</h3>
            <p className="text-[10px] text-emerald-400">Target ≥ 50% met</p>
          </div>
          <div>
            <p className="text-[11px] text-blue-200">Total Live Demo Ads</p>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">
              {campaigns.filter((c) => c.status === 'active').length}
            </h3>
            <p className="text-[10px] text-blue-300">Delivering simulated inquiries</p>
          </div>
        </div>
      </div>

      {/* Database & Supabase Integration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database & Backend Layer</h3>
              <p className="text-[11px] text-slate-500">
                PostgreSQL schema with Supabase Row Level Security (RLS)
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Storage Mode (Active)'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          CampaignPilot is fully self-contained using browser-persisted LocalStorage with full CRUD
          support. To link your live Supabase cloud database, provide <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> in your environment.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSql(!showSql)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            {showSql ? 'Hide SQL Schema' : 'View Supabase SQL Schema (7 Tables)'}
          </button>
          <button
            onClick={handleCopySchema}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy SQL Schema
          </button>
        </div>

        {showSql && (
          <pre className="p-3 bg-slate-900 text-slate-200 text-[11px] rounded-xl overflow-x-auto max-h-64 font-mono leading-relaxed">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        )}
      </div>

      {/* AI Key Configuration (Optional) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Key className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Provider Key (Optional)</h3>
            <p className="text-[11px] text-slate-500">
              Built-in intelligent rule engine runs 100% offline. Optionally connect OpenAI API key for custom prompt completions.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            OpenAI API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset Seed Data */}
      <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-rose-600" />
          Reset Demo Data
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Restore default Indian SMB sample businesses (Aura Bridal Studio, Apex Coaching, Saffron & Spice Restaurant) and baseline campaigns.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to factory seed?')) {
              resetAllData();
            }
          }}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
        >
          Reset All Data to Default Seed
        </button>
      </div>
    </div>
  );
};

