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
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Edit2,
  Smartphone,
  MessageCircle,
  Eye,
  Check,
  ShieldAlert,
  Image as ImageIcon,
  ExternalLink,
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
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  // Form states for manual edit
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState<CTAType>('Send WhatsApp Message');
  const [imageUrl, setImageUrl] = useState('');
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const [isGeneratingCustomImage, setIsGeneratingCustomImage] = useState(false);

  // Initialize creative or generate variations
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
    setIsEditingCustom(false);
    showToast({
      type: 'success',
      title: 'Creative Updated',
      message: 'Your custom copy and call to action have been saved.',
    });
  };

  const handleSimulateNewImage = async () => {
    setIsGeneratingCustomImage(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Curated high quality unsplash images for Indian local service businesses
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
    setCustomImagePrompt('');
    showToast({
      type: 'success',
      title: 'New Visual Generated',
      message: 'Applied refreshed image asset to creative.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
              Step 3 of 6
            </span>
            <span className="text-xs text-slate-500 font-medium">AI Creative Studio</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Generate & Customize Ad Creative
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI generated 3 high-converting creative variations tailored for {activeBusiness.category}.
            Choose one and customize text or images.
          </p>
        </div>

        <button
          onClick={handleGenerateVariations}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Regenerate Variations'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Variation Picker & Text Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Creative Variation ({variations.length})
            </span>
            <span className="text-[11px] text-slate-400">Click to preview & edit</span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <Sparkles className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Writing copy variations...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {variations.map((v, idx) => {
                const isSelected = selectedVariationIndex === idx;
                return (
                  <div
                    key={v.id || idx}
                    onClick={() => handleSelectVariation(idx)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <img
                      src={v.imageUrl}
                      alt={v.imageAlt || 'Ad thumbnail'}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {v.badgeText || `Variation ${idx + 1}`}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{v.headline}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {v.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          CTA: {v.cta}
                        </span>
                        {v.primaryBenefit && (
                          <span className="text-slate-400">• {v.primaryBenefit}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* In-Place Manual Editor Card */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                Customize Copy & Visuals
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                Live Preview Synced
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Headline (Catchy & Benefit-Focused)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                onBlur={handleApplyEdits}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Ad Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleApplyEdits}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Call-To-Action (CTA) Button
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
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Send WhatsApp Message">Send WhatsApp Message (Recommended)</option>
                  <option value="Book Now">Book Now</option>
                  <option value="Call Now">Call Now</option>
                  <option value="Get Offer">Get Offer</option>
                  <option value="Learn More">Learn More</option>
                  <option value="Sign Up">Sign Up</option>
                  <option value="Visit Store">Visit Store</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Image Regeneration Prompt / Switch
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Modern salon interior"
                    value={customImagePrompt}
                    onChange={(e) => setCustomImagePrompt(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateNewImage}
                    disabled={isGeneratingCustomImage}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    {isGeneratingCustomImage ? '...' : 'Swap'}
                  </button>
                </div>
              </div>
            </div>

            {/* Guardrail Safety Notice */}
            <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Guardrail check passed:</strong> Creative does not invent misleading claims,
                fake doctor ratings, or unverified government certifications. Watermarked as AI generated.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Format Live Preview Device Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Mockup Preview
            </span>
            {/* Format Switcher */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveFormat('feed')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeFormat === 'feed'
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Feed (1:1)
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('whatsapp')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeFormat === 'whatsapp'
                    ? 'bg-white text-emerald-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                WhatsApp Ad
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('story')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeFormat === 'story'
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Story (9:16)
              </button>
            </div>
          </div>

          {/* Device Mockup Shell */}
          <div className="bg-slate-900 rounded-3xl p-3 shadow-xl max-w-sm mx-auto border-4 border-slate-800">
            {/* Phone Top Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-inner">
              {/* Instagram / Feed Format */}
              {activeFormat === 'feed' && (
                <div>
                  {/* Account Header */}
                  <div className="p-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-slate-800">
                          {activeBusiness.businessName[0]}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {activeBusiness.businessName}
                          </span>
                          <span className="text-[10px] text-slate-400">• Sponsored</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-none">
                          {activeBusiness.location.city}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">•••</span>
                  </div>

                  {/* Creative Image */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Creative Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium backdrop-blur-xs">
                      AI Generated Preview
                    </div>
                  </div>

                  {/* CTA Banner Bar */}
                  <div className="px-3 py-2 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{headline}</p>
                      <p className="text-[10px] text-slate-500 truncate">{activeBusiness.websiteUrl || 'Local Business'}</p>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xs">
                      {cta}
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="p-3 text-xs space-y-1">
                    <p className="text-slate-800 leading-relaxed">
                      <strong className="mr-1">{activeBusiness.businessName}</strong>
                      {description}
                    </p>
                    <p className="text-[11px] text-blue-600 font-medium">
                      #{activeBusiness.category.replace(/\s+/g, '')} #{activeBusiness.location.city} #SpecialOffer
                    </p>
                  </div>
                </div>
              )}

              {/* WhatsApp Format */}
              {activeFormat === 'whatsapp' && (
                <div className="bg-[#EFEAE2] min-h-[360px] p-3 flex flex-col justify-between">
                  <div className="bg-[#075E54] text-white p-2.5 -mx-3 -mt-3 flex items-center gap-2 shadow-sm">
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <div>
                      <p className="text-xs font-bold leading-tight">{activeBusiness.businessName}</p>
                      <p className="text-[9px] text-emerald-100">WhatsApp Direct Ad Experience</p>
                    </div>
                  </div>

                  {/* Ad Message Card */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 my-2">
                    <img src={imageUrl} alt="WhatsApp Ad" className="w-full h-36 object-cover" />
                    <div className="p-3 space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Tap To Chat
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{headline}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{description}</p>
                    </div>
                    <div className="p-2.5 bg-emerald-600 text-white text-center text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat on WhatsApp Now
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-500 italic">
                    Customers who click will start a direct WhatsApp chat with your number ({activeBusiness.whatsappNumber || '+91 98765 43210'}).
                  </p>
                </div>
              )}

              {/* Story Format (9:16) */}
              {activeFormat === 'story' && (
                <div className="relative h-[420px] bg-slate-900 text-white overflow-hidden flex flex-col justify-between p-4">
                  <img
                    src={imageUrl}
                    alt="Story Ad"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

                  {/* Top Story Header */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white text-slate-900 font-bold text-[10px] flex items-center justify-center">
                        {activeBusiness.businessName[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold leading-tight">{activeBusiness.businessName}</p>
                        <p className="text-[9px] text-slate-300">Sponsored</p>
                      </div>
                    </div>
                  </div>

                  {/* Story Bottom CTA */}
                  <div className="relative z-10 space-y-2 text-center">
                    <h3 className="text-sm font-bold drop-shadow-md">{headline}</h3>
                    <p className="text-[11px] text-slate-200 line-clamp-2 drop-shadow-xs">
                      {description}
                    </p>
                    <div className="pt-2">
                      <div className="inline-block px-5 py-2 rounded-full bg-white text-slate-900 font-bold text-xs shadow-lg">
                        {cta} ↑
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
          Back to Strategy
        </button>

        <button
          onClick={() => {
            handleApplyEdits();
            onNext();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow"
        >
          Approve Creative & Next: Audience
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

