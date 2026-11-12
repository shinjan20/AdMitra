import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AD_LANGUAGES,
  AdLanguageCode,
  checkAdVideoProgress,
  generateMultilingualAd,
  GeneratedAdIdea,
  getLatestAdVideo,
  getRemainingAdGenerations,
  getRemainingVideoGenerations,
  MAX_AD_IMAGES,
  prepareAdImage,
  PreparedAdImage,
  startAdVideoGeneration,
} from '../../services/aiGeneration';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { adImageErrorText, generateAdImage, getAdImageMakerStatus } from '../../services/adImage';
import { CreativeVariation } from '../../types';
import {
  Check,
  Copy,
  Camera,
  Download,
  Mic,
  MapPin,
  MessageCircle,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';

const TONES = ['Friendly', 'Clear', 'Premium'] as const;
type AdTone = (typeof TONES)[number];

interface SavedAdDetails {
  version: 1;
  offer: string;
  tone: AdTone;
  language: AdLanguageCode;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternativeLike> {
  isFinal: boolean;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex: number;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const readSavedAdDetails = (value?: string): SavedAdDetails | null => {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      parsed.version === 1 &&
      'offer' in parsed &&
      typeof parsed.offer === 'string' &&
      'tone' in parsed &&
      typeof parsed.tone === 'string' &&
      TONES.includes(parsed.tone as AdTone) &&
      (!('language' in parsed) ||
        (typeof parsed.language === 'string' &&
          AD_LANGUAGES.some((item) => item.code === parsed.language)))
    ) {
      const savedLanguage = 'language' in parsed
        ? AD_LANGUAGES.find((item) => item.code === parsed.language)
        : AD_LANGUAGES[0];
      return {
        version: 1,
        offer: parsed.offer,
        tone: parsed.tone as AdTone,
        language: savedLanguage?.code || 'hi',
      };
    }
  } catch {
    return null;
  }
  return null;
};

const makeVariation = (creative: NonNullable<ReturnType<typeof useApp>['activeDraft']>['creative']) =>
  creative
    ? {
        id: creative.id,
        headline: creative.headline,
        description: creative.description,
        cta: 'Send WhatsApp Message' as const,
        ctaLabel: creative.ctaLabel,
        imageUrl: creative.imageUrl,
        badgeText: 'Saved ad',
      }
    : null;

export const CreativeStudioPage: React.FC = () => {
  const {
    activeBusiness,
    activeDraft,
    updateActiveDraft,
    showToast,
    user,
    navigateTo,
    setShowAuthModal,
    language: uiLanguage,
    t,
    tr,
  } = useApp();
  const draftMatchesBusiness = activeDraft?.businessId === activeBusiness.id;
  const savedCreative = draftMatchesBusiness ? makeVariation(activeDraft.creative) : null;
  const savedAdDetails = draftMatchesBusiness ? readSavedAdDetails(activeDraft?.creativePrompt) : null;
  const creativeId = useRef(activeDraft?.creative?.id || `cr-${Date.now()}`);
  const audienceId = useRef(activeDraft?.audience?.id || `aud-${Date.now()}`);
  const creativeCreatedAt = useRef(activeDraft?.creative?.createdAt || new Date().toISOString());
  const [offer, setOffer] = useState(
    savedAdDetails?.offer || (draftMatchesBusiness ? activeDraft?.creativePrompt || '' : '')
  );
  const [area, setArea] = useState(
    draftMatchesBusiness
      ? activeDraft?.audience?.locationArea || activeBusiness.location.area || ''
      : activeBusiness.location.area || ''
  );
  const [tone, setTone] = useState<AdTone>(savedAdDetails?.tone || 'Friendly');
  const [language] = useState<AdLanguageCode>('en');
  const [videoDirection, setVideoDirection] = useState('');
  const [videoInteractionId, setVideoInteractionId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [remainingVideoAttempts, setRemainingVideoAttempts] = useState<number | null>(null);
  const [variations, setVariations] = useState<CreativeVariation[]>(() => {
    if (!draftMatchesBusiness || !activeDraft?.creative) return [];
    return activeDraft.creative.variations?.length
      ? activeDraft.creative.variations
      : savedCreative
        ? [savedCreative]
        : [];
  });
  const [followUps, setFollowUps] = useState<GeneratedAdIdea[]>([]);
  const [copiedFollowUpId, setCopiedFollowUpId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offerError, setOfferError] = useState('');
  const [generationProgress, setGenerationProgress] = useState('');
  const [copied, setCopied] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isMakingImage, setIsMakingImage] = useState(false);
  const [imageMakerError, setImageMakerError] = useState('');
  const [imageProgress, setImageProgress] = useState('');
  const [imageMakerReady, setImageMakerReady] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [images, setImages] = useState<PreparedAdImage[]>([]);
  const [imageError, setImageError] = useState('');
  const [processingImages, setProcessingImages] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [lastGenerationAttempt, setLastGenerationAttempt] = useState<{ offer: string; tone: AdTone; images: PreparedAdImage[] } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const speechRecognition = useRef<SpeechRecognitionLike | null>(null);
  const videoPollGeneration = useRef(0);
  const shopDetailsComplete = Boolean(
    activeBusiness.businessName.trim() &&
    activeBusiness.category.trim() &&
    activeBusiness.location.city.trim()
  );

  useEffect(() => {
    // Language is now fixed to Hindi
  }, []);

  // Detect unsaved changes and warn before navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    let active = true;
    getAdImageMakerStatus().then((status) => {
      if (active) setImageMakerReady(status.ready);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setRemainingAttempts(null);
      setRemainingVideoAttempts(null);
      return;
    }
    let active = true;
    getRemainingAdGenerations()
      .then((remaining) => {
        if (active) setRemainingAttempts(remaining);
      })
      .catch((error) => {
        console.error('Could not load remaining daily ad attempts:', error);
        if (active) setRemainingAttempts(null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      videoPollGeneration.current += 1;
      setVideoUrl('');
      setVideoInteractionId('');
      setVideoLoading(false);
      return;
    }
    let active = true;
    getLatestAdVideo()
      .then((savedVideoUrl) => {
        if (active && savedVideoUrl) setVideoUrl(savedVideoUrl);
      })
      .catch((error) => {
        console.error('Could not load the latest saved ad video:', error);
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;
    let active = true;
    getRemainingVideoGenerations()
      .then((remaining) => {
        if (active) setRemainingVideoAttempts(remaining);
      })
      .catch((error) => {
        console.error('Could not load remaining daily video attempts:', error);
        if (active) setRemainingVideoAttempts(null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const saveDraft = (variation: CreativeVariation, allVariations: CreativeVariation[]) => {
    updateActiveDraft(() => ({
      businessId: activeBusiness.id,
      objective: 'messages',
      creativePrompt: JSON.stringify({ version: 1, offer: offer.trim(), tone, language }),
      audience: {
        id: audienceId.current,
        campaignId: '',
        locationCity: activeBusiness.location.city,
        locationArea: area.trim(),
        radiusKm: 5,
        ageRangeMin: 18,
        ageRangeMax: 65,
        gender: 'all',
        interests: [],
      },
      creative: {
        id: creativeId.current,
        campaignId: '',
        headline: variation.headline,
        description: variation.description,
        cta: 'Send WhatsApp Message',
        ctaLabel: variation.ctaLabel,
        imageUrl: variation.imageUrl,
        approvalStatus: 'draft',
        variations: allVariations,
        createdAt: creativeCreatedAt.current,
      },
    }));
  };

  useEffect(() => () => {
    speechRecognition.current?.stop();
    videoPollGeneration.current += 1;
  }, []);

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files || []);
    input.value = '';
    if (files.length === 0) return;
    if (images.length + files.length > MAX_AD_IMAGES) {
      setImageError(t('imageUploadLimit'));
      return;
    }

    setImageError('');
    setProcessingImages(true);
    try {
      const prepared: PreparedAdImage[] = [];
      for (const file of files) {
        prepared.push(await prepareAdImage(file));
      }
      setImages((current) => [...current, ...prepared]);
    } catch (error) {
      console.error('Could not prepare an ad photo:', error);
      setImageError(
        error instanceof Error && error.message === 'image-too-large'
          ? t('imageTooLarge')
          : t('imageUnsupported')
      );
    } finally {
      setProcessingImages(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      speechRecognition.current?.stop();
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(tr('Voice typing is not available in this browser. You can type your offer instead.'));
      return;
    }

    setSpeechError('');
    const recognition = new SpeechRecognition();
    recognition.lang = AD_LANGUAGES.find((item) => item.code === language)?.locale || 'ml-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => result.isFinal)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      if (transcript) {
        setOffer((current) =>
          `${current.trim()}${current.trim() ? ' ' : ''}${transcript}`.slice(0, 180)
        );
      }
    };
    recognition.onerror = (event) => {
      setSpeechError(
        event.error === 'not-allowed'
          ? tr('Allow microphone access to use voice typing. You can also type your offer.')
          : tr('Voice typing stopped. Please try again or type your offer.')
      );
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    speechRecognition.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Could not start voice typing:', error);
      setSpeechError('Could not start voice typing. Please type your offer instead.');
      setIsListening(false);
    }
  };

  const handleGenerate = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!offer.trim()) {
      setOfferError(tr('Please write or speak your offer.'));
      return;
    }
    if (offer.trim().length < 5) {
      setOfferError(tr('Offer must be at least 5 characters.'));
      return;
    }
    setOfferError('');
    setGenerationError('');
    if (!shopDetailsComplete) {
      showToast({
        type: 'warning',
        title: t('shopSetup'),
        message: t('shopIntro'),
      });
      navigateTo('business-profile');
      return;
    }
    if (isSupabaseConfigured() && !user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setGenerationProgress(tr('Writing your ad ideas...'));
    try {
      const result = await generateMultilingualAd({
        businessName: activeBusiness.businessName,
        category: activeBusiness.category,
        city: activeBusiness.location.city,
        area: area.trim(),
        offer: offer.trim(),
        tone,
        language,
        images: images.map(({ mimeType, data }) => ({ mimeType, data })),
      });
      const aiIdeas = result.ads.map((idea, index) => ({
        id: `ai-${Date.now()}-${index}`,
        headline: idea.headline,
        description: idea.body,
        cta: 'Send WhatsApp Message' as const,
        ctaLabel: idea.button,
        imageUrl: '',
        badgeText: `AI ad idea ${index + 1}`,
      }));
      setFollowUps(result.followUps || []);

      setGenerationProgress(tr('Putting your ad together...'));
      setVariations(aiIdeas);
      setSelectedIndex(0);
      setGeneratedImageUrl(result.imageDataUrl || '');
      saveDraft(aiIdeas[0], aiIdeas);
      setRemainingAttempts(result.generationsRemainingToday);
      const safetyMessages = (result.safetyIssues || []).filter(
        (message) => typeof message === 'string' && message.trim().length > 0,
      );
      if (result.imageError || safetyMessages.length > 0) {
        showToast({
          type: 'warning',
          title: result.imageError ? t('imageMissing') : t('safetyCheck'),
          message:
            [result.imageError, ...safetyMessages].filter(Boolean).join(' ') ||
            tr('Your ad text is saved in this browser. Nothing has been published.'),
        });
      } else {
        showToast({
          type: 'success',
          title: t('adReady'),
          message: tr('Your ad text is saved in this browser. Nothing has been published.'),
        });
      }
    } catch (error) {
      console.error('Could not create ad ideas:', error);
      const message = error instanceof Error ? error.message : tr('Please try again.');
      setGenerationError(message);
      showToast({
        type: 'error',
        title: tr('Could not create ad ideas'),
        message,
      });
    } finally {
      if (user && isSupabaseConfigured()) {
        try {
          setRemainingAttempts(await getRemainingAdGenerations());
        } catch (error) {
          console.error('Could not refresh remaining daily ad attempts:', error);
          setRemainingAttempts(null);
        }
      }
      setGenerationProgress('');
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!offer.trim()) {
      showToast({ type: 'warning', title: t('offerQuestion'), message: t('offerHint') });
      return;
    }
    if (!shopDetailsComplete) {
      showToast({
        type: 'warning',
        title: t('shopSetup'),
        message: t('shopIntro'),
      });
      navigateTo('business-profile');
      return;
    }
    if (isSupabaseConfigured() && !user) {
      setShowAuthModal(true);
      return;
    }

    const requestId = ++videoPollGeneration.current;
    setVideoLoading(true);
    setVideoError('');
    try {
      let interactionId = videoInteractionId;
      if (!interactionId) {
        const started = await startAdVideoGeneration({
          businessName: activeBusiness.businessName,
          category: activeBusiness.category,
          city: activeBusiness.location.city,
          offer: offer.trim(),
          style: videoDirection.trim(),
        });
        if (requestId !== videoPollGeneration.current) return;
        interactionId = started.interactionId;
        setVideoInteractionId(interactionId);
        setRemainingVideoAttempts(started.generationsRemainingToday);
      }

      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 5000));
        if (requestId !== videoPollGeneration.current) return;

        const progress = await checkAdVideoProgress(interactionId);
        if (requestId !== videoPollGeneration.current) return;
        if (progress.state === 'pending') continue;
        if (progress.state === 'failed') {
          setVideoInteractionId('');
          throw new Error(progress.error);
        }

        setVideoUrl(progress.videoUrl);
        setVideoInteractionId('');
        showToast({ type: 'success', title: t('adReady') });
        return;
      }
      throw new Error(t('videoProgress'));
    } catch (error) {
      if (requestId !== videoPollGeneration.current) return;
      const message = error instanceof Error ? error.message : t('genericError');
      setVideoError(message);
      if (user && isSupabaseConfigured()) {
        try {
          setRemainingVideoAttempts(await getRemainingVideoGenerations());
        } catch (refreshError) {
          console.error('Could not refresh remaining daily video attempts:', refreshError);
          setRemainingVideoAttempts(null);
        }
      }
    } finally {
      if (requestId === videoPollGeneration.current) setVideoLoading(false);
    }
  };

  const loadVideoFile = async () => {
    if (!videoUrl) throw new Error('No generated video is available.');
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error(`Video download failed with status ${response.status}`);
    const video = await response.blob();
    if (video.type !== 'video/mp4') throw new Error('The generated video is not a supported MP4 file.');
    const businessName = activeBusiness.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return new File([video], `${businessName || 'business'}-ad.mp4`, { type: 'video/mp4' });
  };

  const handleDownloadVideo = async () => {
    try {
      const file = await loadVideoFile();
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast({ type: 'success', title: t('downloadVideo') });
    } catch (error) {
      console.error('Could not download the generated video:', error);
      showToast({
        type: 'error',
        title: t('downloadVideo'),
        message: error instanceof Error ? error.message : t('genericError'),
      });
    }
  };

  const handleShareVideo = async () => {
    try {
      const file = await loadVideoFile();
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: activeBusiness.businessName });
        return;
      }
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast({ type: 'info', title: t('downloadVideo') });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Could not share the generated video:', error);
      showToast({
        type: 'error',
        title: t('shareVideo'),
        message: error instanceof Error ? error.message : t('genericError'),
      });
    }
  };

  const updateSelected = (changes: Partial<CreativeVariation>) => {
    const updated = variations.map((variation, index) =>
      index === selectedIndex ? { ...variation, ...changes } : variation
    );
    setVariations(updated);
    setHasUnsavedChanges(true);
    if (updated[selectedIndex]) saveDraft(updated[selectedIndex], updated);
  };

  const handleMakeNewImage = async () => {
    const current = variations[selectedIndex];
    if (!current || isMakingImage) return;

    if (!current.headline.trim() && !offer.trim()) {
      showToast({
        type: 'warning',
        title: t('offerQuestion'),
        message: t('offerHint'),
      });
      return;
    }

    setIsMakingImage(true);
    setImageMakerError('');
    setImageProgress(tr('Making your picture...'));
    try {
      const result = await generateAdImage({
        businessName: activeBusiness.businessName,
        category: activeBusiness.category,
        city: activeBusiness.location.city,
        area: area.trim() || activeBusiness.location.area,
        offer: offer.trim() || current.description,
        headline: current.headline,
        description: current.description,
        cta: current.ctaLabel || current.cta,
        tone,
        referenceImage: images[0] || null,
      });
      setGeneratedImageUrl(result.imageDataUrl);
      updateSelected({ imageUrl: result.imageDataUrl });
      setImageMakerReady(true);
      setImageMakerError('');
      setImageProgress('');
      showToast({
        type: 'success',
        title: tr('New picture ready'),
        message: tr('Google Gemini made this picture from your ad. Check it looks like your real shop before you share it.'),
      });
    } catch (error) {
      console.error('Could not make a new picture:', error);
      const message = tr(adImageErrorText(error));
      setImageMakerError(message);
      setImageProgress('');
      showToast({
        type: 'error',
        title: tr('Could not make a picture'),
        message,
      });
    } finally {
      setIsMakingImage(false);
    }
  };

  const handleApproveAd = () => {
    const current = variations[selectedIndex];
    if (!current) return;
    saveDraft(current, variations);
    setHasUnsavedChanges(false);
    updateActiveDraft((prev) => {
      const base = prev ?? {};
      return {
        ...base,
        creative: base.creative
          ? { ...base.creative, approvalStatus: 'approved' as const }
          : base.creative,
      };
    });
    showToast({
      type: 'success',
      title: tr('Ad saved'),
      message: tr('You approved this ad. It is still a draft — nothing was posted or charged.'),
    });
  };

  const selected = variations[selectedIndex];
  const imageMadeByGemini =
    Boolean(generatedImageUrl) || Boolean(selected?.imageUrl?.startsWith('data:image/'));
  const adApproved = activeDraft?.creative?.approvalStatus === 'approved';
  const adText = selected
    ? `${selected.headline}\n\n${selected.description}\n\n${selected.ctaLabel || selected.cta}`
    : '';

  const handleCopy = async () => {
    if (!adText) return;
    try {
      await navigator.clipboard.writeText(adText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      showToast({ type: 'success', title: tr('Ad text copied') });
    } catch (error) {
      console.error('Could not copy ad text:', error);
      showToast({
        type: 'error',
        title: tr('Could not copy the ad'),
        message: tr('Select the text in the preview and copy it instead.'),
      });
    }
  };

  const handleCopyFollowUp = async (followUp: GeneratedAdIdea, index: number) => {
    const followUpText = `${followUp.headline}\n\n${followUp.body}\n\n${followUp.button}`;
    try {
      await navigator.clipboard.writeText(followUpText);
      setCopiedFollowUpId(`follow-up-${index}`);
      window.setTimeout(() => setCopiedFollowUpId(null), 1800);
      showToast({ type: 'success', title: tr('Ad text copied') });
    } catch (error) {
      console.error('Could not copy follow-up:', error);
      showToast({
        type: 'error',
        title: tr('Could not copy the ad'),
        message: tr('Select the text in the preview and copy it instead.'),
      });
    }
  };

  const handleDownload = () => {
    if (!adText) return;
    const file = new Blob([adText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    const businessName = activeBusiness.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `${businessName || 'business'}-whatsapp-ad.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: tr('Ad text downloaded') });
  };

  const handleCopyInstagramCaption = async () => {
    if (!adText) return;
    try {
      await navigator.clipboard.writeText(adText);
      setInstagramCopied(true);
      window.setTimeout(() => setInstagramCopied(false), 1800);
      showToast({ type: 'success', title: t('instagramCopyCaption') });
    } catch (error) {
      console.error('Could not copy Instagram caption:', error);
      showToast({
        type: 'error',
        title: t('instagramCopyCaption'),
        message: t('genericError'),
      });
    }
  };

  const handleDownloadInstagramImage = async () => {
    const imageSource = generatedImageUrl || selected?.imageUrl;
    if (!imageSource) return;

    try {
      const response = await fetch(imageSource);
      if (!response.ok) throw new Error(`Image download failed with status ${response.status}`);
      const image = await response.blob();
      if (!image.type.startsWith('image/')) throw new Error('The ad image has an unsupported format.');

      const imageUrl = URL.createObjectURL(image);
      const link = document.createElement('a');
      const businessName = activeBusiness.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const extension = image.type === 'image/jpeg' ? 'jpg' : image.type.split('/')[1] || 'png';
      link.href = imageUrl;
      link.download = `${businessName || 'business'}-instagram.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
      showToast({ type: 'success', title: t('instagramDownloadImage') });
    } catch (error) {
      console.error('Could not download Instagram image:', error);
      showToast({
        type: 'error',
        title: t('instagramDownloadImage'),
        message: t('genericError'),
      });
    }
  };

  return (
    <div className="creative-studio mx-auto max-w-5xl space-y-8 pb-12">
      <header className="flex max-w-4xl flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
        <span className="chip">{tr('Step 2 of 2 · Your ad')}</span>
        <h1 className="display mt-3 text-3xl font-bold sm:text-4xl">
          {t('makeAd')} · {activeBusiness.businessName}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[color:var(--ink-soft)]">
          {tr('Write your offer below. We suggest an ad in your language, and you can edit every word. Nothing is posted or charged.')}
        </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (hasUnsavedChanges) {
              if (window.confirm(tr('You have unsaved changes. Are you sure you want to leave?'))) {
                setHasUnsavedChanges(false);
                navigateTo('create-campaign');
              }
            } else {
              navigateTo('create-campaign');
            }
          }}
          className="btn-secondary min-h-11 px-4 text-sm"
        >
          {tr('Plan a budget (optional)')}
        </button>
      </header>

      <form
        onSubmit={handleGenerate}
        noValidate
        data-tour="ad-prompt"
        className="surface-raised space-y-5 rounded-2xl p-5 sm:p-7"
      >
        <div>
          <label htmlFor="ad-offer" className="mb-1.5 block text-sm font-medium text-slate-800">
            {t('offerQuestion')}
          </label>
          <textarea
            id="ad-offer"
            value={offer}
            onChange={(event) => {
              setOffer(event.target.value);
              if (offerError) setOfferError('');
            }}
            rows={2}
            maxLength={180}
            required
            aria-invalid={Boolean(offerError)}
            placeholder={t('offerHint')}
            className={`min-h-24 w-full resize-y rounded-xl border px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 ${offerError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300'}`}
          />
          {offerError && (
            <p role="alert" className="mt-1 text-sm text-rose-700">{offerError}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">{t('offerHint')}</p>
            <button
              type="button"
              onClick={toggleVoiceInput}
              aria-pressed={isListening}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              {isListening ? t('stopSpeaking') : t('speakOffer')}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500" aria-live="polite">
            {speechError || (isListening
              ? tr('Listening in {language}…', { language: AD_LANGUAGES.find((item) => item.code === language)?.name || '' })
              : t('voicePrivacy'))}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p id="ad-image-help" className="mb-2 text-xs leading-relaxed text-slate-500">
              {t('imageUploadHelp')}
            </p>
            <input
              id="ad-images"
              type="file"
              accept="image/*"
              multiple
              disabled={processingImages || images.length >= MAX_AD_IMAGES}
              onChange={handleImageSelection}
              aria-describedby="ad-image-help"
              className="peer sr-only"
            />
            <label
              htmlFor="ad-images"
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[color:var(--line-strong)] bg-white px-4 text-sm font-semibold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--paper)] peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--brand)] peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
            >
              <Camera className="h-4 w-4 text-[color:var(--brand)]" aria-hidden="true" />
              {t('imageUploadTitle')}
            </label>
            <p className="mt-2 text-xs text-slate-500" aria-live="polite">
              {processingImages ? t('processingPhotos') : `${images.length} / ${MAX_AD_IMAGES}`}
            </p>
            {imageError && <p role="alert" className="mt-1 text-sm text-rose-700">{imageError}</p>}
          </div>
          {images.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={t('imageUploadTitle')}>
              {images.map((image) => (
                <li key={image.id} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img src={image.previewUrl} alt={image.name} className="aspect-[4/3] w-full object-cover" />
                  <span className="block truncate px-2 py-1.5 pr-12 text-xs text-slate-600">{image.name}</span>
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))}
                    aria-label={`${t('removeImage')}: ${image.name}`}
                    className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="ad-language" className="mb-1.5 block text-sm font-medium text-slate-800">
            {t('adLanguage')}
          </label>
          <select
            id="ad-language"
            value="en"
            disabled
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-gray-100 px-3 text-base text-slate-900 cursor-not-allowed"
          >
            <option value="en">English</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">Ads are created in English</p>
        </div>

        <details className="border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
            {t('optionalDetails')}
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ad-area" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('nearbyArea')}
            </label>
            <input
              id="ad-area"
              type="text"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              maxLength={100}
              placeholder={t('area')}
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label htmlFor="ad-tone" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('tone')}
            </label>
            <select
              id="ad-tone"
              value={tone}
              onChange={(event) => setTone(event.target.value as AdTone)}
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {TONES.map((option) => (
                <option key={option} value={option}>
                  {option === 'Friendly' ? t('toneFriendly') : option === 'Clear' ? t('toneClear') : t('tonePremium')}
                </option>
              ))}
            </select>
          </div>
          </div>
        </details>

        <details className="border-t border-slate-200 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
            {t('videoExperimental')}
          </summary>
          <div className="mt-4 space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">{t('videoPromptHint')}</p>
            <div>
              <label htmlFor="video-direction" className="mb-1.5 block text-sm font-medium text-slate-800">
                {t('videoDirection')}
              </label>
              <textarea
                id="video-direction"
                value={videoDirection}
                onChange={(event) => setVideoDirection(event.target.value)}
                rows={2}
                maxLength={500}
                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={
                loading ||
                videoLoading ||
                processingImages ||
                !offer.trim() ||
                !shopDetailsComplete ||
                (remainingVideoAttempts === 0 && !videoInteractionId)
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[var(--brand)] bg-white px-5 text-sm font-semibold text-[var(--brand)] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${videoLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {videoLoading ? t('makingVideo') : t('makeVideo')}
            </button>
            {isSupabaseConfigured() && (
              <p className="text-xs text-slate-500">
                {user
                  ? remainingVideoAttempts === null
                    ? t('dailyAttemptsUnavailable')
                    : t('videoAttempts', { count: remainingVideoAttempts })
                  : t('signInForAttempts')}
              </p>
            )}
            {videoLoading && (
              <p role="status" className="text-sm leading-relaxed text-slate-600">
                {t('videoProgress')}
              </p>
            )}
            {videoError && (
              <div role="alert" className="text-sm leading-relaxed text-rose-700">
                {videoError}{' '}
                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  className="font-semibold underline"
                >
                  {tr('Retry')}
                </button>
              </div>
            )}
          </div>
        </details>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              data-tour="ad-generate"
              disabled={loading || videoLoading || processingImages || !shopDetailsComplete}
              className="brand-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading ? t('makingAd') : t('makeAd')}
            </button>
          </div>
          {generationError && (
            <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {generationError}{' '}
              <button type="button" onClick={() => void handleGenerate()} className="font-semibold underline">
                {tr('Retry')}
              </button>
            </div>
          )}
          {loading && generationProgress && (
            <p role="status" aria-live="polite" className="text-sm font-medium text-slate-700">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent align-middle" />{' '}
              {generationProgress}
            </p>
          )}
          <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:gap-4">
            {isSupabaseConfigured() && user && (
              <p>
                {remainingAttempts === null
                  ? t('dailyAttemptsUnavailable')
                  : t('dailyAttempts', { count: remainingAttempts })}
              </p>
            )}
          </div>
        </div>
        {!shopDetailsComplete && (
          <div className="flex flex-col gap-3 border-t border-rose-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-slate-700" role="status">
              {t('shopIntro')}
            </p>
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (window.confirm(tr('You have unsaved changes. Are you sure you want to leave?'))) {
                    setHasUnsavedChanges(false);
                    navigateTo('business-profile');
                  }
                } else {
                  navigateTo('business-profile');
                }
              }}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {t('shopSetup')}
            </button>
          </div>
        )}
      </form>

      {videoUrl && (
        <section className="surface-panel space-y-4 rounded-xl p-4 sm:p-6" aria-labelledby="ad-video-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="ad-video-title" className="text-2xl font-semibold text-slate-900">
                {t('makeVideo')}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{t('editBeforeShare')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleShareVideo}
                className="brand-button inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t('shareVideo')}
              </button>
              <button
                type="button"
                onClick={handleDownloadVideo}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t('downloadVideo')}
              </button>
            </div>
          </div>
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-[70vh] w-full max-w-sm rounded-lg bg-slate-950"
          >
            {tr('Your browser does not support video playback.')}
          </video>
        </section>
      )}

      {variations.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" aria-label="Your ad ideas">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('chooseAd')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('editBeforeShare')}</p>
            </div>
            {variations.map((variation, index) => (
              <button
                type="button"
                key={variation.id}
                onClick={() => {
                  setSelectedIndex(index);
                  saveDraft(variation, variations);
                }}
                aria-pressed={selectedIndex === index}
                className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                  selectedIndex === index
                      ? 'border-[var(--brand)] bg-blue-50 ring-1 ring-[var(--brand)]'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
              >
                <span className="block text-xs font-medium text-slate-500">
                  {variation.badgeText?.startsWith('AI ad idea ')
                    ? tr('AI ad idea {n}', { n: variation.badgeText.replace('AI ad idea ', '') })
                    : variation.badgeText?.startsWith('Ad idea ')
                      ? tr('Ad idea {n}', { n: variation.badgeText.replace('Ad idea ', '') })
                      : variation.badgeText
                        ? tr(variation.badgeText)
                        : tr('Ad idea {n}', { n: index + 1 })}
                </span>
                <span className="mt-1 block font-semibold text-slate-900">{variation.headline}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600 line-clamp-2">
                  {variation.description}
                </span>
              </button>
            ))}
          </div>

          {followUps.length > 0 && (
            <section className="space-y-3" aria-label="Follow-up messages">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('followUpsTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('followUpsHelp')}</p>
              </div>
              {followUps.map((followUp, index) => (
                <div
                  key={`follow-up-${index}`}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('followUpMessage', { n: index + 1 })}
                  </span>
                  <p className="mt-2 text-base font-semibold text-slate-900">{followUp.headline}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{followUp.body}</p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleCopyFollowUp(followUp, index)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      {copiedFollowUpId === `follow-up-${index}` ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {t('copyAd')}
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {selected && (
            <div data-tour="ad-preview" className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('preview')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('editBeforeShare')}</p>
              </div>

              <div className="preview-frame overflow-hidden rounded-xl bg-white">
                <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                    {activeBusiness.businessName[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{activeBusiness.businessName}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {area.trim() || activeBusiness.location.city}, {activeBusiness.location.city}
                    </p>
                  </div>
                </div>
                {(generatedImageUrl || selected.imageUrl) && (
                  <div className="relative">
                    <img
                      src={generatedImageUrl || selected.imageUrl}
                      alt=""
                      className="aspect-[16/9] w-full object-cover"
                    />
                    {imageMadeByGemini && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[0.6875rem] font-semibold text-white backdrop-blur">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        {tr('Made with Google Gemini')}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[color:var(--line)] bg-[color:var(--paper)]/60 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={handleMakeNewImage}
                    disabled={isMakingImage}
                    className="btn-secondary min-h-10 px-3 text-sm disabled:cursor-wait disabled:opacity-70"
                  >
                    <Sparkles className={`h-4 w-4 text-[color:var(--brand)] ${isMakingImage ? 'animate-pulse' : ''}`} aria-hidden="true" />
                    {isMakingImage
                      ? imageProgress || tr('Making a new picture…')
                      : imageMakerError
                        ? tr('Try again')
                        : tr('Make a new picture')}
                  </button>
                  {imageMakerError && (
                    <p role="alert" className="min-w-0 flex-1 text-xs leading-relaxed text-rose-700">
                      {imageMakerError}{' '}
                      <button type="button" onClick={handleMakeNewImage} className="font-semibold underline">
                        {tr('Retry')}
                      </button>
                    </p>
                  )}
                  {!imageMakerError && (
                  <p className="min-w-0 flex-1 text-xs leading-relaxed text-[color:var(--ink-soft)]">
                    {imageMakerReady === false
                      ? tr('Picture making is switched off. Add a Google Gemini key to switch it on.')
                      : tr('A new picture made from this ad idea. Check it looks like your shop before you share it.')}
                  </p>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <label htmlFor="ad-headline" className="block text-sm font-medium text-slate-700">
                    {t('mainLine')}
                  </label>
                  <input
                    id="ad-headline"
                    value={selected.headline}
                    maxLength={100}
                    onChange={(event) => updateSelected({ headline: event.target.value })}
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <label htmlFor="ad-message" className="block text-sm font-medium text-slate-700">
                    {t('adMessage')}
                  </label>
                  <textarea
                    id="ad-message"
                    value={selected.description}
                    rows={4}
                    maxLength={500}
                    onChange={(event) => updateSelected({ description: event.target.value })}
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-base leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const whatsappNumber = activeBusiness.whatsappNumber?.replace(/\D/g, '');
                      if (whatsappNumber) {
                        window.open(`https://wa.me/${whatsappNumber}`, '_blank');
                      } else {
                        showToast({
                          type: 'warning',
                          title: tr('WhatsApp number not saved'),
                          message: tr('Add your WhatsApp number in business profile to open WhatsApp.'),
                        });
                      }
                    }}
                    className="brand-button inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    title={activeBusiness.whatsappNumber ? tr('Open WhatsApp') : tr('Add WhatsApp number first')}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {selected.ctaLabel || 'Send a WhatsApp message'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleApproveAd}
                  className="brand-button inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {adApproved ? tr('Saved') : tr('Save this ad')}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? tr('Copied') : t('copyAd')}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {t('downloadText')}
                </button>
                <span className="inline-flex min-h-11 items-center text-sm text-slate-500">
                  {copied ? tr('Ready to paste into WhatsApp') : t('draftSaved')}
                </span>
              </div>

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-labelledby="instagram-share-title">
                <h3 id="instagram-share-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  {t('instagramShare')}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                  {t('instagramInstructions')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyInstagramCaption}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    {instagramCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {t('instagramCopyCaption')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadInstagramImage}
                    disabled={!generatedImageUrl && !selected.imageUrl}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('instagramDownloadImage')}
                  </button>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    {t('instagramOpen')}
                  </a>
                </div>
              </section>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[color:var(--line-strong)] bg-white px-5 py-10 text-center" data-tour="ad-preview">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{t('emptyTitle')}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-600">
            {t('emptyBody')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            {tr('Suggestions use your business details and can be edited.')}
          </div>
        </section>
      )}
    </div>
  );
};
