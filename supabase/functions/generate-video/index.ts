import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VIDEO_BUCKET = 'ad-videos';
const MAX_PROMPT_LENGTH = 500;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const localOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

type VideoJobStatus = 'in_progress' | 'completed' | 'failed';

function response(request: Request, body: Record<string, unknown>, status = 200): Response {
  const origin = request.headers.get('origin');
  const configuredOrigin = Deno.env.get('APP_ORIGIN');
  const allowedOrigins = [...localOrigins, configuredOrigin].filter(Boolean);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function readProviderError(value: unknown): string {
  if (!isRecord(value)) return '';
  const details: string[] = [];
  const diagnosticKeys = /^(errors?|failure|failure_reason|failureReason|reason|cause|detail|details|code)$/i;

  const collect = (candidate: unknown, depth: number, diagnostic = false) => {
    if (depth > 4 || details.length >= 5) return;
    if (diagnostic && (typeof candidate === 'string' || typeof candidate === 'number')) {
      details.push(String(candidate).slice(0, 300));
      return;
    }
    if (Array.isArray(candidate)) {
      candidate.slice(0, 10).forEach((item) => collect(item, depth + 1, diagnostic));
      return;
    }
    if (!isRecord(candidate)) return;

    for (const [key, nested] of Object.entries(candidate)) {
      if (diagnosticKeys.test(key) || (key === 'message' && depth > 0)) {
        if (typeof nested === 'string' || typeof nested === 'number') {
          details.push(`${key}: ${String(nested).slice(0, 300)}`);
        } else {
          collect(nested, depth + 1, true);
        }
      } else if (diagnostic && (key === 'type' || key === 'status')) {
        if (typeof nested === 'string' || typeof nested === 'number') {
          details.push(`${key}: ${String(nested).slice(0, 300)}`);
        }
      }
      if (details.length >= 5) return;
    }
  };

  for (const [key, nested] of Object.entries(value)) {
    if (diagnosticKeys.test(key)) collect(nested, 1, true);
    if (details.length >= 5) break;
  }
  if (details.length === 0 && 'error' in value && isRecord(value.error)) {
    const message = value.error.message;
    if (typeof message === 'string') details.push(message.slice(0, 300));
  }
  return [...new Set(details)].join('; ').slice(0, 500);
}

async function getSignedVideoUrl(
  supabase: ReturnType<typeof createClient>,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);
  if (error || !data?.signedUrl) {
    console.error('Could not create a signed URL for the generated ad video:', error?.message);
    throw new Error('The video is ready, but its download link could not be created.');
  }
  return data.signedUrl;
}

async function handleStart(
  request: Request,
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  userId: string,
  geminiKey: string
): Promise<Response> {
  if (
    !isText(input.businessName, 100) ||
    !isText(input.category, 100) ||
    !isText(input.city, 100) ||
    !isText(input.offer, MAX_PROMPT_LENGTH) ||
    (input.style !== undefined && (typeof input.style !== 'string' || input.style.length > MAX_PROMPT_LENGTH))
  ) {
    return response(request, { error: 'Check the shop, offer, and video direction.' }, 400);
  }

  const { data: remaining, error: quotaError } = await supabase.rpc('consume_video_generation');
  if (quotaError) {
    console.error('Could not check the video-generation limit:', quotaError.message);
    return response(request, { error: 'Could not check the daily video limit. Try again later.' }, 503);
  }
  if (typeof remaining !== 'number' || remaining < 0) {
    return response(request, {
      error: 'You have used today’s 25 video attempts. Try again tomorrow.',
      generationsRemainingToday: 0,
    }, 429);
  }

  const prompt = [
    `Create an 8-second vertical social video ad for ${input.businessName}, a ${input.category} business in ${input.city}.`,
    `The real offer or service to communicate is: ${input.offer.trim()}.`,
    typeof input.style === 'string' && input.style.trim()
      ? `Visual direction from the business owner: ${input.style.trim()}.`
      : 'Use a warm, inviting, locally relevant visual style.',
    'Show a simple, believable scene suitable for a small Indian business. Do not invent prices, discounts, guarantees, services, credentials, or availability.',
    'Do not render text, captions, logos, watermarks, or signage in the video. The business owner will add their own text before sharing.',
  ].join(' ');

  let providerResponse: Response;
  try {
    providerResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-omni-1.2-flash',
        input: prompt,
        background: true,
        response_format: {
          type: 'video',
          aspect_ratio: '9:16',
          duration: '8s',
        },
      }),
    });
  } catch (error) {
    console.error('Gemini video generation request failed:', error);
    return response(request, { error: 'Could not reach the video service. Try again later.' }, 502);
  }
  if (!providerResponse.ok) {
    console.error('Gemini video generation failed with status:', providerResponse.status);
    return response(request, { error: 'Could not start video creation. Try again later.' }, 502);
  }

  let providerData: unknown;
  try {
    providerData = await providerResponse.json();
  } catch (error) {
    console.error('Gemini video generation returned unreadable data:', error);
    return response(request, { error: 'The video service returned an unreadable response.' }, 502);
  }
  if (!isRecord(providerData) || typeof providerData.id !== 'string' || !providerData.id) {
    console.error('Gemini video generation did not return an interaction ID.');
    return response(request, { error: 'The video service did not start a generation.' }, 502);
  }

  const interactionId = providerData.id;
  const { error: jobError } = await supabase.from('ad_video_jobs').insert({
    interaction_id: interactionId,
    user_id: userId,
    status: 'in_progress',
  });
  if (jobError) {
    console.error('Could not save the video-generation job:', jobError.message);
    return response(request, { error: 'Could not save the video-generation request.' }, 503);
  }

  return response(request, {
    interactionId,
    state: 'pending',
    generationsRemainingToday: remaining,
  });
}

async function handlePoll(
  request: Request,
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  userId: string,
  geminiKey: string
): Promise<Response> {
  const interactionId = input.interactionId;
  if (
    typeof interactionId !== 'string' ||
    interactionId.length > 200 ||
    !/^[A-Za-z0-9_-]+$/.test(interactionId)
  ) {
    return response(request, { error: 'The video request could not be found.' }, 400);
  }

  const { data: job, error: jobError } = await supabase
    .from('ad_video_jobs')
    .select('status, storage_path')
    .eq('interaction_id', interactionId)
    .eq('user_id', userId)
    .maybeSingle();
  if (jobError) {
    console.error('Could not look up the video-generation job:', jobError.message);
    return response(request, { error: 'Could not check video progress. Try again.' }, 503);
  }
  if (!job) return response(request, { error: 'The video request could not be found.' }, 404);
  if (job.status === 'failed') {
    return response(request, { state: 'failed', error: 'The video could not be created. Try again.' });
  }
  if (job.status === 'completed' && job.storage_path) {
    return response(request, {
      state: 'complete',
      videoUrl: await getSignedVideoUrl(supabase, job.storage_path),
    });
  }

  let providerResponse: Response;
  try {
    providerResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/interactions/${encodeURIComponent(interactionId)}`,
      {
        headers: {
          'x-goog-api-key': geminiKey,
          'Api-Revision': '2026-05-20',
        },
      }
    );
  } catch (error) {
    console.error('Could not check Gemini video progress:', error);
    return response(request, { error: 'Could not check video progress. Try again.' }, 502);
  }
  if (!providerResponse.ok) {
    console.error('Gemini video status request failed with status:', providerResponse.status);
    return response(request, { error: 'Could not check video progress. Try again.' }, 502);
  }

  let providerData: unknown;
  try {
    providerData = await providerResponse.json();
  } catch (error) {
    console.error('Gemini video status returned unreadable data:', error);
    return response(request, { error: 'The video service returned unreadable progress.' }, 502);
  }
  if (!isRecord(providerData) || typeof providerData.status !== 'string') {
    console.error('Gemini video status returned an invalid response.');
    return response(request, { error: 'The video service returned invalid progress.' }, 502);
  }
  if (providerData.status === 'in_progress' || providerData.status === 'queued') {
    return response(request, { state: 'pending' });
  }
  if (providerData.status !== 'completed') {
    const providerMessage = readProviderError(providerData);
    console.error(
      'Gemini video generation ended with status:',
      providerData.status,
      providerMessage || 'No failure details were included.',
      'Response fields:',
      Object.keys(providerData).join(', ')
    );
    await supabase
      .from('ad_video_jobs')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('interaction_id', interactionId)
      .eq('user_id', userId);
    return response(request, {
      state: 'failed',
      error: providerMessage
        ? `The video service reported: ${providerMessage}`
        : 'The video could not be created. Check the generate-video function logs for the provider status.',
    });
  }

  const steps = Array.isArray(providerData.steps) ? providerData.steps : [];
  const videoOutput = steps
    .filter(isRecord)
    .flatMap((step) => Array.isArray(step.content) ? step.content : [])
    .find((part) =>
      isRecord(part) &&
      part.type === 'video' &&
      part.mime_type === 'video/mp4' &&
      typeof part.data === 'string'
    );
  if (!isRecord(videoOutput) || typeof videoOutput.data !== 'string') {
    console.error('Gemini completed video generation without an MP4 output.');
    return response(request, { error: 'The video service returned no usable video.' }, 502);
  }
  const videoBase64 = videoOutput.data;
  if (
    videoBase64.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(videoBase64) ||
    videoBase64.length > Math.ceil(MAX_VIDEO_BYTES * 4 / 3)
  ) {
    console.error('Gemini returned an invalid or oversized video.');
    return response(request, { error: 'The generated video is too large or could not be read.' }, 502);
  }

  const videoBytes = Uint8Array.from(atob(videoBase64), (character) => character.charCodeAt(0));
  const storagePath = `${userId}/${interactionId}.mp4`;
  const { error: uploadError } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(storagePath, videoBytes, { contentType: 'video/mp4', upsert: true });
  if (uploadError) {
    console.error('Could not save the generated ad video:', uploadError.message);
    return response(request, { error: 'The video was created but could not be saved. Try again.' }, 503);
  }

  const { error: updateError } = await supabase
    .from('ad_video_jobs')
    .update({
      status: 'completed' as VideoJobStatus,
      storage_path: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq('interaction_id', interactionId)
    .eq('user_id', userId);
  if (updateError) {
    console.error('Could not update the completed video job:', updateError.message);
    return response(request, { error: 'The video was saved but could not be finalized.' }, 503);
  }

  return response(request, {
    state: 'complete',
    videoUrl: await getSignedVideoUrl(supabase, storagePath),
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin');
  const configuredOrigin = Deno.env.get('APP_ORIGIN');
  const allowedOrigins = [...localOrigins, configuredOrigin].filter(Boolean);

  if (request.method === 'OPTIONS') {
    if (origin && !allowedOrigins.includes(origin)) {
      return response(request, { error: 'Origin not allowed.' }, 403);
    }
    const headers: Record<string, string> = {
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    };
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return response(request, { error: 'Use POST to create or check a video.' }, 405);
  }
  if (origin && !allowedOrigins.includes(origin)) {
    return response(request, { error: 'Origin not allowed.' }, 403);
  }

  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!geminiKey || !supabaseUrl || !supabaseAnonKey) {
    return response(request, { error: 'The video-generation service is not configured yet.' }, 503);
  }

  const authorization = request.headers.get('authorization');
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!bearer) return response(request, { error: 'Sign in to create a video.' }, 401);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  });
  const { data: userData, error: authError } = await supabase.auth.getUser(bearer);
  if (authError || !userData.user) {
    return response(request, { error: 'Your sign-in has expired. Please sign in again.' }, 401);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 20_000) {
    return response(request, { error: 'The video details are too long.' }, 413);
  }

  let input: Record<string, unknown>;
  try {
    const requestBody = await request.text();
    if (new TextEncoder().encode(requestBody).length > 20_000) {
      return response(request, { error: 'The video details are too long.' }, 413);
    }
    const body: unknown = JSON.parse(requestBody);
    if (!isRecord(body)) return response(request, { error: 'The video details must be sent as an object.' }, 400);
    input = body;
  } catch {
    return response(request, { error: 'The video details could not be read.' }, 400);
  }

  if (input.action === 'start') {
    return handleStart(request, input, supabase, userData.user.id, geminiKey);
  }
  if (input.action === 'poll') {
    return handlePoll(request, input, supabase, userData.user.id, geminiKey);
  }
  return response(request, { error: 'Choose a video action to continue.' }, 400);
});
