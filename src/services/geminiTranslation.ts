import { AppLanguage } from './language';

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const CACHE_PREFIX = 'gemini-trans:';
const CACHE_VERSION = 'v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface TranslationCache {
  translation: string;
  timestamp: number;
  version: string;
}

// Language names for Gemini prompts
const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: 'English',
  hi: 'Hindi (Hinglish, natural Indian Hindi)',
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
};

/**
 * Translate text using Gemini API with caching
 */
export async function translateWithGemini(
  text: string,
  targetLanguage: AppLanguage
): Promise<string> {
  // Skip translation for English
  if (targetLanguage === 'en') {
    return text;
  }

  // Check if API key is available
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, falling back to original text');
    return text;
  }

  // Check cache
  const cacheKey = `${CACHE_PREFIX}${targetLanguage}:${CACHE_VERSION}:${text}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const translation = await callGeminiAPI(text, targetLanguage);
    
    // Cache the result
    saveToCache(cacheKey, translation);
    
    return translation;
  } catch (error) {
    console.error('Gemini translation failed:', error);
    // Fallback to original text on error
    return text;
  }
}

/**
 * Call Gemini API for translation
 */
async function callGeminiAPI(
  text: string,
  targetLanguage: AppLanguage
): Promise<string> {
  const languageName = LANGUAGE_NAMES[targetLanguage];
  
  const prompt = `Translate this UI text to ${languageName}. 
Requirements:
- Keep it concise and natural for Indian users
- Preserve the same tone (friendly, professional, etc.)
- For buttons/CTAs, keep it short (under 15 characters if possible)
- Only return the translation, no explanation
- Do not add quotation marks

Text to translate:
${text}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 256,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  const translatedText = data.candidates[0].content.parts[0].text;
  
  // Clean up the response (remove quotes if present)
  return translatedText.trim().replace(/^["']|["']$/g, '');
}

/**
 * Get translation from cache
 */
function getFromCache(key: string): string | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed: TranslationCache = JSON.parse(cached);
    
    // Check if cache is expired
    const now = Date.now();
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    // Check version
    if (parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.translation;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Save translation to cache
 */
function saveToCache(key: string, translation: string): void {
  try {
    const cacheData: TranslationCache = {
      translation,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache write error:', error);
    // Silently fail - translation still works without cache
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredTranslations(): void {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed: TranslationCache = JSON.parse(cached);
            if (now - parsed.timestamp > CACHE_DURATION || parsed.version !== CACHE_VERSION) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

/**
 * Batch translate multiple strings (for efficiency)
 */
export async function batchTranslateWithGemini(
  texts: string[],
  targetLanguage: AppLanguage
): Promise<string[]> {
  // Skip for English
  if (targetLanguage === 'en') {
    return texts;
  }

  // Process in parallel but use cache to avoid redundant calls
  const translations = await Promise.all(
    texts.map(text => translateWithGemini(text, targetLanguage))
  );

  return translations;
}
