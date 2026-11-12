export const APP_LANGUAGES = [
  { code: 'en', name: 'English', speechLocale: 'en-IN', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', speechLocale: 'hi-IN', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', speechLocale: 'bn-IN', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', speechLocale: 'ta-IN', dir: 'ltr' },
  { code: 'te', name: 'తెలుగు', speechLocale: 'te-IN', dir: 'ltr' },
  { code: 'mr', name: 'मराठी', speechLocale: 'mr-IN', dir: 'ltr' },
  { code: 'ur', name: 'اردو', speechLocale: 'ur-PK', dir: 'rtl' },
  { code: 'ml', name: 'മലയാളം', speechLocale: 'ml-IN', dir: 'ltr' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN', dir: 'ltr' },
  { code: 'gu', name: 'ગુજરાતી', speechLocale: 'gu-IN', dir: 'ltr' },
  { code: 'kn', name: 'ಕನ್ನಡ', speechLocale: 'kn-IN', dir: 'ltr' },
  { code: 'sd', name: 'سنڌي', speechLocale: 'sd-PK', dir: 'rtl' },
  { code: 'as', name: 'অসমীয়া', speechLocale: 'as-IN', dir: 'ltr' },
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: AppLanguage = 'hi';
const STORAGE_KEY = 'admitra:language';

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
] as const;

export type UiKey = (typeof uiKeys)[number];
type LocaleCopy = Record<UiKey, string>;

const copy: Record<'en', LocaleCopy> = {
  en: {
    demoTitle: 'See how your offer becomes a post', demoButton: 'See a sample',
    instagramShare: 'Get it ready for Instagram', instagramCopyCaption: 'Copy caption',
    instagramDownloadImage: 'Download image', instagramOpen: 'Open Instagram',
    instagramInstructions: 'Copy the caption and save the image. In Instagram, start a post or story, add the saved image, then paste the caption. Nothing is posted automatically.',
    messageEnquiries: 'Message enquiries', bookingEnquiries: 'Booking enquiries', awareness: 'Awareness',
    chooseLanguage: 'Choose your language', shopSetup: 'Set up your shop',
    shopIntro: 'Your shop name, business type, and city are needed to make an ad.',
    businessName: 'Shop or business name', businessType: 'What kind of business do you run?',
    city: 'Town or city', area: 'Area or nearby landmark', whatsapp: 'WhatsApp number (optional)',
    messageOnWhatsApp: 'Message on WhatsApp',
    optionalDetails: 'More details (optional)',
    continue: 'Continue', saveShop: 'Save shop details', skip: 'Do this later',
    landingEyebrow: 'For small and medium business owners',
    landingHeadline: 'Make ads in your language.',
    landingBody: 'Turn a real offer into an editable ad in your language. Review it, then share it yourself. Video is optional and may not always be available.',
    campaignPlanHeadline: 'Make your first ad, one small step at a time.',
    campaignPlanBody: 'Built for Indian businesses: tell us about your shop, write one offer, and get an ad you can edit. This is a practice ad—nothing is posted or charged.',
    tagline: 'Your shop, your language, your ad.',
    explore: 'Explore without signing in', signInForAI: 'Sign in to make an AI ad',
    signIn: 'Sign in', signOut: 'Sign out', yourBusiness: 'Your shop',
    offerQuestion: 'What would you like customers to know?',
    offerHint: 'Write or speak in your language. Share only a real offer or service.',
    speakOffer: 'Speak your offer', stopSpeaking: 'Stop', voicePrivacy: 'Your browser recognizes speech; audio may be sent to its provider.',
    tone: 'Writing style', toneFriendly: 'Friendly', toneClear: 'Clear', tonePremium: 'Special',
    nearbyArea: 'Nearby area', adLanguage: 'Ad language', makeAd: 'Make my ad',
    makingAd: 'Making your ad…', dailyAttempts: '{count} of 25 daily AI attempts left',
    dailyAttemptsUnavailable: 'Could not get today’s attempt count',
    signInForAttempts: 'Sign in to see your remaining attempts',
    chooseAd: 'Choose an ad', editBeforeShare: 'You can edit it before sharing',
    preview: 'WhatsApp ad', mainLine: 'Main line', adMessage: 'Ad message',
    copyAd: 'Copy ad', downloadText: 'Download text', draftSaved: 'Draft saved in this browser',
    emptyTitle: 'Your ad will appear here',
    emptyBody: 'Add an offer above and make an ad.', email: 'Email address',
    password: 'Password', createAccount: 'Create account', fullName: 'Your name',
    googleSignIn: 'Continue with Google', or: 'or', noAccount: 'Don’t have an account?',
    createOne: 'Create an account', alreadyAccount: 'Already have an account?', back: 'Back',
    categoryBeauty: 'Beauty & wellness', categoryEducation: 'Education & coaching',
    categoryRestaurant: 'Food & restaurant', categoryFitness: 'Fitness & gym',
    categoryRetail: 'Shop & clothing', categoryHealth: 'Clinic & health',
    categoryOther: 'Other local business', shopNameError: 'Enter your shop name.',
    cityError: 'Enter your town or city.', adReady: 'Your ad is ready',
    imageMissing: 'Your ad text is ready, but the image could not be made.',
    genericError: 'Something went wrong. Please try again.',
    sampleOnly: 'This is a sample. No ads are published and no money is spent.',
    videoExperimental: 'Optional video (experimental)', videoDirection: 'Video style (optional)', videoPromptHint: 'Describe the mood, setting, or camera movement. Uploaded photos guide the image, not the video. Video is vertical and 8 seconds long.',
    makeVideo: 'Make an 8-second video', makingVideo: 'Making your video…',
    videoProgress: 'This can take a few minutes. Keep this page open while it is being made.',
    videoAttempts: '{count} of 25 daily video attempts left', downloadVideo: 'Download video', shareVideo: 'Share video',
    imageUploadTitle: 'Add photos (optional)',
    imageUploadHelp: 'Add up to 6 photos per ad. Each photo must be under 8 MB. Photos are sent to Google Gemini to make this ad.',
    imageUploadLimit: 'You can add up to 6 photos to one ad.',
    imageUnsupported: 'This photo could not be opened. Choose another.',
    imageTooLarge: 'Each photo must be under 8 MB.', removeImage: 'Remove photo',
    processingPhotos: 'Preparing photos…', usePhone: 'Use mobile number',
    useEmail: 'Use email instead', mobileNumber: 'Mobile number',
    sendOtp: 'Send one-time code', verifyOtp: 'Verify code', otpCode: '6-digit code',
    otpSent: 'Enter the code sent to your mobile number.',
    resendOtp: 'Send code again',
    phoneFormatError: 'Enter a valid 10-digit Indian mobile number.',
    phoneSignupUnavailable: 'Mobile verification needs Supabase SMS sign-in to be configured.',
  },
};

export function getInitialLanguage(): AppLanguage {
  return 'en';
}

function detectLanguage(): AppLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && APP_LANGUAGES.some((item) => item.code === stored)) {
    return stored as AppLanguage;
  }
  const browserLanguages = [navigator.language, ...(navigator.languages || [])]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  for (const browserLanguage of browserLanguages) {
    const match = APP_LANGUAGES.find(
      (item) =>
        browserLanguage === item.code || browserLanguage.startsWith(`${item.code}-`),
    );
    if (match) return match.code;
  }
  return DEFAULT_LANGUAGE;
}

export function saveLanguage(language: AppLanguage): void {
  window.localStorage.setItem(STORAGE_KEY, language);
  const selected = APP_LANGUAGES.find((item) => item.code === language);
  document.documentElement.lang = language;
  document.documentElement.dir = selected?.dir || 'ltr';
}

export function translate(
  language: AppLanguage,
  key: UiKey,
  values?: Record<string, string | number>,
  dictionary?: Record<string, string>,
): string {
  const english = copy.en[key];
  let value = (language !== 'en' && dictionary?.[english]) || english;
  
  // If no static translation exists and not English, try Gemini
  if (language !== 'en' && value === english && dictionary?.[english] === undefined) {
    // This is a fallback mechanism - would be called asynchronously
    // For now, we keep the original behavior
    // To enable full Gemini translation, this would need to be async
  }
  
  if (values) {
    for (const [name, replacement] of Object.entries(values)) {
      value = value.split(`{${name}}`).join(String(replacement));
    }
  }
  return value;
}

export const BUSINESS_CATEGORIES = [
  { key: 'categoryBeauty', value: 'Beauty & Wellness' },
  { key: 'categoryEducation', value: 'Education & Coaching' },
  { key: 'categoryRestaurant', value: 'Restaurant & Dining' },
  { key: 'categoryFitness', value: 'Fitness & Gym' },
  { key: 'categoryRetail', value: 'Retail & Fashion' },
  { key: 'categoryHealth', value: 'Healthcare & Clinic' },
  { key: 'categoryOther', value: 'Other local business' },
] as const satisfies readonly { key: UiKey; value: string }[];

export function useLanguage() {
  const language = detectLanguage();
  return {
    language,
    t: (key: UiKey, values?: Record<string, string | number>) => translate(language, key, values),
  };
}
