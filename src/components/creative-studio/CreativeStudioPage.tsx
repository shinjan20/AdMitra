import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIEngine } from '../../services/aiEngine';
import { CreativeVariation, CTAType } from '../../types';
import {
  Palette,
  Sparkles,
  RotateCw,
  Copy,
  Check,
  Smartphone,
  MessageCircle,
  PlusCircle,
  Edit2,
  ShieldAlert,
} from 'lucide-react';

export const CreativeStudioPage: React.FC = () => {
  const { activeBusiness, updateActiveDraft, navigateTo, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [objective, setObjective] = useState<'messages' | 'leads' | 'awareness'>('messages');
  const [variations, setVariations] = useState<CreativeVariation[]>([]);
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate on user click
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const vars = await AIEngine.generateCreatives({
        business: activeBusiness,
        objective,
      });
      setVariations(vars);
      setSelectedVarIndex(0);
      showToast({
        type: 'success',
        title: 'Creatives Generated',
        message: `Created 3 copy variations for ${activeBusiness.category}.`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast({
      type: 'info',
      title: 'Copied to Clipboard',
    });
  };

  const handleUseInCampaign = (v: CreativeVariation) => {
    updateActiveDraft({
      businessId: activeBusiness.id,
      objective,
      creative: {
        id: `cr-${Date.now()}`,
        campaignId: '',
        headline: v.headline,
        description: v.description,
        cta: v.cta,
        imageUrl: v.imageUrl,
        approvalStatus: 'approved',
        variations,
        isAIGenerated: true,
        createdAt: new Date().toISOString(),
      },
    });

    navigateTo('create-campaign');
  };

  const selected = variations[selectedVarIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Palette className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              AI Creative Lab
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Ad Copy & Visual Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test and generate compelling ads for {activeBusiness.businessName} without hiring an agency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
          >
            <option value="messages">WhatsApp Chat Focus</option>
            <option value="leads">Lead Form Enquiries</option>
            <option value="awareness">Local Brand Awareness</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Crafting Copy...' : 'Generate Creatives'}
          </button>
        </div>
      </div>

      {variations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              Generate High-Converting Ad Copy in Seconds
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Our AI analyzes your business description, city ({activeBusiness.location.city}), and
              audience to write headlines, taglines, and CTAs that convert.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Variations Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Variations List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generated Variations ({variations.length})
              </span>
              <button
                onClick={handleGenerate}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="space-y-3">
              {variations.map((v, idx) => {
                const isSelected = selectedVarIndex === idx;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVarIndex(idx)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {v.badgeText || `Variation ${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(`${v.headline}\n\n${v.description}`, v.id);
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
                        >
                          {copiedId === v.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseInCampaign(v);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <PlusCircle className="w-3 h-3" />
                          Use in Campaign
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{v.headline}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{v.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        CTA: {v.cta}
                      </span>
                      {v.primaryBenefit && (
                        <span className="text-[11px] text-slate-500">{v.primaryBenefit}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Phone Mockup (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Active Mockup Preview
            </span>

            {selected && (
              <div className="bg-slate-900 rounded-3xl p-3 shadow-xl max-w-sm mx-auto border-4 border-slate-800">
                <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-2" />
                <div className="bg-white rounded-2xl overflow-hidden shadow-inner">
                  {/* Account Header */}
                  <div className="p-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {activeBusiness.businessName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {activeBusiness.businessName}
                        </p>
                        <p className="text-[10px] text-slate-400">Sponsored • {activeBusiness.location.city}</p>
                      </div>
                    </div>
                  </div>

                  <img
                    src={selected.imageUrl}
                    alt="Creative Preview"
                    className="w-full aspect-square object-cover"
                  />

                  <div className="px-3 py-2 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{selected.headline}</p>
                      <p className="text-[10px] text-slate-500">{activeBusiness.websiteUrl || 'Instant Chat'}</p>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg whitespace-nowrap">
                      {selected.cta}
                    </button>
                  </div>

                  <div className="p-3 text-xs text-slate-800 space-y-1">
                    <p className="leading-relaxed">
                      <strong>{activeBusiness.businessName} </strong>
                      {selected.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

