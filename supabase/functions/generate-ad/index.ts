import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  ur: 'Urdu',
  ml: 'Malayalam',
  pa: 'Punjabi',
  gu: 'Gujarati',
  kn: 'Kannada',
  sd: 'Sindhi',
  as: 'Assamese',
} as const;

type LanguageCode = keyof typeof LANGUAGES;
const MAX_AD_IMAGES = 6;
const MAX_IMAGE_BYTES = 1_000_000;
const MAX_REQUEST_BYTES = 10_000_000;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const localOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function response(
  request: Request,
  body: Record<string, unknown>,
  status = 200
): Response {
  const origin = request.headers.get('origin');
  const configuredOrigin = Deno.env.get('APP_ORIGIN');
  const allowedOrigins = [...localOrigins, configuredOrigin].filter(Boolean);
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }

  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function readText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readImageInputs(
  value: unknown
): Array<{ mimeType: string; data: string }> | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_AD_IMAGES) return null;

  const images: Array<{ mimeType: string; data: string }> = [];
  let totalBytes = 0;
  for (const image of value) {
    if (
      !isRecord(image) ||
      typeof image.mimeType !== 'string' ||
      !ALLOWED_IMAGE_TYPES.has(image.mimeType) ||
      typeof image.data !== 'string' ||
      image.data.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)
    ) {
      return null;
    }

    const paddingBytes = image.data.endsWith('==') ? 2 : image.data.endsWith('=') ? 1 : 0;
    const imageBytes = Math.max(0, Math.floor(image.data.length * 3 / 4) - paddingBytes);
    if (imageBytes > MAX_IMAGE_BYTES) return null;
    totalBytes += imageBytes;
    images.push({ mimeType: image.mimeType, data: image.data });
  }

  return totalBytes <= MAX_IMAGE_BYTES * MAX_AD_IMAGES ? images : null;
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const allowedOrigins = [...localOrigins, Deno.env.get('APP_ORIGIN')].filter(Boolean);
    if (origin && !allowedOrigins.includes(origin)) {
      return response(request, { error: 'Origin not allowed.' }, 403);
    }
    const headers: Record<string, string> = {
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Vary': 'Origin',
    };
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  // GET request to check if image maker is available
  if (request.method === 'GET') {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiModel = Deno.env.get('GEMINI_IMAGE_MODEL') || 'gemini-3-pro-image';
    const ready = Boolean(geminiKey);
    return response(request, {
      ready,
      model: ready ? geminiModel : undefined,
    });
  }

  if (request.method !== 'POST') {
    return response(request, { error: 'Use POST to create ad ideas.' }, 405);
  }

  const origin = request.headers.get('origin');
  const configuredOrigin = Deno.env.get('APP_ORIGIN');
  if (origin && ![...localOrigins, configuredOrigin].filter(Boolean).includes(origin)) {
    return response(request, { error: 'Origin not allowed.' }, 403);
  }

  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!geminiKey || !supabaseUrl || !supabaseAnonKey) {
    return response(request, { error: 'The ad-generation service is not configured yet.' }, 503);
  }

  const authorization = request.headers.get('authorization');
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!bearer) {
    return response(request, { error: 'Sign in to create AI ad ideas.' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  });
  const { data: userData, error: authError } = await supabase.auth.getUser(bearer);
  if (authError || !userData.user) {
    return response(request, { error: 'Your sign-in has expired. Please sign in again.' }, 401);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return response(request, { error: 'The ad details are too long.' }, 413);
  }

  let input: Record<string, unknown>;
  try {
    const requestBody = await request.text();
    if (new TextEncoder().encode(requestBody).length > MAX_REQUEST_BYTES) {
      return response(request, { error: 'The ad details are too long.' }, 413);
    }
    const parsedBody: unknown = JSON.parse(requestBody);
    if (!isRecord(parsedBody)) {
      return response(request, { error: 'The ad details must be sent as an object.' }, 400);
    }
    input = parsedBody;
  } catch {
    return response(request, { error: 'The ad details could not be read.' }, 400);
  }

  const language = input.language;
  const images = readImageInputs(input.images);
  if (
    !readText(input.businessName, 100) ||
    !readText(input.category, 100) ||
    !readText(input.city, 100) ||
    !readText(input.offer, 500) ||
    !readText(input.tone, 30) ||
    typeof language !== 'string' ||
    !Object.prototype.hasOwnProperty.call(LANGUAGES, language) ||
    (input.area !== undefined && typeof input.area !== 'string') ||
    (typeof input.area === 'string' && input.area.length > 100) ||
    images === null
  ) {
    return response(request, { error: 'Check the business, offer, photos, and language fields.' }, 400);
  }

  const { data: remainingAfterAttempt, error: quotaError } = await supabase.rpc('consume_ad_generation');
  if (quotaError) {
    console.error('Could not check the AI usage limit:', quotaError.message);
    return response(request, { error: 'Could not check the daily AI limit. Try again later.' }, 503);
  }
  if (typeof remainingAfterAttempt !== 'number' || remainingAfterAttempt < 0) {
    return response(request, {
      error: 'You have used today’s 25 AI attempts. Try again tomorrow.',
      generationsRemainingToday: 0,
    }, 429);
  }

  const outputLanguage = LANGUAGES[language as LanguageCode];
  let textResponse: Response;
  try {
    const model = Deno.env.get('GEMINI_TEXT_MODEL') || 'gemini-3.8-flash';
    textResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': geminiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `Write three short, natural WhatsApp ad ideas in ${outputLanguage}. Use the requested language and its native script, not English transliteration. Honor the requested tone. Keep each headline under 100 characters, body under 500 characters, and button label under 60 characters. Use only the business facts and offer provided. Uploaded photos provide visual context only; do not infer or invent business services, prices, discounts, guarantees, credentials, or availability from them. Keep the button label brief and appropriate for a WhatsApp enquiry.`,
            }],
          },
          contents: [{
            role: 'user',
            parts: [
              {
                text: JSON.stringify({
              business: input.businessName,
              type: input.category,
              city: input.city,
              area: input.area || '',
              offer: input.offer,
              tone: input.tone,
              photosProvided: images.length,
                }),
              },
              ...images.map((image) => ({
                inlineData: { mimeType: image.mimeType, data: image.data },
              })),
            ],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                ads: {
              type: 'ARRAY',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'OBJECT',
                properties: {
                  headline: { type: 'STRING' },
                  body: { type: 'STRING' },
                  button: { type: 'STRING' },
                },
                required: ['headline', 'body', 'button'],
              },
                },
              },
              required: ['ads'],
            },
          },
        }),
      }
    );
  } catch (error) {
    console.error('Gemini text generation request failed:', error);
    return response(request, { error: 'Could not reach the ad-text service. Try again later.' }, 502);
  }

  if (!textResponse.ok) {
    const providerResponse = await textResponse.text();
    let providerMessage = providerResponse.slice(0, 500);
    try {
      const providerError: unknown = JSON.parse(providerResponse);
      if (
        typeof providerError === 'object' &&
        providerError !== null &&
        'error' in providerError &&
        typeof providerError.error === 'object' &&
        providerError.error !== null &&
        'message' in providerError.error &&
        typeof providerError.error.message === 'string'
      ) {
        providerMessage = providerError.error.message;
      }
    } catch {
      providerMessage = providerResponse.slice(0, 500);
    }

    console.error(
      'Gemini text generation failed with status:',
      textResponse.status,
      providerMessage.slice(0, 500)
    );
    return response(request, {
      error: textResponse.status === 404
        ? 'The configured Gemini model was not found. Check the GEMINI_TEXT_MODEL setting in Supabase.'
        : 'Could not create ad text. Check the Gemini error in the Edge Function logs.',
    }, 502);
  }

  let textData: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  try {
    textData = await textResponse.json();
  } catch (error) {
    console.error('Gemini text generation returned unreadable data:', error);
    return response(request, { error: 'The ad-text service returned an unreadable response.' }, 502);
  }
  const content = textData.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('');
  if (!content) {
    console.error('Gemini text generation returned no ad text.');
    return response(request, { error: 'The ad-text service returned no ad text.' }, 502);
  }
  let ads: Array<{ headline: string; body: string; button: string }>;
  try {
    const parsed = JSON.parse(content);
    if (
      !Array.isArray(parsed.ads) ||
      parsed.ads.length !== 3 ||
      parsed.ads.some(
        (ad: unknown) =>
          typeof ad !== 'object' ||
          ad === null ||
          !('headline' in ad) ||
          !readText(ad.headline, 100) ||
          !('body' in ad) ||
          !readText(ad.body, 500) ||
          !('button' in ad) ||
          !readText(ad.button, 60)
      )
    ) {
      throw new Error('The model returned invalid ad text.');
    }
    ads = parsed.ads;
  } catch (error) {
    console.error('Gemini returned invalid ad text:', error);
    return response(request, { error: 'The ad text was not in a usable format. Try again.' }, 502);
  }

  const imagePrompt = [
    'Create a polished, realistic promotional photograph for a small Indian local business using the uploaded photos as visual references when provided.',
    `Business type: ${input.category}.`,
    `Offer context: ${input.offer}.`,
    `Location context: ${input.area || input.city}, ${input.city}.`,
    'Show a relevant real-world scene with a warm, welcoming feel and leave clean space for an ad headline.',
    'Do not include text, letters, logos, watermarks, prices, or signage.',
  ].join(' ');
  const imageFailure = (message: string) => response(request, {
    ads,
    imageDataUrl: null,
    imageError: message,
    language: language as LanguageCode,
    generationsRemainingToday: remainingAfterAttempt,
  });

  let imageResponse: Response;
  try {
    const model = Deno.env.get('GEMINI_IMAGE_MODEL') || 'gemini-3-pro-image';
    imageResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': geminiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: imagePrompt },
              ...images.map((image) => ({
                inlineData: { mimeType: image.mimeType, data: image.data },
              })),
            ],
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );
  } catch (error) {
    console.error('Gemini image generation request failed:', error);
    return imageFailure('Could not reach the image service. Your ad text is ready.');
  }

  if (!imageResponse.ok) {
    console.error('Gemini image generation failed with status:', imageResponse.status);
    return imageFailure('Could not create the ad image. Your ad text is ready.');
  }

  let imageData: {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
    }>;
  };
  try {
    imageData = await imageResponse.json();
  } catch (error) {
    console.error('Gemini image generation returned unreadable data:', error);
    return imageFailure('The image service returned an unreadable response. Your ad text is ready.');
  }
  const imagePart = imageData.candidates?.[0]?.content?.parts
    ?.find((part) => typeof part.inlineData?.data === 'string');
  const imageBase64 = imagePart?.inlineData?.data;
  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
    console.error('Gemini image generation returned no image data.');
    return imageFailure('The image service returned no image. Your ad text is ready.');
  }

  return response(request, {
    ads,
    imageDataUrl: `data:${imagePart?.inlineData?.mimeType || 'image/png'};base64,${imageBase64}`,
    language: language as LanguageCode,
    generationsRemainingToday: remainingAfterAttempt,
  });
});
