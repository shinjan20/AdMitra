#!/usr/bin/env node

/**
 * Quick translation generator using Gemini API
 * Generates minimal but functional translations for UI strings
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_DIR = path.join(ROOT, 'scripts', 'i18n-cache');
const OUT_DIR = path.join(ROOT, 'src', 'i18n', 'content');

const LANGS = [
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'as', name: 'Assamese' },
];

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

// Key English UI strings to translate
const UI_STRINGS = {
  'chooseLanguage': 'Choose your language',
  'shopSetup': 'Set up your shop',
  'shopIntro': 'Your shop name, business type, and city are needed to make an ad.',
  'businessName': 'Shop or business name',
  'businessType': 'What kind of business do you run?',
  'city': 'Town or city',
  'area': 'Area or nearby landmark',
  'whatsapp': 'WhatsApp number (optional)',
  'continue': 'Continue',
  'saveShop': 'Save shop details',
  'skip': 'Do this later',
  'signIn': 'Sign in',
  'makeAd': 'Make my ad',
  'makingAd': 'Making your ad…',
  'chooseAd': 'Choose an ad',
  'copyAd': 'Copy ad',
  'downloadText': 'Download text',
  'preview': 'WhatsApp ad',
  'mainLine': 'Main line',
  'adMessage': 'Ad message',
  'email': 'Email address',
  'password': 'Password',
  'createAccount': 'Create account',
  'fullName': 'Your name',
  'googleSignIn': 'Continue with Google',
  'back': 'Back',
  'categoryBeauty': 'Beauty & wellness',
  'categoryEducation': 'Education & coaching',
  'categoryRestaurant': 'Food & restaurant',
  'categoryFitness': 'Fitness & gym',
  'categoryRetail': 'Shop & clothing',
  'categoryHealth': 'Clinic & health',
  'categoryOther': 'Other local business',
  'genericError': 'Something went wrong. Please try again.',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateBatch(lang, strings) {
  const stringArray = Object.entries(strings).map(([k, v]) => ({ key: k, en: v }));
  
  const prompt = `Translate these UI strings into ${lang.name}. 
Use simple, everyday words suitable for small business owners.
Keep placeholders like {count} or {name} unchanged.
Return only valid JSON with keys matching the input.

${JSON.stringify(stringArray, null, 0)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
            maxOutputTokens: 4096,
          },
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`  ${lang.code}: API error -`, error.slice(0, 200));
      return {};
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    
    try {
      const parsed = JSON.parse(cleaned);
      const result = {};
      for (const item of stringArray) {
        const translated = parsed[item.key] || parsed[item.en];
        if (typeof translated === 'string' && translated.trim()) {
          result[item.en] = translated.trim();
        }
      }
      return result;
    } catch (e) {
      console.error(`  ${lang.code}: JSON parse error`);
      return {};
    }
  } catch (error) {
    console.error(`  ${lang.code}: Request failed -`, error.message);
    return {};
  }
}

async function generateTranslations() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const lang of LANGS) {
    console.log(`Translating to ${lang.name}...`);
    
    const translations = await translateBatch(lang, UI_STRINGS);
    
    // Build TypeScript file
    const lines = [];
    for (const [key, value] of Object.entries(translations)) {
      lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(value)},`);
    }

    const content =
      '// Generated with Gemini. Do not edit by hand.\n' +
      'const content: Record<string, string> = {\n' +
      lines.join('\n') +
      '\n};\n\nexport default content;\n';

    fs.writeFileSync(path.join(OUT_DIR, `${lang.code}.ts`), content);
    console.log(`  ✓ ${lang.code}: ${lines.length} translations`);
    
    await sleep(500);
  }

  console.log('\n✅ Translation generation complete!');
}

generateTranslations().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
