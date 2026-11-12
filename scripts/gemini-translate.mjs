import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const KEY_FILE = path.join(ROOT, 'scripts', 'i18n-keys.json');
const CACHE_DIR = path.join(ROOT, 'scripts', 'i18n-cache');
const OUT_DIR = path.join(ROOT, 'src', 'i18n', 'content');

const LANGS = [
  { code: 'hi', name: 'Hindi', script: 'Devanagari script' },
  { code: 'bn', name: 'Bengali', script: 'Bengali script' },
  { code: 'ta', name: 'Tamil', script: 'Tamil script' },
  { code: 'te', name: 'Telugu', script: 'Telugu script' },
  { code: 'mr', name: 'Marathi', script: 'Devanagari script' },
  { code: 'ur', name: 'Urdu', script: 'Urdu Arabic script, right to left' },
  { code: 'ml', name: 'Malayalam', script: 'Malayalam script' },
  { code: 'pa', name: 'Punjabi', script: 'Gurmukhi script' },
  { code: 'gu', name: 'Gujarati', script: 'Gujarati script' },
  { code: 'kn', name: 'Kannada', script: 'Kannada script' },
  { code: 'sd', name: 'Sindhi', script: 'Sindhi Arabic script, right to left' },
  { code: 'as', name: 'Assamese', script: 'Assamese script' },
];

const MODEL = process.env.GEMINI_TRANSLATE_MODEL || 'gemini-3.8-flash';
const API_KEY = process.env.GEMINI_API_KEY;
const FORCE = process.argv.includes('--force');
const BATCH_SIZE = Number(process.env.GEMINI_TRANSLATE_BATCH || 30);
const BRANDS = ['AdMitra', 'WhatsApp', 'Google Search', 'Google Business Profile', 'Google Analytics 4', 'GA4', 'Instagram', 'Facebook', 'Meta', 'Google'];
const PLACEHOLDER = /\{[A-Za-z0-9_]+\}/g;

if (!API_KEY) {
  console.error(
    'GEMINI_API_KEY is not set. Run with:\n  GEMINI_API_KEY=... node scripts/gemini-translate.mjs',
  );
  process.exit(1);
}
if (!fs.existsSync(KEY_FILE)) {
  console.error('Missing scripts/i18n-keys.json. Run `node scripts/extract-i18n-keys.mjs` first.');
  process.exit(1);
}

const keys = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const placeholders = (text) => (text.match(PLACEHOLDER) || []).sort().join('|');

const samePlaceholders = (source, translated) => placeholders(source) === placeholders(translated);

const keepsBrands = (source, translated) =>
  BRANDS.every((brand) => !source.includes(brand) || translated.includes(brand));

function buildPrompt(lang, batch) {
  const items = Object.fromEntries(batch.map((key, index) => [String(index), key]));
  return [
    `Translate the English interface strings below into ${lang.name} (${lang.script}).`,
    'The reader is a local small-business owner in India: a salon, restaurant, coaching centre or small shop.',
    'Use simple, everyday words. Avoid technical jargon, loanwords and corporate language.',
    'Keep the meaning, tone and level of detail. Do not add explanations.',
    'Keep every placeholder such as {name}, {amount} or {0} exactly as written, in the same order.',
    `Keep these names unchanged: ${BRANDS.join(', ')}.`,
    'Return only a JSON object whose keys are the same numbers and whose values are the translations.',
    'Do not wrap the JSON in markdown fences.',
    '',
    JSON.stringify(items, null, 0),
  ].join('\n');
}

async function callGemini(lang, batch, attempt = 0) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(lang, batch) }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
      }),
      signal: AbortSignal.timeout(90_000),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < 5) {
      const wait = Math.min(30_000, 1000 * 2 ** attempt);
      console.warn(`  ${lang.code}: HTTP ${response.status}, retrying in ${wait / 1000}s`);
      await sleep(wait);
      return callGemini(lang, batch, attempt + 1);
    }
    throw new Error(`Gemini HTTP ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    if (attempt < 5) {
      console.warn(`  ${lang.code}: invalid JSON, retrying`);
      await sleep(1000 * 2 ** attempt);
      return callGemini(lang, batch, attempt + 1);
    }
    throw error;
  }
  return parsed;
}

async function translateBatch(lang, batch) {
  const parsed = await callGemini(lang, batch);
  const result = {};
  const retry = [];

  batch.forEach((source, index) => {
    const value = parsed[String(index)];
    if (
      typeof value !== 'string' ||
      !value.trim() ||
      !samePlaceholders(source, value) ||
      !keepsBrands(source, value)
    ) {
      retry.push(source);
    } else {
      result[source] = value.trim();
    }
  });

  for (const source of retry) {
    try {
      const single = await callGemini(lang, [source]);
      const value = single['0'];
      if (
        typeof value === 'string' &&
        value.trim() &&
        samePlaceholders(source, value) &&
        keepsBrands(source, value)
      ) {
        result[source] = value.trim();
      }
    } catch {
      // Leave the key out so the UI falls back to English.
    }
    await sleep(150);
  }

  return result;
}

function emit(langCode, dictionary) {
  const lines = [];
  for (const key of keys) {
    const value = dictionary[key];
    if (typeof value === 'string' && value.trim()) {
      lines.push('  ' + JSON.stringify(key) + ': ' + JSON.stringify(value) + ',');
    }
  }
  const out =
    '// Generated with Gemini. Do not edit by hand.\n' +
    'const content: Record<string, string> = {\n' +
    lines.join('\n') +
    '\n};\n\nexport default content;\n';
  fs.writeFileSync(path.join(OUT_DIR, `${langCode}.ts`), out);
  return lines.length;
}

for (const lang of LANGS) {
  const cacheFile = path.join(CACHE_DIR, `${lang.code}.json`);
  let dictionary = {};
  if (!FORCE && fs.existsSync(cacheFile)) {
    dictionary = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  const todo = keys.filter((key) => !dictionary[key]);
  console.log(`${lang.code}: ${todo.length} strings to translate`);

  for (let start = 0; start < todo.length; start += BATCH_SIZE) {
    const batch = todo.slice(start, start + BATCH_SIZE);
    try {
      const translated = await translateBatch(lang, batch);
      Object.assign(dictionary, translated);
    } catch (error) {
      console.error(`  ${lang.code}: batch failed — ${error.message}`);
    }
    fs.writeFileSync(cacheFile, JSON.stringify(dictionary, null, 2));
    const done = Math.min(todo.length, start + batch.length);
    if (done % (BATCH_SIZE * 5) === 0 || done === todo.length) {
      console.log(`  ${lang.code}: ${done}/${todo.length}`);
    }
    await sleep(200);
  }

  const count = emit(lang.code, dictionary);
  console.log(`${lang.code}: wrote ${count}/${keys.length} entries`);
}

console.log('Done. Run `npx tsc --noEmit` to check the app.');
