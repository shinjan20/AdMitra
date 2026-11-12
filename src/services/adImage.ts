/**
 * Asks the app's own server to make one picture with Google Gemini.
 * The Gemini key lives on the server; this file never sees or sends it.
 */

export type AdImageErrorCode =
  | 'not_configured'
  | 'rate_limited'
  | 'plan'
  | 'too_large'
  | 'no_image'
  | 'blocked'
  | 'busy'
  | 'bad_request'
  | 'upstream'
  | 'offline';

export const adImageErrorMessages: Record<AdImageErrorCode, string> = {
  not_configured:
    'The picture maker is not switched on. Add a Google Gemini key to the server settings to switch it on.',
  rate_limited: 'Too many pictures in a short time. Please wait a few minutes and try again.',
  plan:
    'Picture making is not included in this Google Gemini plan yet. The site owner needs to switch it on in Google AI Studio.',
  too_large: 'That photo is too large. Try a smaller one.',
  no_image: 'No picture came back. Please try again.',
  blocked: 'Google could not make a picture from those words. Try different words or another photo.',
  busy: 'Google is busy right now. Please try again in a minute.',
  bad_request: 'Something in the request was missing. Please try again.',
  upstream: 'The picture could not be made just now. Please try again.',
  offline: 'Could not reach the picture maker. Check your connection and try again.',
};

export class AdImageError extends Error {
  readonly code: AdImageErrorCode;

  constructor(code: AdImageErrorCode, message?: string) {
    super(message || adImageErrorMessages[code]);
    this.name = 'AdImageError';
    this.code = code;
  }
}

export interface AdImageRequest {
  businessName: string;
  category: string;
  city: string;
  area?: string;
  offer?: string;
  headline: string;
  description?: string;
  cta?: string;
  tone?: string;
  /** One of the shop's own photos, already resized by the browser. */
  referenceImage?: { mimeType: string; data: string } | null;
}

export interface AdImageResult {
  imageDataUrl: string;
  model: string;
}

const ENDPOINT = '/api/generate-ad-image';
const MAX_STORED_CHARS = 900_000;
const MAX_STORED_EDGE = 1280;

export async function getAdImageMakerStatus(): Promise<{ ready: boolean; model?: string }> {
  try {
    const response = await fetch(ENDPOINT, { method: 'GET', headers: { accept: 'application/json' } });
    if (!response.ok) return { ready: false };
    const body = await response.json();
    return { ready: Boolean(body?.ready), model: typeof body?.model === 'string' ? body.model : undefined };
  } catch {
    return { ready: false };
  }
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image-load-failed'));
    image.src = source;
  });
}

/**
 * Pictures are saved inside the draft in this browser, so keep them small.
 * A large PNG data URL would quickly fill the browser's storage.
 */
async function shrinkForStorage(dataUrl: string): Promise<string> {
  if (dataUrl.length <= MAX_STORED_CHARS) return dataUrl;
  try {
    const image = await loadImage(dataUrl);
    const longest = Math.max(image.naturalWidth, image.naturalHeight) || MAX_STORED_EDGE;
    const scale = Math.min(1, MAX_STORED_EDGE / longest);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return dataUrl;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (let quality = 0.86; quality >= 0.6; quality -= 0.08) {
      const next = canvas.toDataURL('image/jpeg', quality);
      if (next.length <= MAX_STORED_CHARS) return next;
    }
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch {
    return dataUrl;
  }
}

export async function generateAdImage(request: AdImageRequest): Promise<AdImageResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        businessName: request.businessName,
        category: request.category,
        city: request.city,
        area: request.area || '',
        offer: request.offer || '',
        headline: request.headline,
        description: request.description || '',
        cta: request.cta || '',
        tone: request.tone || '',
        referenceImage: request.referenceImage || null,
      }),
    });
  } catch {
    throw new AdImageError('offline');
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const code = typeof body?.error?.code === 'string' ? body.error.code : '';
    if (code && code in adImageErrorMessages) {
      throw new AdImageError(code as AdImageErrorCode);
    }
    if (response.status === 404) throw new AdImageError('not_configured');
    throw new AdImageError('upstream');
  }

  const imageDataUrl = typeof body?.imageDataUrl === 'string' ? body.imageDataUrl : '';
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new AdImageError('no_image');
  }

  return {
    imageDataUrl: await shrinkForStorage(imageDataUrl),
    model: typeof body?.model === 'string' ? body.model : 'gemini-2.5-flash-image',
  };
}

/** Plain-language text a shop owner can act on. */
export function adImageErrorText(error: unknown): string {
  if (error instanceof AdImageError) return error.message;
  return adImageErrorMessages.upstream;
}
