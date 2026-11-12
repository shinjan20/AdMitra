import { AppLanguage } from './language';

export type ContentTranslations = Record<string, string>;
type GeneratedLanguage = Exclude<AppLanguage, 'en'>;

const dictionaryLoaders: Record<GeneratedLanguage, () => Promise<{ default: ContentTranslations }>> = {
  hi: () => import('../i18n/content/hi'),
  bn: () => import('../i18n/content/bn'),
  ta: () => import('../i18n/content/ta'),
  te: () => import('../i18n/content/te'),
  mr: () => import('../i18n/content/mr'),
  ur: () => import('../i18n/content/ur'),
  ml: () => import('../i18n/content/ml'),
  pa: () => import('../i18n/content/pa'),
  gu: () => import('../i18n/content/gu'),
  kn: () => import('../i18n/content/kn'),
  sd: () => import('../i18n/content/sd'),
  as: () => import('../i18n/content/as'),
};

export const EMPTY_CONTENT: ContentTranslations = {};

const dictionaryCache = new Map<AppLanguage, ContentTranslations>();

export async function loadContentDictionary(
  language: AppLanguage,
): Promise<ContentTranslations> {
  if (language === 'en') return EMPTY_CONTENT;

  const cached = dictionaryCache.get(language);
  if (cached) return cached;

  const loaded = (await dictionaryLoaders[language]()).default;
  const dictionary = loaded;

  dictionaryCache.set(language, dictionary);
  return dictionary;
}

const applyValues = (value: string, values?: Record<string, string | number>): string => {
  if (!values) return value;
  return Object.entries(values).reduce(
    (result, [name, replacement]) => result.split(`{${name}}`).join(String(replacement)),
    value,
  );
};

const NUMBER_TOKEN = /\d[\d,]*(?:\.\d+)?/g;
const SENTENCE_TOKEN = /[^.!?]+[.!?]+|\S[^.!?]*$/g;

/**
 * Translates one segment. Numbers are masked before lookup so that sentences
 * built with runtime values (budgets, day counts, enquiry estimates) can still
 * match a stable `{0}`, `{1}` template in the dictionary.
 */
const translateSegment = (
  active: ContentTranslations,
  text: string,
  values?: Record<string, string | number>,
): string | null => {
  const exact = active[text];
  if (exact) return applyValues(exact, values);

  const numbers: string[] = [];
  const masked = text.replace(NUMBER_TOKEN, (match) => {
    numbers.push(match);
    return `{${numbers.length - 1}}`;
  });

  const template = active[masked];
  if (!template) return null;

  const numberValues: Record<string, string> = {};
  numbers.forEach((value, index) => {
    numberValues[String(index)] = value;
  });
  return applyValues(template, { ...numberValues, ...values });
};

export function localizeContent(
  language: AppLanguage,
  text: string,
  values?: Record<string, string | number>,
  dictionary?: ContentTranslations,
): string {
  const active = dictionary ?? dictionaryCache.get(language);
  if (!active) return applyValues(text, values);

  const direct = translateSegment(active, text, values);
  if (direct !== null) return direct;

  // Generated prose (budget rationale, assumptions) joins several sentences
  // with runtime numbers. Localise each sentence that has a dictionary match.
  if (text.length > 40 && (text.match(SENTENCE_TOKEN)?.length ?? 0) > 1) {
    const sentences = text.match(SENTENCE_TOKEN) ?? [];
    const localized = sentences.map((sentence) => {
      const trimmed = sentence.trim();
      const hit = translateSegment(active, trimmed, values);
      return hit ?? trimmed;
    });
    if (localized.some((part, index) => part !== sentences[index].trim())) {
      return localized.join(' ');
    }
  }

  return applyValues(text, values);
}
