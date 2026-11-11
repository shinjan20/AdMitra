import React, { useState, useEffect } from 'react';
import {
  CampaignObjective,
  Creative,
  CreativeVariation,
  CTAType,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { AIEngine } from '../../services/aiEngine';
import {
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Check,
  Edit2,
  Image as ImageIcon,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

interface Step3CreativeProps {
  objective: CampaignObjective;
  creative: Creative | null;
  onUpdateCreative: (cr: Creative) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Creative: React.FC<Step3CreativeProps> = ({
  objective,
  creative,
  onUpdateCreative,
  onNext,
  onBack,
}) => {
  const { activeBusiness, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<CreativeVariation[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);
  const [activeFormat, setActiveFormat] = useState<'feed' | 'whatsapp' | 'story'>('feed');

  // Form states
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState<CTAType>('Send WhatsApp Message');
  const [imageUrl, setImageUrl] = useState('');
  const [isGeneratingCustomImage, setIsGeneratingCustomImage] = useState(false);

  useEffect(() => {
    if (creative && creative.headline) {
      setHeadline(creative.headline);
      setDescription(creative.description);
      setCta(creative.cta);
      setImageUrl(creative.imageUrl);
      if (creative.variations && creative.variations.length > 0) {
        setVariations(creative.variations);
      } else {
        handleGenerateVariations();
      }
    } else {
      handleGenerateVariations();
    }
  }, [activeBusiness, objective]);

  const handleGenerateVariations = async () => {
    setLoading(true);
    try {
      const vars = await AIEngine.generateCreatives({
        business: activeBusiness,
        objective,
      });
      setVariations(vars);
      if (vars.length > 0) {
        const first = vars[0];
        setHeadline(first.headline);
        setDescription(first.description);
        setCta(first.cta);
        setImageUrl(first.imageUrl);
        setSelectedVariationIndex(0);

        onUpdateCreative({
          id: creative?.id || `cr-${Date.now()}`,
          campaignId: creative?.campaignId || '',
          headline: first.headline,
          description: first.description,
          cta: first.cta,
          imageUrl: first.imageUrl,
          approvalStatus: 'approved',
          variations: vars,
          isAIGenerated: true,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariation = (index: number) => {
    setSelectedVariationIndex(index);
    const selected = variations[index];
    if (selected) {
      setHeadline(selected.headline);
      setDescription(selected.description);
      setCta(selected.cta);
      setImageUrl(selected.imageUrl);

      onUpdateCreative({
        id: creative?.id || `cr-${Date.now()}`,
        campaignId: creative?.campaignId || '',
        headline: selected.headline,
        description: selected.description,
        cta: selected.cta,
        imageUrl: selected.imageUrl,
        approvalStatus: 'approved',
        variations,
        isAIGenerated: true,
        createdAt: creative?.createdAt || new Date().toISOString(),
      });
    }
  };

  const handleApplyEdits = () => {
    onUpdateCreative({
      id: creative?.id || `cr-${Date.now()}`,
      campaignId: creative?.campaignId || '',
      headline,
      description,
      cta,
      imageUrl,
      approvalStatus: 'approved',
      variations,
      isAIGenerated: true,
      createdAt: creative?.createdAt || new Date().toISOString(),
    });
  };

  const handleSwapImage = async () => {
    setIsGeneratingCustomImage(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const samplePool = [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    ];

    const nextImage = samplePool[Math.floor(Math.random() * samplePool.length)];
    setImageUrl(nextImage);
    setIsGeneratingCustomImage(false);
    showToast({
      type: 'info',
      title: 'Image Swapped',
      message: 'Updated visual preview.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
            Ad Creative & Message
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a copy variation below and customize any text or call to action.
          </p>
        </div>

        <button
          onClick={handleGenerateVariations}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Writing...' : 'Regenerate'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Variations & In-Place Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Suggested Variations
          </span>

          {loading ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-xs text-slate-500">Writing copy variations...</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {variations.map((v, idx) => {
                const isSelected = selectedVariationIndex === idx;
                return (
                  <div
                    key={v.id || idx}
                    onClick={() => handleSelectVariation(idx)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={v.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-medium text-slate-400">
                          {v.badgeText || `Option ${idx + 1}`}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-medium text-slate-900 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{v.headline}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {v.description}
                      </p>
                      <span className="inline-block text-[10px] text-slate-500 mt-1 font-medium">
                        CTA: {v.cta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Minimalist In-Place Editor */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Edit2 className="w-3 h-3 text-slate-500" />
                Customize Copy
              </span>
              <button
                type="button"
                onClick={handleSwapImage}
                disabled={isGeneratingCustomImage}
                className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3" />
                {isGeneratingCustomImage ? 'Swapping...' : 'Swap Image Asset'}
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                onBlur={handleApplyEdits}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleApplyEdits}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Call-To-Action (CTA)
              </label>
              <select
                value={cta}
                onChange={(e) => {
                  const newCta = e.target.value as CTAType;
                  setCta(newCta);
                  onUpdateCreative({
                    id: creative?.id || `cr-${Date.now()}`,
                    campaignId: creative?.campaignId || '',
                    headline,
                    description,
                    cta: newCta,
                    imageUrl,
                    approvalStatus: 'approved',
                    variations,
                    isAIGenerated: true,
                    createdAt: creative?.createdAt || new Date().toISOString(),
                  });
                }}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-medium"
              >
                <option value="Send WhatsApp Message">Send WhatsApp Message (Recommended)</option>
                <option value="Book Now">Book Now</option>
                <option value="Call Now">Call Now</option>
                <option value="Get Offer">Get Offer</option>
                <option value="Learn More">Learn More</option>
              </select>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Guardrail: Text checked for verified local claims and transparency.</span>
            </div>
          </div>
        </div>

        {/* Right: Device Preview Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Preview Mockup
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveFormat('feed')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeFormat === 'feed'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Feed
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('whatsapp')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeFormat === 'whatsapp'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('story')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeFormat === 'story'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Story
              </button>
            </div>
          </div>

          {/* Minimalist Phone Shell */}
          <div className="bg-slate-900 rounded-3xl p-2.5 shadow-lg max-w-xs mx-auto border-4 border-slate-800">
            <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-2" />
            <div className="bg-white rounded-2xl overflow-hidden">
              {activeFormat === 'feed' && (
                <div>
                  <div className="p-2.5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        {activeBusiness.businessName[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-900 leading-tight">
                          {activeBusiness.businessName}
                        </p>
                        <p className="text-[9px] text-slate-400">Sponsored · {activeBusiness.location.city}</p>
                      </div>
                    </div>
                  </div>

                  <img src={imageUrl} alt="" className="w-full aspect-square object-cover" />

                  <div className="px-2.5 py-1.5 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="text-[11px] font-semibold text-slate-900 truncate">{headline}</p>
                      <p className="text-[9px] text-slate-400 truncate">{activeBusiness.websiteUrl || 'Local Business'}</p>
                    </div>
                    <button className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-medium rounded-md whitespace-nowrap">
                      {cta}
                    </button>
                  </div>

                  <div className="p-2.5 text-[11px] text-slate-700 space-y-1">
                    <p className="line-clamp-2">
                      <strong>{activeBusiness.businessName} </strong>
                      {description}
                    </p>
                  </div>
                </div>
              )}

              {activeFormat === 'whatsapp' && (
                <div className="bg-[#EFEAE2] min-h-[320px] p-2.5 flex flex-col justify-between">
                  <div className="bg-[#075E54] text-white p-2 -mx-2.5 -mt-2.5 flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <p className="text-[11px] font-semibold">{activeBusiness.businessName}</p>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200/80 my-2">
                    <img src={imageUrl} alt="" className="w-full h-32 object-cover" />
                    <div className="p-2.5 space-y-1">
                      <h4 className="text-[11px] font-semibold text-slate-900">{headline}</h4>
                      <p className="text-[10px] text-slate-600 line-clamp-2">{description}</p>
                    </div>
                    <div className="p-2 bg-emerald-600 text-white text-center text-[11px] font-medium flex items-center justify-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Chat on WhatsApp
                    </div>
                  </div>

                  <p className="text-[9px] text-center text-slate-400">
                    Customers open a direct chat with {activeBusiness.whatsappNumber || '+91 98765 43210'}.
                  </p>
                </div>
              )}

              {activeFormat === 'story' && (
                <div className="relative h-80 bg-slate-900 text-white overflow-hidden flex flex-col justify-between p-3">
                  <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                  <div className="relative z-10 text-[10px] font-semibold">
                    {activeBusiness.businessName}
                  </div>
                  <div className="relative z-10 space-y-1 text-center">
                    <h3 className="text-xs font-bold">{headline}</h3>
                    <div className="pt-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-white text-slate-900 font-semibold text-[10px]">
                        {cta}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
          onClick={() => {
            handleApplyEdits();
            onNext();
          }}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-all"
        >
          Approve Creative & Next: Audience
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
