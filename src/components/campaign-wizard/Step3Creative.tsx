import React, { useState, useEffect } from 'react';
import {
  CampaignObjective,
  Creative,
  CreativeVariation,
  CTAType,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { AIEngine } from '../../services/aiEngine';
import { adImageErrorText, generateAdImage } from '../../services/adImage';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import {
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Check,
  Edit2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Step3CreativeProps {
  objective: CampaignObjective;
  creative: Creative | null;
  creativePrompt: string;
  onUpdateCreativePrompt: (prompt: string) => void;
  onUpdateCreative: (cr: Creative) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Creative: React.FC<Step3CreativeProps> = ({
  objective,
  creative,
  creativePrompt,
  onUpdateCreativePrompt,
  onUpdateCreative,
  onNext,
  onBack,
}) => {
  const { activeBusiness, showToast, tr } = useApp();
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [needsRegeneration, setNeedsRegeneration] = useState(false);
  const [variations, setVariations] = useState<CreativeVariation[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);
  const [activeFormat, setActiveFormat] = useState<'feed' | 'whatsapp' | 'story'>('feed');

  // Form states
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState<CTAType>('Send WhatsApp Message');
  const [imageUrl, setImageUrl] = useState('');
  const [isGeneratingCustomImage, setIsGeneratingCustomImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);
  const [lastGeneratedTimestamp, setLastGeneratedTimestamp] = useState<number | null>(null);

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
    setGenerationError('');
    try {
      const vars = await AIEngine.generateCreatives({
        business: activeBusiness,
        objective,
        customPrompt: creativePrompt,
      });
      setVariations(vars);
      setNeedsRegeneration(false);
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
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : tr('Please try again.');
      setGenerationError(message);
      showToast({
        type: 'error',
        title: tr('Could not generate ad copy'),
        message,
      });
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
      createdAt: creative?.createdAt || new Date().toISOString(),
    });
  };

  const handleSwapImage = async () => {
    if (isGeneratingCustomImage) return;
    setIsGeneratingCustomImage(true);
    setImageGenerationError(null);

    try {
      const result = await generateAdImage({
        businessName: activeBusiness.businessName,
        category: activeBusiness.category,
        city: activeBusiness.location.city,
        area: activeBusiness.location.area,
        offer: creativePrompt.trim() || description,
        headline,
        description,
        cta: tr(cta),
        tone: 'Friendly',
      });

      setImageUrl(result.imageDataUrl);
      setLastGeneratedTimestamp(Date.now());

      const updatedVariations = variations.map((variation, index) =>
        index === selectedVariationIndex
          ? { ...variation, imageUrl: result.imageDataUrl }
          : variation
      );
      setVariations(updatedVariations);

      onUpdateCreative({
        id: creative?.id || `cr-${Date.now()}`,
        campaignId: creative?.campaignId || '',
        headline,
        description,
        cta,
        imageUrl: result.imageDataUrl,
        approvalStatus: 'approved',
        variations: updatedVariations,
        createdAt: creative?.createdAt || new Date().toISOString(),
      });

      showToast({
        type: 'success',
        title: tr('New picture ready'),
        message: tr('Google Gemini made this picture from your ad. Check it looks like your real shop before you share it.'),
      });
    } catch (error) {
      const errorMessage = adImageErrorText(error);
      setImageGenerationError(errorMessage);
      console.error('Could not make a new picture:', error);
      
      // Show error toast with retry hint
      showToast({
        type: 'error',
        title: tr('Could not make a picture'),
        message: errorMessage + ' ' + tr('Click "Make a new picture" to try again.'),
      });
    } finally {
      setIsGeneratingCustomImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <DemoNoticeBadge />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
            {tr('Write your ad')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tr('Pick one of these ideas, then change any words you like.')}
          </p>
        </div>

        <button
          onClick={handleGenerateVariations}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? tr('Writing...') : tr('Try new ad ideas')}
        </button>
      </div>

      <details
        open={Boolean(creativePrompt)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
      >
        <summary className="cursor-pointer text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
          {tr('Add a message idea')} <span className="font-normal text-slate-500">{tr('(optional)')}</span>
        </summary>
        <div className="pt-3">
          <label
            htmlFor="wizard-creative-prompt"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            {tr('What should customers know?')}
          </label>
          <textarea
            id="wizard-creative-prompt"
            value={creativePrompt}
            onChange={(event) => {
              onUpdateCreativePrompt(event.target.value);
              setVariations([]);
              setNeedsRegeneration(true);
            }}
            rows={2}
            maxLength={500}
            placeholder={tr('For example: Mention weekend appointments or use a friendly tone.')}
            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            {tr('Write it the way you would say it to a customer.')}
          </p>
        </div>
      </details>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Variations & In-Place Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            {tr('Ad ideas')}
          </span>

          {generationError && (
            <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {generationError}{' '}
              <button type="button" onClick={handleGenerateVariations} className="font-semibold underline">
                {tr('Retry')}
              </button>
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-sm text-slate-500">{tr('Writing a few ad ideas...')}</p>
            </div>
          ) : needsRegeneration ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-sm text-slate-600">
                {tr('Your message changed. Choose “Try new ad ideas” to update these suggestions.')}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {variations.map((v, idx) => {
                const isSelected = selectedVariationIndex === idx;
                return (
                  <button
                    type="button"
                    key={v.id || idx}
                    onClick={() => handleSelectVariation(idx)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
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
                          {v.badgeText && /^Ad idea \d+$/.test(v.badgeText)
                            ? tr('Ad idea {n}', { n: idx + 1 })
                            : v.badgeText
                              ? tr(v.badgeText)
                              : tr('Option {n}', { n: idx + 1 })}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-medium text-slate-900 flex items-center gap-1">
                            <Check className="w-3 h-3" /> {tr('Selected')}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{tr(v.headline)}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {tr(v.description)}
                      </p>
                      <span className="inline-block text-[10px] text-slate-500 mt-1 font-medium">
                        {tr('Button: {cta}', { cta: tr(v.cta) })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Minimalist In-Place Editor */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Edit2 className="w-3 h-3 text-slate-500" />
                {tr('Edit your ad')}
              </span>
              <button
                type="button"
                onClick={handleSwapImage}
                disabled={isGeneratingCustomImage}
                className={`inline-flex min-h-11 items-center gap-1 rounded px-2 text-sm font-medium transition-all ${
                  imageGenerationError
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles
                  className={`h-3 w-3 ${
                    isGeneratingCustomImage
                      ? 'text-[color:var(--brand)] animate-pulse'
                      : imageGenerationError
                        ? 'text-rose-500'
                        : lastGeneratedTimestamp
                          ? 'text-emerald-500'
                          : 'text-[color:var(--brand)]'
                  }`}
                  aria-hidden="true"
                />
                {isGeneratingCustomImage
                  ? tr('Making a new picture…')
                  : imageGenerationError
                    ? tr('Try again')
                    : tr('Make a new picture')}
              </button>
            </div>

            {imageGenerationError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5">
                <p className="text-xs text-rose-700">
                  <span className="font-medium">⚠️ {tr('Picture generation issue')}</span>
                  <br />
                  {imageGenerationError}
                </p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                {tr('Main line')}
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
                {tr('Ad message')}
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
                {tr('Button text')}
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
                    createdAt: creative?.createdAt || new Date().toISOString(),
                  });
                }}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-medium"
              >
                <option value="Send WhatsApp Message">{tr('Send WhatsApp message')}</option>
                <option value="Book Now">{tr('Book Now')}</option>
                <option value="Call Now">{tr('Call Now')}</option>
                <option value="Get Offer">{tr('Get Offer')}</option>
                <option value="Learn More">{tr('Learn More')}</option>
              </select>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{tr('Check that prices, offers, and details are correct before using this ad.')}</span>
            </div>
          </div>
        </div>

        {/* Right: Device Preview Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {tr('Ad preview (sample)')}
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveFormat('feed')}
                className={`min-h-11 px-3 rounded-md transition-all ${
                  activeFormat === 'feed'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tr('Ad post')}
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('whatsapp')}
                className={`min-h-11 px-3 rounded-md transition-all ${
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
                className={`min-h-11 px-3 rounded-md transition-all ${
                  activeFormat === 'story'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tr('Story')}
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
                        <p className="text-[9px] text-slate-400">{tr('Sample ad')} · {activeBusiness.location.city}</p>
                      </div>
                    </div>
                  </div>

                  <img src={imageUrl} alt="" className="w-full aspect-square object-cover" />

                  <div className="px-2.5 py-1.5 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="text-[11px] font-semibold text-slate-900 truncate">{tr(headline)}</p>
                      <p className="text-[9px] text-slate-400 truncate">{activeBusiness.websiteUrl || tr('Local Business')}</p>
                    </div>
                    <button className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-medium rounded-md whitespace-nowrap">
                      {tr(cta)}
                    </button>
                  </div>

                  <div className="p-2.5 text-[11px] text-slate-700 space-y-1">
                    <p className="line-clamp-2">
                      <strong>{activeBusiness.businessName} </strong>
                      {tr(description)}
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
                      <h4 className="text-[11px] font-semibold text-slate-900">{tr(headline)}</h4>
                      <p className="text-[10px] text-slate-600 line-clamp-2">{tr(description)}</p>
                    </div>
                    <div className="p-2 bg-emerald-600 text-white text-center text-[11px] font-medium flex items-center justify-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {tr('Chat on WhatsApp')}
                    </div>
                  </div>

                  <p className="text-[9px] text-center text-slate-400">
                    {tr('Customers open a chat with {number}.', { number: activeBusiness.whatsappNumber || tr('your WhatsApp number') })}
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
                    <h3 className="text-xs font-bold">{tr(headline)}</h3>
                    <div className="pt-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-white text-slate-900 font-semibold text-[10px]">
                        {tr(cta)}
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
          className="inline-flex min-h-11 items-center gap-1.5 px-3 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {tr('Back')}
        </button>

        <button
          onClick={() => {
            handleApplyEdits();
            onNext();
          }}
          disabled={loading || needsRegeneration || !creative?.headline}
          title={needsRegeneration ? tr('Pick an idea above to continue') : ''}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tr('Use this ad & continue')}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
