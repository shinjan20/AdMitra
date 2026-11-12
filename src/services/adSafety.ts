/**
 * Safety checks for AI ad generation.
 *
 * Pre-generation: detect jailbreak / prompt-injection / policy-bypass attempts in
 * owner-supplied inputs (offer, business context, tone, voice transcript) before anything
 * is sent to the generation service. Uploaded files are treated as visual references only;
 * text fields are treated as ad content, never as instructions.
 *
 * Post-generation: moderate AI-generated copy (claims, impersonation, quality, language)
 * and generated images before they are saved or surfaced to the owner.
 */

export type AdSafetyCode =
  | 'injection'
  | 'input'
  | 'content'
  | 'claim'
  | 'impersonation'
  | 'quality'
  | 'language'
  | 'image';

export interface AdSafetyIssue {
  code: AdSafetyCode;
  message: string;
}

export interface AdSafetyResult {
  ok: boolean;
  issues: AdSafetyIssue[];
}

export interface AdSafetyContext {
  businessName?: string;
  category?: string;
  prohibitedClaims?: string[];
  language?: string;
}

export interface ModerateAdInput {
  headline: string;
  body: string;
  button: string;
}

const MAX_BUSINESS_NAME_LENGTH = 140;
const MAX_CATEGORY_LENGTH = 60;
const MAX_LOCATION_LENGTH = 80;
const MAX_OFFER_LENGTH = 500;
const MAX_TONE_LENGTH = 40;
const MAX_AD_HEADLINE_LENGTH = 120;
const MAX_AD_BODY_LENGTH = 800;
const MAX_AD_BUTTON_LENGTH = 40;
const MAX_IMAGE_DATA_URL_LENGTH = 2_000_000;

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all|any|previous|prior|the|your|me|just|most)\s+(instructions?|prompts?|system|rules?|context|messages)/i,
  /disregard|forget\s+(all|the|your|me)|override|overrides?\s+(all|the|your|me|just)/i,
  /you\s+are\s+now|act\s+as|pretend|simulate\s+being|role-?play|new\s+instructions|system\s+message|hidden\s+instructions/i,
  /<\/?(system|developer|user|assistant|prompt|instruction)[^>]*>/i,
  /jailbreak|prompt\s*inject/i,
];

const MEDICAL_CLAIM_PATTERN = /\b(cure|heals?|diagnos[ei]|prescri[pi]|medicin|clinical\s+trial)\b/i;
const DECEPTIVE_CLAIM_PATTERN = /\b(guarantee[ds]?|risk-?\s*free|risk\s+free|no\s+risk|profit|revenue|investment\s+return|get\s+rich|make\s+(?:money|profits?)|insane\s+growth)\b/i;
const SUPERLATIVE_PATTERN = /\b(best\s+in\s+india|number\s+one|#1\b|world'?s\s+best|no\s+one\s+(?:can|has)|nobody\s+(?:can|has)|miracle|revolutionar|unbelievable|guaranteed\s+(?:results?|outcomes?|leads?|sales?))\b/i;
const IMPERSONATION_PATTERN = /\bi\s+am\s+(?:a|an|dr|doctor|dentist|lawyer|chartered|engineer|ca|cpa|chartered\s+accountant)\b/i;

function issue(code: AdSafetyCode, message: string): AdSafetyIssue {
  return { code, message };
}

function withIssue(issues: AdSafetyIssue[], code: AdSafetyCode, message: string): AdSafetyIssue[] {
  const next = [...issues];
  const existing = next.find((item) => item.code === code && item.message === message);
  if (existing) return next;
  next.push(issue(code, message));
  return next;
}

/**
 * Detects jailbreak, prompt-injection and policy-bypass language in owner-supplied text.
 * These strings are ad content to the model, never instructions, so anything that tries to
 * turn them into system-level behaviour is treated as a safety violation.
 */
export function containsInjectionRisk(text: string | null | undefined): boolean {
  if (!text) return false;
  const value = text.toLowerCase();
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export interface CreativeInputLike {
  businessName?: string;
  category?: string;
  city?: string;
  area?: string;
  offer?: string;
  tone?: string;
}

/**
 * Pre-generation input checks. Blocks anything that looks like an instruction override and
 * reports values that are outside the safe, expected shape for ad generation.
 */
export function checkCreativeInput(input: CreativeInputLike): AdSafetyResult {
  const issues: AdSafetyIssue[] = [];

  const fields: Array<{ label: string; value?: string; maxLength: number }> = [
    { label: 'Business name', value: input.businessName, maxLength: MAX_BUSINESS_NAME_LENGTH },
    { label: 'Category', value: input.category, maxLength: MAX_CATEGORY_LENGTH },
    { label: 'City', value: input.city, maxLength: MAX_LOCATION_LENGTH },
    { label: 'Area', value: input.area, maxLength: MAX_LOCATION_LENGTH },
    { label: 'Offer', value: input.offer, maxLength: MAX_OFFER_LENGTH },
    { label: 'Tone', value: input.tone, maxLength: MAX_TONE_LENGTH },
  ];

  for (const field of fields) {
    const text = (field.value || '').trim();
    if (!text) continue;
    if (containsInjectionRisk(text)) {
      issues.push(
        issue(
          'injection',
          `We could not safely use the ${field.label.toLowerCase()} because it looks like an instruction. Please write it as a plain ad.`,
        ),
      );
      continue;
    }
    if (text.length > field.maxLength) {
      issues.push(issue('quality', `${field.label} is too long to use safely.`));
    }
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Post-generation moderation for one AI-generated ad.
 * Flags disallowed content, deceptive or unsupported claims, impersonation, quality issues
 * and language problems. Flagged ads stay editable by the owner; nothing is silently published.
 */
export function moderateGeneratedAd(ad: ModerateAdInput, context?: AdSafetyContext): AdSafetyResult {
  const issues: AdSafetyIssue[] = [];
  const headline = (ad.headline || '').trim();
  const body = (ad.body || '').trim();
  const button = (ad.button || '').trim();
  const combined = `${headline} ${body} ${button}`;

  if (!headline || !body || !button) {
    issues.push(issue('content', 'The ad text came back incomplete.'));
  }
  if (headline.length > MAX_AD_HEADLINE_LENGTH) {
    issues.push(issue('quality', 'The ad headline is too long.'));
  }
  if (body.length > MAX_AD_BODY_LENGTH) {
    issues.push(issue('quality', 'The ad message is too long.'));
  }
  if (button.length > MAX_AD_BUTTON_LENGTH) {
    issues.push(issue('quality', 'The ad button text is too long.'));
  }

  if (context?.language === 'en' && /[^\x00-\x7F]/.test(combined)) {
    issues.push(issue('language', 'The ad text should be in English.'));
  }

  if (MEDICAL_CLAIM_PATTERN.test(combined)) {
    issues.push(issue('claim', 'The ad mentions medical or treatment claims that need review.'));
  }
  if (DECEPTIVE_CLAIM_PATTERN.test(combined)) {
    issues.push(issue('claim', 'The ad makes promises that need evidence or safer wording.'));
  }
  if (SUPERLATIVE_PATTERN.test(combined)) {
    issues.push(issue('content', 'The ad uses strong claims that need evidence or safer wording.'));
  }
  if (IMPERSONATION_PATTERN.test(combined)) {
    issues.push(issue('impersonation', 'The ad looks like it impersonates a person or professional.'));
  }

  if (context?.prohibitedClaims?.length) {
    const haystack = combined.toLowerCase();
    for (const claim of context.prohibitedClaims) {
      const normalized = (claim || '').trim().toLowerCase();
      if (normalized && haystack.includes(normalized)) {
        issues.push(issue('claim', 'The ad repeats a claim your shop asked us to avoid.'));
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

export function moderateGeneratedAds(
  ads: ModerateAdInput[],
  context?: AdSafetyContext,
): { ads: ModerateAdInput[]; result: AdSafetyResult } {
  const issues: AdSafetyIssue[] = [];
  const safeAds = ads.map((ad) => {
    const moderation = moderateGeneratedAd(ad, context);
    if (!moderation.ok) {
      for (const item of moderation.issues) issues.push(item);
    }
    return {
      headline: (ad.headline || '').trim(),
      body: (ad.body || '').trim(),
      button: (ad.button || '').trim(),
    };
  });
  return { ads: safeAds, result: { ok: issues.length === 0, issues } };
}

/**
 * Post-generation image moderation. Generated pictures must be real image data URLs and within
 * the safe size budget; anything else is treated as unusable.
 */
export async function moderateGeneratedImage(imageDataUrl?: string | null): Promise<AdSafetyResult> {
  const issues: AdSafetyIssue[] = [];
  if (!imageDataUrl) {
    return { ok: false, issues: [issue('image', 'No image came back for the ad.')] };
  }
  if (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
    return { ok: false, issues: [issue('image', 'The generated image could not be used.')] };
  }
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return { ok: false, issues: [issue('image', 'The generated image is too large to use.')] };
  }
  return { ok: true, issues: [] };
}
