import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

// All UI keys from language.ts
const uiKeys = [
  'chooseLanguage', 'shopSetup', 'shopIntro', 'businessName', 'businessType', 'city', 'area',
  'messageOnWhatsApp',
  'optionalDetails', 'videoExperimental', 'videoDirection', 'videoPromptHint', 'makeVideo', 'makingVideo',
  'videoProgress', 'videoAttempts', 'downloadVideo', 'shareVideo',
  'whatsapp', 'continue', 'saveShop', 'skip', 'landingEyebrow', 'landingHeadline', 'landingBody',
  'campaignPlanHeadline', 'campaignPlanBody',
  'tagline', 'explore', 'signInForAI', 'signIn', 'signOut', 'yourBusiness', 'offerQuestion',
  'offerHint', 'speakOffer', 'stopSpeaking', 'voicePrivacy', 'tone', 'toneFriendly', 'toneClear',
  'tonePremium', 'nearbyArea', 'adLanguage', 'makeAd', 'makingAd', 'dailyAttempts',
  'dailyAttemptsUnavailable', 'signInForAttempts', 'chooseAd', 'editBeforeShare', 'preview',
  'mainLine', 'adMessage', 'copyAd', 'downloadText', 'draftSaved', 'emptyTitle', 'emptyBody',
  'email', 'password', 'createAccount', 'fullName', 'googleSignIn', 'or', 'noAccount', 'createOne',
  'alreadyAccount', 'back', 'categoryBeauty', 'categoryEducation', 'categoryRestaurant',
  'categoryFitness', 'categoryRetail', 'categoryHealth', 'categoryOther', 'shopNameError',
  'cityError', 'adReady', 'imageMissing', 'genericError', 'sampleOnly',
  'imageUploadTitle', 'imageUploadHelp', 'imageUploadLimit', 'imageUnsupported',
  'imageTooLarge', 'removeImage', 'processingPhotos',
  'usePhone', 'useEmail', 'mobileNumber', 'sendOtp', 'verifyOtp', 'otpCode',
  'otpSent', 'resendOtp', 'phoneFormatError', 'phoneSignupUnavailable',
  'demoTitle', 'demoButton', 'instagramShare', 'instagramCopyCaption',
  'instagramDownloadImage', 'instagramOpen', 'instagramInstructions',
  'messageEnquiries', 'bookingEnquiries', 'awareness',
];

// English copy (extracted from language.ts)
const englishCopy = {
  chooseLanguage: 'Choose your language',
  shopSetup: 'Set up your shop',
  shopIntro: 'Your shop name, business type, and city are needed to make an ad.',
  businessName: 'Shop or business name',
  businessType: 'What kind of business do you run?',
  city: 'Town or city',
  area: 'Area or nearby landmark',
  whatsapp: 'WhatsApp number (optional)',
  messageOnWhatsApp: 'Message on WhatsApp',
  optionalDetails: 'More details (optional)',
  continue: 'Continue',
  saveShop: 'Save shop details',
  skip: 'Do this later',
  landingEyebrow: 'For small local shops',
  landingHeadline: 'Make ads in your language.',
  landingBody: 'Turn a real offer into an editable ad in your language. Review it, then share it yourself. Video is optional and may not always be available.',
  campaignPlanHeadline: 'Make your first ad, one small step at a time.',
  campaignPlanBody: 'Tell us about your shop, write one offer, and get an ad in your language. You can edit every word. This is a practice ad—nothing is posted or charged.',
  tagline: 'Your shop, your language, your ad.',
  explore: 'Explore without signing in',
  signInForAI: 'Sign in to make an AI ad',
  signIn: 'Sign in',
  signOut: 'Sign out',
  yourBusiness: 'Your shop',
  offerQuestion: 'What would you like customers to know?',
  offerHint: 'Write or speak in your language. Share only a real offer or service.',
  speakOffer: 'Speak your offer',
  stopSpeaking: 'Stop',
  voicePrivacy: 'Your browser recognizes speech; audio may be sent to its provider.',
  tone: 'Writing style',
  toneFriendly: 'Friendly',
  toneClear: 'Clear',
  tonePremium: 'Special',
  nearbyArea: 'Nearby area',
  adLanguage: 'Ad language',
  makeAd: 'Make my ad',
  makingAd: 'Making your ad…',
  dailyAttempts: '{count} of 25 daily AI attempts left',
  dailyAttemptsUnavailable: 'Could not get today\'s attempt count',
  signInForAttempts: 'Sign in to see your remaining attempts',
  chooseAd: 'Choose an ad',
  editBeforeShare: 'You can edit it before sharing',
  preview: 'WhatsApp ad',
  mainLine: 'Main line',
  adMessage: 'Ad message',
  copyAd: 'Copy ad',
  downloadText: 'Download text',
  draftSaved: 'Draft saved in this browser',
  emptyTitle: 'Your ad will appear here',
  emptyBody: 'Add an offer above and make an ad.',
  email: 'Email address',
  password: 'Password',
  createAccount: 'Create account',
  fullName: 'Your name',
  googleSignIn: 'Continue with Google',
  or: 'or',
  noAccount: 'Don\'t have an account?',
  createOne: 'Create an account',
  alreadyAccount: 'Already have an account?',
  back: 'Back',
  categoryBeauty: 'Beauty & wellness',
  categoryEducation: 'Education & coaching',
  categoryRestaurant: 'Food & restaurant',
  categoryFitness: 'Fitness & gym',
  categoryRetail: 'Shop & clothing',
  categoryHealth: 'Clinic & health',
  categoryOther: 'Other local business',
  shopNameError: 'Enter your shop name.',
  cityError: 'Enter your town or city.',
  adReady: 'Your ad is ready',
  imageMissing: 'Your ad text is ready, but the image could not be made.',
  genericError: 'Something went wrong. Please try again.',
  sampleOnly: 'This is a sample. No ads are published and no money is spent.',
  videoExperimental: 'Optional video (experimental)',
  videoDirection: 'Video style (optional)',
  videoPromptHint: 'Describe the mood, setting, or camera movement. Uploaded photos guide the image, not the video. Video is vertical and 8 seconds long.',
  makeVideo: 'Make an 8-second video',
  makingVideo: 'Making your video…',
  videoProgress: 'This can take a few minutes. Keep this page open while it is being made.',
  videoAttempts: '{count} of 25 daily video attempts left',
  downloadVideo: 'Download video',
  shareVideo: 'Share video',
  imageUploadTitle: 'Add photos (optional)',
  imageUploadHelp: 'Add up to 6 photos per ad. Each photo must be under 8 MB. Photos are sent to Google Gemini to make this ad.',
  imageUploadLimit: 'You can add up to 6 photos to one ad.',
  imageUnsupported: 'This photo could not be opened. Choose another.',
  imageTooLarge: 'Each photo must be under 8 MB.',
  removeImage: 'Remove photo',
  processingPhotos: 'Preparing photos…',
  usePhone: 'Use mobile number',
  useEmail: 'Use email instead',
  mobileNumber: 'Mobile number',
  sendOtp: 'Send one-time code',
  verifyOtp: 'Verify code',
  otpCode: '6-digit code',
  otpSent: 'Enter the code sent to your mobile number.',
  resendOtp: 'Send code again',
  phoneFormatError: 'Enter a valid 10-digit Indian mobile number.',
  phoneSignupUnavailable: 'Mobile verification needs Supabase SMS sign-in to be configured.',
  demoTitle: 'See how your offer becomes a post',
  demoButton: 'See a sample',
  instagramShare: 'Get it ready for Instagram',
  instagramCopyCaption: 'Copy caption',
  instagramDownloadImage: 'Download image',
  instagramOpen: 'Open Instagram',
  instagramInstructions: 'Copy the caption and save the image. In Instagram, start a post or story, add the saved image, then paste the caption. Nothing is posted automatically.',
  messageEnquiries: 'Message enquiries',
  bookingEnquiries: 'Booking enquiries',
  awareness: 'Awareness',
};

const languages = [
  { code: 'hi', name: 'Hindi (Hinglish, natural Indian Hindi)' },
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

async function translateWithGemini(text, targetLanguage) {
  const prompt = `Translate this UI text to ${targetLanguage}. 
Requirements:
- Keep it concise and natural for Indian users
- Preserve the same tone (friendly, professional, etc.)
- For buttons/CTAs, keep it short (under 15 characters if possible)
- Only return the translation, no explanation
- Do not add quotation marks
- Preserve any {placeholders} like {count} exactly as-is

Text to translate:
${text}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 256,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const translatedText = data.candidates[0].content.parts[0].text;
  return translatedText.trim().replace(/^["']|["']$/g, '');
}

async function translateAllForLanguage(langCode, langName) {
  console.log(`\n=== Translating to ${langName} (${langCode}) ===`);
  const translations = {};
  
  for (const key of uiKeys) {
    const english = englishCopy[key];
    if (!english) {
      console.warn(`Missing English copy for key: ${key}`);
      continue;
    }
    
    try {
      const translated = await translateWithGemini(english, langName);
      translations[english] = translated;
      console.log(`✓ ${key}: ${english.substring(0, 30)}... -> ${translated.substring(0, 30)}...`);
    } catch (error) {
      console.error(`✗ Failed to translate ${key}:`, error.message);
      translations[english] = english; // Fallback to English
    }
    
    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return translations;
}

async function generateDictionary(langCode, langName) {
  const translations = await translateAllForLanguage(langCode, langName);
  
  // Create TypeScript file
  const content = `// Auto-generated translations for ${langName}
// Generated by scripts/generate-translations.js on ${new Date().toISOString()}

export default ${JSON.stringify(translations, null, 2)};
`;
  
  const filePath = path.join(__dirname, `../src/i18n/content/${langCode}.ts`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Written ${langCode}.ts`);
}

async function main() {
  console.log('Starting Gemini translation generation...');
  console.log(`Found ${languages.length} languages to translate`);
  console.log(`Found ${uiKeys.length} UI keys`);
  
  for (const lang of languages) {
    await generateDictionary(lang.code, lang.name);
    // Wait between languages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== Translation generation complete ===');
}

main().catch(console.error);
