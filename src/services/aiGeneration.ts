import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { AppLanguage, APP_LANGUAGES } from './language';

export const AD_LANGUAGES = [
  { code: 'en', name: 'English', locale: 'en-IN' },
  { code: 'hi', name: 'Hindi', locale: 'hi-IN' },
  { code: 'bn', name: 'Bengali', locale: 'bn-IN' },
  { code: 'ta', name: 'Tamil', locale: 'ta-IN' },
  { code: 'te', name: 'Telugu', locale: 'te-IN' },
  { code: 'mr', name: 'Marathi', locale: 'mr-IN' },
  { code: 'ur', name: 'Urdu', locale: 'ur-PK' },
  { code: 'ml', name: 'Malayalam', locale: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', locale: 'pa-IN' },
  { code: 'gu', name: 'Gujarati', locale: 'gu-IN' },
  { code: 'kn', name: 'Kannada', locale: 'kn-IN' },
  { code: 'sd', name: 'Sindhi', locale: 'sd-IN' },
  { code: 'as', name: 'Assamese', locale: 'as-IN' },
] as const;

export type AdLanguageCode = AppLanguage;
export const MAX_AD_IMAGES = 6;

export interface AdImageInput {
  mimeType: string;
  data: string;
}

export interface PreparedAdImage extends AdImageInput {
  id: string;
  name: string;
  previewUrl: string;
}

const MAX_SOURCE_IMAGE_BYTES = 8_000_000;
const MAX_COMPRESSED_IMAGE_BYTES = 1_000_000;

export async function prepareAdImage(file: File): Promise<PreparedAdImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('unsupported-image');
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error('image-too-large');
  }
  if (typeof createImageBitmap !== 'function') {
    throw new Error('unsupported-image');
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('unsupported-image');
  }

  try {
    const canvas = document.createElement('canvas');
    let targetSize = Math.min(1280, Math.max(bitmap.width, bitmap.height));
    let blob: Blob | null = null;
    while (!blob || blob.size > MAX_COMPRESSED_IMAGE_BYTES) {
      const scale = targetSize / Math.max(bitmap.width, bitmap.height);
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('unsupported-image');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (let quality = 0.82; quality >= 0.5; quality -= 0.08) {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', quality)
        );
        if (blob && blob.size <= MAX_COMPRESSED_IMAGE_BYTES) break;
      }
      if (blob && blob.size <= MAX_COMPRESSED_IMAGE_BYTES) break;
      if (targetSize <= 640) throw new Error('unsupported-image');
      targetSize = Math.max(640, Math.round(targetSize * 0.75));
    }

    if (!blob) throw new Error('unsupported-image');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('unsupported-image'));
      };
      reader.onerror = () => reject(new Error('unsupported-image'));
      reader.readAsDataURL(blob);
    });
    const separator = dataUrl.indexOf(',');
    if (separator < 0) throw new Error('unsupported-image');
    const data = dataUrl.slice(separator + 1);
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      mimeType: blob.type,
      data,
      previewUrl: dataUrl,
    };
  } finally {
    bitmap.close();
  }
}

export interface GeneratedAdIdea {
  headline: string;
  body: string;
  button: string;
}

export interface GeneratedAdResponse {
  ads: GeneratedAdIdea[];
  imageDataUrl: string | null;
  imageError?: string;
  language: AdLanguageCode;
  generationsRemainingToday: number;
}

export interface StartedAdVideo {
  interactionId: string;
  generationsRemainingToday: number;
}

export type AdVideoProgress =
  | { state: 'pending' }
  | { state: 'complete'; videoUrl: string }
  | { state: 'failed'; error: string };

interface GenerateAdRequest {
  businessName: string;
  category: string;
  city: string;
  area: string;
  offer: string;
  tone: string;
  language: AdLanguageCode;
  images: AdImageInput[];
}

/**
 * Generate a sample ad locally (deterministic, no AI) for demo/fallback
 */
function generateLocalSampleAd(request: GenerateAdRequest): GeneratedAdResponse {
  const { businessName, category, city, offer, tone, language } = request;
  
  // Create deterministic variations based on inputs
  const categoryLower = category.toLowerCase();
  const cityDisplay = city || 'your city';
  
  // Generate 3 ad ideas
  const ads: GeneratedAdIdea[] = [
    {
      headline: `${businessName} - ${offer}`,
      body: `Visit ${businessName} in ${cityDisplay}. ${offer} Contact us for details.`,
      button: 'Contact Us',
    },
    {
      headline: `Special Offer at ${businessName}`,
      body: `Don't miss out! ${offer} Available at ${businessName}, ${cityDisplay}.`,
      button: 'Learn More',
    },
    {
      headline: `${category} in ${cityDisplay}`,
      body: `${businessName} offers ${offer}. Visit us today!`,
      button: 'Get Offer',
    },
  ];
  
  return {
    ads,
    imageDataUrl: null,
    imageError:
      'Sample ad - AI generation is unavailable right now. Add a Google Gemini API key to switch on real generation.',
    language,
    generationsRemainingToday: 25,
  };
}

export async function generateMultilingualAd(
  request: GenerateAdRequest
): Promise<GeneratedAdResponse> {
  if (request.images.length > MAX_AD_IMAGES) {
    throw new Error('You can attach up to 6 photos to one ad.');
  }
  
  // If Supabase is not configured, use local sample generator
  if (!isSupabaseConfigured()) {
    return generateLocalSampleAd(request);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return generateLocalSampleAd(request);
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(`Could not check your sign-in: ${sessionError.message}`);
  }
  if (!sessionData.session) {
    throw new Error('Sign in to make an AI ad.');
  }

  const { data, error } = await supabase.functions.invoke<GeneratedAdResponse>('generate-ad', {
    body: request,
  });
  if (error) {
    // If the backend fails, fall back to local sample
    console.warn('AI backend failed, using local sample:', error);
    return generateLocalSampleAd(request);
  }

  if (
    !data ||
    !APP_LANGUAGES.some((item) => item.code === data.language) ||
    data.language !== request.language ||
    !Number.isInteger(data.generationsRemainingToday) ||
    data.generationsRemainingToday < 0 ||
    data.generationsRemainingToday > 24 ||
    !Array.isArray(data.ads) ||
    data.ads.length !== 3 ||
    !data.ads.every(
      (ad) =>
        typeof ad.headline === 'string' &&
        typeof ad.body === 'string' &&
        typeof ad.button === 'string'
    ) ||
    !(
      (typeof data.imageDataUrl === 'string' && data.imageDataUrl.startsWith('data:image/')) ||
      (data.imageDataUrl === null && typeof data.imageError === 'string')
    )
  ) {
    throw new Error('The ad-making service returned an incomplete result. Please try again.');
  }

  return data;
}

export async function getRemainingAdGenerations(): Promise<number> {
  // If Supabase is not configured, return a default value
  if (!isSupabaseConfigured()) {
    return 25;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    return 25;
  }
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return 25;
  if (!sessionData.session) {
    return 25;
  }
  const { data, error } = await supabase.rpc('get_ad_generations_remaining');
  if (error) return 25;
  if (typeof data !== 'number' || data < 0 || data > 25) {
    return 25;
  }
  return data;
}

export async function startAdVideoGeneration(request: {
  businessName: string;
  category: string;
  city: string;
  offer: string;
  style: string;
}): Promise<StartedAdVideo> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Could not connect to the video-making service.');
  }
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(`Could not check your sign-in: ${sessionError.message}`);
  if (!sessionData.session) throw new Error('Sign in to make a video.');

  const { data, error } = await supabase.functions.invoke<StartedAdVideo>('generate-video', {
    body: { action: 'start', ...request },
  });
  if (error) {
    const context = error.context;
    if (context instanceof Response) {
      try {
        const errorBody = await context.clone().json();
        if (typeof errorBody?.error === 'string') throw new Error(errorBody.error);
      } catch (parseError) {
        if (!(parseError instanceof SyntaxError)) throw parseError;
      }
    }
    throw new Error(error.message || 'The video could not be started. Please try again.');
  }
  if (
    !data ||
    typeof data.interactionId !== 'string' ||
    !data.interactionId ||
    !Number.isInteger(data.generationsRemainingToday) ||
    data.generationsRemainingToday < 0 ||
    data.generationsRemainingToday > 24
  ) {
    throw new Error('The video service returned an incomplete request. Please try again.');
  }
  return data;
}

export async function checkAdVideoProgress(interactionId: string): Promise<AdVideoProgress> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Could not connect to the video-making service.');
  const { data, error } = await supabase.functions.invoke<AdVideoProgress>('generate-video', {
    body: { action: 'poll', interactionId },
  });
  if (error) {
    const context = error.context;
    if (context instanceof Response) {
      try {
        const errorBody = await context.clone().json();
        if (typeof errorBody?.error === 'string') throw new Error(errorBody.error);
      } catch (parseError) {
        if (!(parseError instanceof SyntaxError)) throw parseError;
      }
    }
    throw new Error(error.message || 'Could not check video progress. Please try again.');
  }
  if (!data || !['pending', 'complete', 'failed'].includes(data.state)) {
    throw new Error('The video service returned invalid progress.');
  }
  if (data.state === 'complete') {
    if (typeof data.videoUrl !== 'string') {
      throw new Error('The video service did not return a download link.');
    }
    let url: URL;
    try {
      url = new URL(data.videoUrl);
    } catch {
      throw new Error('The video service returned an invalid download link.');
    }
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      throw new Error('The video service returned an insecure download link.');
    }
  }
  if (data.state === 'failed' && typeof data.error !== 'string') {
    throw new Error('The video could not be created.');
  }
  return data;
}

export async function getRemainingVideoGenerations(): Promise<number> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Could not connect to the video-making service.');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!sessionData.session) throw new Error('Sign in to see your daily video attempts.');
  const { data, error } = await supabase.rpc('get_video_generations_remaining');
  if (error) throw new Error(error.message);
  if (typeof data !== 'number' || data < 0 || data > 25) {
    throw new Error('The daily video attempt count was not available.');
  }
  return data;
}

export async function getLatestAdVideo(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Could not connect to the video-making service.');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!sessionData.session) throw new Error('Sign in to see saved videos.');

  const { data, error } = await supabase
    .from('ad_video_jobs')
    .select('storage_path')
    .eq('status', 'completed')
    .not('storage_path', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.storage_path) return null;

  const { data: signedUrl, error: urlError } = await supabase.storage
    .from('ad-videos')
    .createSignedUrl(data.storage_path, 60 * 60 * 24);
  if (urlError || !signedUrl?.signedUrl) {
    throw new Error(urlError?.message || 'Could not create a video download link.');
  }
  return signedUrl.signedUrl;
}
