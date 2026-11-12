import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

const IMAGE_ENDPOINT = '/api/generate-ad-image';
const MAX_BODY_BYTES = 8_000_000;
const MAX_REFERENCE_BYTES = 4_000_000;
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const plainErrors: Record<string, string> = {
  not_configured:
    'The picture maker is not switched on. Add a Google Gemini key to the server settings to switch it on.',
  busy: 'Google is busy right now. Please try again in a minute.',
  blocked: 'Google could not make a picture from those words. Try different words or another photo.',
  no_image: 'No picture came back. Please try again.',
  rate_limited: 'Too many pictures in a short time. Please wait a few minutes and try again.',
  plan:
    'Picture making is not included in this Google Gemini plan yet. The site owner needs to switch it on in Google AI Studio.',
  too_large: 'That photo is too large. Try a smaller one.',
  bad_request: 'Something in the request was missing. Please try again.',
  upstream: 'The picture could not be made just now. Please try again.',
};

const referenceTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

interface AdImageRequestBody {
  businessName?: unknown;
  category?: unknown;
  city?: unknown;
  area?: unknown;
  offer?: unknown;
  headline?: unknown;
  description?: unknown;
  cta?: unknown;
  tone?: unknown;
  referenceImage?: { mimeType?: unknown; data?: unknown } | null;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

function sendError(res: ServerResponse, status: number, code: keyof typeof plainErrors) {
  sendJson(res, status, { error: { code, message: plainErrors[code] } });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let stopped = false;
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      if (stopped) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        stopped = true;
        reject(new Error('too_large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (stopped) return;
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function buildPrompt(body: Required<Pick<AdImageRequestBody, 'businessName' | 'category' | 'city'>> & {
  area: string;
  offer: string;
  headline: string;
  description: string;
  tone: string;
  hasReference: boolean;
}): string {
  const placement = [body.area, body.city].filter(Boolean).join(', ');

  return [
    'Make one photograph for a small local business advertisement in India.',
    'The business will place its own words over the lower part of the picture, so keep the lower third calm and uncluttered.',
    '',
    `Business: ${body.businessName}`,
    `Type of business: ${body.category}`,
    `Place: ${placement}`,
    `What they are offering: ${body.offer || body.description || body.headline}`,
    `The ad's main line: ${body.headline}`,
    `Extra detail: ${body.description}`,
    `Mood: ${body.tone || 'Friendly'}`,
    '',
    'Make a warm, believable, well-lit photograph of the kind a good local photographer would take for this business.',
    'Show the product, the place, or people using the service, whichever fits this business best.',
    'It should look like a real small business in India, not a foreign stock photo.',
    '',
    'Rules:',
    '- No text, letters, numbers, captions, price tags, watermarks or logos anywhere in the picture.',
    '- Do not invent brand names, awards, prices or claims.',
    '- Do not show anything that would be misleading about what the business actually offers.',
    '- Photorealistic, natural light, rich but true colour, shallow depth of field, sharp subject.',
    '- Leave breathing space at the bottom for text.',
    body.hasReference
      ? '- Use the attached photograph as the real starting point: keep the same shop, products and people. Improve the lighting, framing and colour. Do not add or remove people.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildGeminiPayload(prompt: string, reference: { mimeType: string; data: string } | null) {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (reference) {
    parts.push({ inline_data: { mime_type: reference.mimeType, data: reference.data } });
  }
  return {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '16:9' },
    },
  };
}

function findImage(payload: any): { data: string; mimeType: string } | null {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  for (const part of parts) {
    const inline = part?.inlineData || part?.inline_data;
    if (inline?.data) {
      return {
        data: String(inline.data),
        mimeType: typeof inline.mimeType === 'string' ? inline.mimeType : 'image/png',
      };
    }
  }
  return null;
}

function createRateLimiter() {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string): boolean => {
    const now = Date.now();
    const current = hits.get(key);
    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      if (hits.size > 500) {
        for (const [entryKey, entry] of hits) {
          if (entry.resetAt <= now) hits.delete(entryKey);
        }
      }
      return true;
    }
    if (current.count >= RATE_LIMIT_MAX) return false;
    current.count += 1;
    return true;
  };
}

/**
 * Keeps the Gemini key on the machine that serves the app. The browser only ever
 * talks to this endpoint, so the key never appears in the client bundle.
 */
function adImageApi(apiKey: string, model: string): Plugin {
  const allowRequest = createRateLimiter();

  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === 'GET') {
      sendJson(res, 200, { ready: Boolean(apiKey), model });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('allow', 'GET, POST, OPTIONS');
      sendError(res, 405, 'bad_request');
      return;
    }

    if (!apiKey) {
      sendError(res, 503, 'not_configured');
      return;
    }

    const clientKey = req.socket.remoteAddress || 'local';
    if (!allowRequest(clientKey)) {
      sendError(res, 429, 'rate_limited');
      return;
    }

    let raw: string;
    try {
      raw = await readBody(req);
    } catch {
      sendError(res, 413, 'too_large');
      return;
    }

    let body: AdImageRequestBody;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      sendError(res, 400, 'bad_request');
      return;
    }

    const businessName = text(body.businessName, 120);
    const category = text(body.category, 80);
    const city = text(body.city, 80);
    const area = text(body.area, 80);
    const offer = text(body.offer, 500);
    const headline = text(body.headline, 140);
    const description = text(body.description, 700);
    const tone = text(body.tone, 40);

    if (!businessName || !category || !city || (!offer && !headline)) {
      sendError(res, 400, 'bad_request');
      return;
    }

    let reference: { mimeType: string; data: string } | null = null;
    const referenceImage = body.referenceImage;
    if (referenceImage && typeof referenceImage.data === 'string') {
      const mimeType = text(referenceImage.mimeType, 40).toLowerCase();
      const data = referenceImage.data.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
      if (!referenceTypes.has(mimeType) || !/^[A-Za-z0-9+/]+=*$/.test(data.slice(0, 200))) {
        sendError(res, 400, 'bad_request');
        return;
      }
      if (Math.ceil((data.length * 3) / 4) > MAX_REFERENCE_BYTES) {
        sendError(res, 413, 'too_large');
        return;
      }
      reference = { mimeType, data };
    }

    const prompt = buildPrompt({
      businessName,
      category,
      city,
      area,
      offer,
      headline,
      description,
      tone,
      hasReference: Boolean(reference),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      const call = (includeAspect: boolean) => {
        const payload = buildGeminiPayload(prompt, reference);
        if (!includeAspect) delete (payload.generationConfig as Record<string, unknown>).imageConfig;
        return fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        );
      };

      let response = await call(true);
      if (response.status === 400) {
        // Older image models reject imageConfig; try once without it.
        response = await call(false);
      }

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error('[ad image] Gemini returned', response.status, detail.slice(0, 600));
        if (response.status === 429) {
          if (/limit:\s*0\b/.test(detail)) {
            sendError(res, 503, 'plan');
            return;
          }
          sendError(res, 429, 'busy');
          return;
        }
        sendError(res, 502, 'upstream');
        return;
      }

      const payload = await response.json().catch(() => null);
      const image = findImage(payload);
      if (!image) {
        const blocked = JSON.stringify(payload?.promptFeedback ?? '') + JSON.stringify(payload?.candidates?.[0]?.finishReason ?? '');
        console.error('[ad image] Gemini returned no image', blocked.slice(0, 300));
        sendError(res, 502, blocked.includes('SAFETY') || blocked.includes('blocked') ? 'blocked' : 'no_image');
        return;
      }

      sendJson(res, 200, {
        imageDataUrl: `data:${image.mimeType};base64,${image.data}`,
        model,
      });
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      console.error('[ad image] request failed:', aborted ? 'timed out' : error);
      sendError(res, aborted ? 504 : 502, 'upstream');
    } finally {
      clearTimeout(timeout);
    }
  };

  return {
    name: 'admitra-ad-image-api',
    configureServer(server) {
      server.middlewares.use(IMAGE_ENDPOINT, handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(IMAGE_ENDPOINT, handler);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = (env.GEMINI_API_KEY || '').trim();
  const model = (env.GEMINI_IMAGE_MODEL || '').trim() || 'gemini-2.5-flash-image';

  return {
    plugins: [react(), adImageApi(apiKey, model)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: true,
    },
  };
});
