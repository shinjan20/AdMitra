import {
  BusinessProfile,
  Campaign,
  CampaignObjective,
  AIRecommendation,
  CreativeVariation,
  CTAType,
  PerformanceRecommendation,
} from '../types';
import { INDIAN_SMB_PRESETS } from '../utils/presets';

interface GenerateStrategyParams {
  business: BusinessProfile;
  objective: CampaignObjective;
  budget?: number;
  durationDays?: number;
}

interface GenerateCreativesParams {
  business: BusinessProfile;
  objective: CampaignObjective;
  customPrompt?: string;
  adLanguage?: string; // 'en' | 'hi' | 'ta' | 'te' | 'mr' | etc.
}

// Vernacular copy for common business categories - All 13 languages supported
const VERNACULAR_TEMPLATES: Record<string, {
  messages: { headline: string; description: string; cta: string }[];
  leads: { headline: string; description: string; cta: string }[];
  awareness: { headline: string; description: string; cta: string }[];
}> = {
  hi: {
    messages: [
      { headline: 'आज ही WhatsApp पर बात करें', description: 'हमारी सेवाओं के बारे में जानें और अभी अपॉइंटमेंट बुक करें।', cta: 'WhatsApp पर संपर्क करें' },
      { headline: 'हमसे जुड़ें और बेहतरीन सेवा पाएं', description: 'आपके नज़दीक ही है हमारी दुकान। WhatsApp पर मैसेज करें।', cta: 'अभी मैसेज करें' },
      { headline: 'सर्वश्रेष्ठ सेवा, सही दाम पर', description: 'हमारे विशेषज्ञों से बात करें और अपनी ज़रूरत बताएं।', cta: 'WhatsApp करें' },
    ],
    leads: [
      { headline: 'अभी जानकारी लें और बुक करें', description: 'हमारी सेवाओं के बारे में पूछताछ करें और तुरंत बुकिंग पाएं।', cta: 'अभी बुक करें' },
      { headline: 'आपके लिए बेहतरीन ऑफर', description: 'हमसे संपर्क करें और अपनी सेवा बुक करें।', cta: 'फॉर्म भरें' },
      { headline: 'आज ही संपर्क करें', description: 'हमारे विशेषज्ञ आपकी मदद के लिए तैयार हैं।', cta: 'पूछताछ करें' },
    ],
    awareness: [
      { headline: 'आपके शहर में बेहतरीन सेवा', description: 'हम हैं आपके पास — गुणवत्ता और विश्वास के साथ।', cta: 'और जानें' },
      { headline: 'नए अनुभव का स्वागत करें', description: 'हमारी सेवाओं की खोज करें और आज ही जुड़ें।', cta: 'हमें जानें' },
      { headline: 'आपके भरोसे का व्यवसाय', description: 'स्थानीय व्यवसाय, वैश्विक गुणवत्ता — आपके लिए।', cta: 'देखें' },
    ],
  },
  bn: {
    messages: [
      { headline: 'আজই WhatsApp-এ যোগাযোগ করুন', description: 'আমাদের পরিষেবা সম্পর্কে জানুন এবং এখনই অ্যাপয়েন্টমেন্ট বুক করুন।', cta: 'WhatsApp করুন' },
      { headline: 'সেরা পরিষেবা, আপনার কাছেই', description: 'আমাদের WhatsApp-এ মেসেজ করুন এবং বিস্তারিত জানুন।', cta: 'এখনই মেসেজ করুন' },
      { headline: 'মানসম্পন্ন সেবা, সরাসরি যোগাযোগ', description: 'আপনার প্রয়োজন আমাদের সাথে শেয়ার করুন।', cta: 'WhatsApp করুন' },
    ],
    leads: [
      { headline: 'এখনই তথ্য নিন এবং বুক করুন', description: 'আমাদের পরিষেবা সম্পর্কে জিজ্ঞাসা করুন এবং বুকিং করুন।', cta: 'এখনই বুক করুন' },
      { headline: 'আপনার জন্য বিশেষ অফার', description: 'আমাদের সাথে যোগাযোগ করুন এবং পরিষেবা বুক করুন।', cta: 'ফর্ম পূরণ করুন' },
      { headline: 'আজই যোগাযোগ করুন', description: 'আমাদের বিশেষজ্ঞরা আপনাকে সাহায্য করতে প্রস্তুত।', cta: 'জিজ্ঞাসা করুন' },
    ],
    awareness: [
      { headline: 'আপনার শহরে সেরা পরিষেবা', description: 'মান এবং বিশ্বাসের সাথে — আপনার জন্য।', cta: 'আরও জানুন' },
      { headline: 'নতুন অভিজ্ঞতার স্বাগত', description: 'আমাদের পরিষেবা আবিষ্কার করুন এবং আজই যুক্ত হন।', cta: 'আমাদের জানুন' },
      { headline: 'আপনার বিশ্বস্ত ব্যবসা', description: 'স্থানীয় ব্যবসা, উৎকৃষ্ট মান — আপনার জন্য।', cta: 'দেখুন' },
    ],
  },
  ta: {
    messages: [
      { headline: 'இன்றே WhatsApp-ல் தொடர்பு கொள்ளுங்கள்', description: 'எங்கள் சேவைகளைப் பற்றி அறிந்து உடனே பதிவு செய்யுங்கள்.', cta: 'WhatsApp அனுப்புங்கள்' },
      { headline: 'சிறந்த சேவை, உங்கள் அருகில்', description: 'எங்களை WhatsApp-ல் தொடர்பு கொண்டு விவரங்கள் பெறுங்கள்.', cta: 'இப்போதே மெசேஜ் அனுப்புங்கள்' },
      { headline: 'தரமான சேவை, நேரடி தொடர்பு', description: 'உங்கள் தேவைகளை எங்களிடம் பகிர்ந்து கொள்ளுங்கள்.', cta: 'WhatsApp செய்யுங்கள்' },
    ],
    leads: [
      { headline: 'இப்போதே விவரங்கள் பெறுங்கள்', description: 'எங்கள் சேவைகளைப் பற்றி அறிந்துகொண்டு பதிவு செய்யுங்கள்.', cta: 'இப்போதே பதிவு செய்யுங்கள்' },
      { headline: 'சிறந்த சலுகைகள் உங்களுக்காக', description: 'எங்களை தொடர்பு கொண்டு சேவைகளை பதிவு செய்யுங்கள்.', cta: 'படிவம் நிரப்புங்கள்' },
      { headline: 'இன்றே தொடர்பு கொள்ளுங்கள்', description: 'எங்கள் நிபுணர்கள் உங்களுக்கு உதவ தயாராக உள்ளனர்.', cta: 'விசாரியுங்கள்' },
    ],
    awareness: [
      { headline: 'உங்கள் நகரில் சிறந்த சேவை', description: 'தரம் மற்றும் நம்பிக்கையுடன் — உங்களுக்காக.', cta: 'மேலும் அறிக' },
      { headline: 'புதிய அனுபவத்தை வரவேற்கிறோம்', description: 'எங்கள் சேவைகளை கண்டுபிடித்து இன்றே சேருங்கள்.', cta: 'எங்களை அறிக' },
      { headline: 'உங்கள் நம்பகமான வணிகம்', description: 'உள்ளூர் வணிகம், சிறந்த தரம் — உங்களுக்காக.', cta: 'பார்க்கவும்' },
    ],
  },
  te: {
    messages: [
      { headline: 'ఇప్పుడే WhatsApp లో సంప్రదించండి', description: 'మా సేవల గురించి తెలుసుకోండి మరియు వెంటనే అపాయింట్‌మెంట్ బుక్ చేయండి.', cta: 'WhatsApp పంపండి' },
      { headline: 'మీ దగ్గర్లో అత్యుత్తమ సేవ', description: 'మాకు WhatsApp చేయండి మరియు వివరాలు తెలుసుకోండి.', cta: 'ఇప్పుడే మెసేజ్ చేయండి' },
      { headline: 'నాణ్యమైన సేవ, నేరుగా సంప్రదించండి', description: 'మీ అవసరాలను మాతో పంచుకోండి.', cta: 'WhatsApp చేయండి' },
    ],
    leads: [
      { headline: 'ఇప్పుడే వివరాలు తెలుసుకోండి', description: 'మా సేవల గురించి తెలుసుకుని బుక్ చేయండి.', cta: 'ఇప్పుడే బుక్ చేయండి' },
      { headline: 'మీకోసం ప్రత్యేక ఆఫర్లు', description: 'మాకు సంప్రదించండి మరియు సేవలు బుక్ చేయండి.', cta: 'ఫారం నింపండి' },
      { headline: 'ఈ రోజే సంప్రదించండి', description: 'మా నిపుణులు మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నారు.', cta: 'విచారించండి' },
    ],
    awareness: [
      { headline: 'మీ నగరంలో అత్యుత్తమ సేవ', description: 'నాణ్యత మరియు నమ్మకంతో — మీకోసం.', cta: 'మరింత తెలుసుకోండి' },
      { headline: 'కొత్త అనుభవాన్ని ఆహ్వానించండి', description: 'మా సేవలను కనుగొని ఈ రోజే చేరండి.', cta: 'మాను తెలుసుకోండి' },
      { headline: 'మీ నమ్మకమైన వ్యాపారం', description: 'స్థానిక వ్యాపారం, అత్యుత్తమ నాణ్యత — మీకోసం.', cta: 'చూడండి' },
    ],
  },
  mr: {
    messages: [
      { headline: 'आजच WhatsApp वर संपर्क करा', description: 'आमच्या सेवांबद्दल जाणून घ्या आणि लगेच अपॉइंटमेंट बुक करा.', cta: 'WhatsApp वर संपर्क करा' },
      { headline: 'सर्वोत्तम सेवा, तुमच्या जवळच', description: 'WhatsApp वर मेसेज करा आणि माहिती मिळवा.', cta: 'आत्ताच मेसेज करा' },
      { headline: 'दर्जेदार सेवा, थेट संपर्क', description: 'तुमची गरज आमच्याशी शेअर करा.', cta: 'WhatsApp करा' },
    ],
    leads: [
      { headline: 'आत्ताच माहिती मिळवा', description: 'आमच्या सेवांबद्दल जाणून घ्या आणि बुकिंग करा.', cta: 'आत्ताच बुक करा' },
      { headline: 'तुमच्यासाठी खास ऑफर', description: 'आमच्याशी संपर्क करा आणि सेवा बुक करा.', cta: 'फॉर्म भरा' },
      { headline: 'आजच संपर्क करा', description: 'आमचे तज्ञ तुमच्या मदतीसाठी तयार आहेत.', cta: 'चौकशी करा' },
    ],
    awareness: [
      { headline: 'तुमच्या शहरात सर्वोत्तम सेवा', description: 'गुणवत्ता आणि विश्वासाने — तुमच्यासाठी.', cta: 'अधिक जाणून घ्या' },
      { headline: 'नवीन अनुभवाचे स्वागत करा', description: 'आमच्या सेवा शोधा आणि आजच जोडा.', cta: 'आम्हाला जाणून घ्या' },
      { headline: 'तुमचा विश्वासू व्यवसाय', description: 'स्थानिक व्यवसाय, उत्कृष्ट दर्जा — तुमच्यासाठी.', cta: 'पहा' },
    ],
  },
  ur: {
    messages: [
      { headline: 'آج ہی WhatsApp پر رابطہ کریں', description: 'ہماری خدمات کے بارے میں جانیں اور ابھی اپائنٹمنٹ بک کریں۔', cta: 'WhatsApp پر رابطہ کریں' },
      { headline: 'بہترین خدمت، آپ کے قریب', description: 'ہمیں WhatsApp پر میسج کریں اور تفصیلات حاصل کریں۔', cta: 'ابھی میسج کریں' },
      { headline: 'معیاری خدمت، براہ راست رابطہ', description: 'اپنی ضروریات ہمارے ساتھ شیئر کریں۔', cta: 'WhatsApp کریں' },
    ],
    leads: [
      { headline: 'ابھی معلومات حاصل کریں اور بک کریں', description: 'ہماری خدمات کے بارے میں پوچھیں اور بکنگ کریں۔', cta: 'ابھی بک کریں' },
      { headline: 'آپ کے لیے خاص پیشکش', description: 'ہم سے رابطہ کریں اور خدمات بک کریں۔', cta: 'فارم بھریں' },
      { headline: 'آج ہی رابطہ کریں', description: 'ہمارے ماہرین آپ کی مدد کے لیے تیار ہیں۔', cta: 'استفسار کریں' },
    ],
    awareness: [
      { headline: 'آپ کے شہر میں بہترین خدمت', description: 'معیار اور اعتماد کے ساتھ — آپ کے لیے۔', cta: 'مزید جانیں' },
      { headline: 'نئے تجربے کا خیر مقدم', description: 'ہماری خدمات دریافت کریں اور آج ہی شامل ہوں۔', cta: 'ہمیں جانیں' },
      { headline: 'آپ کا قابل اعتماد کاروبار', description: 'مقامی کاروبار، بہترین معیار — آپ کے لیے۔', cta: 'دیکھیں' },
    ],
  },
  ml: {
    messages: [
      { headline: 'ഇന്ന് തന്നെ WhatsApp-ൽ ബന്ധപ്പെടുക', description: 'ഞങ്ങളുടെ സേവനങ്ങളെ കുറിച്ച് അറിയുകയും ഉടൻ അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുകയും ചെയ്യുക.', cta: 'WhatsApp ചെയ്യുക' },
      { headline: 'മികച്ച സേവനം, നിങ്ങളുടെ അടുത്ത്', description: 'ഞങ്ങളെ WhatsApp-ൽ സന്ദേശമയയ്ക്കുക, വിശദാംശങ്ങൾ നേടുക.', cta: 'ഇപ്പോൾ സന്ദേശമയയ്ക്കുക' },
      { headline: 'ഗുണമേന്മയുള്ള സേവനം, നേരിട്ടുള്ള ബന്ധം', description: 'നിങ്ങളുടെ ആവശ്യങ്ങൾ ഞങ്ങളുമായി പങ്കിടുക.', cta: 'WhatsApp ചെയ്യുക' },
    ],
    leads: [
      { headline: 'ഇപ്പോൾ വിവരങ്ങൾ നേടി ബുക്ക് ചെയ്യുക', description: 'ഞങ്ങളുടെ സേവനങ്ങളെക്കുറിച്ച് ചോദിക്കുകയും ബുക്കിംഗ് നടത്തുകയും ചെയ്യുക.', cta: 'ഇപ്പോൾ ബുക്ക് ചെയ്യുക' },
      { headline: 'നിങ്ങൾക്കായി പ്രത്യേക ഓഫർ', description: 'ഞങ്ങളെ ബന്ധപ്പെടുകയും സേവനങ്ങൾ ബുക്ക് ചെയ്യുകയും ചെയ്യുക.', cta: 'ഫോം പൂരിപ്പിക്കുക' },
      { headline: 'ഇന്ന് തന്നെ ബന്ധപ്പെടുക', description: 'നിങ്ങളെ സഹായിക്കാൻ ഞങ്ങളുടെ വിദഗ്ധർ തയ്യാറാണ്.', cta: 'അന്വേഷിക്കുക' },
    ],
    awareness: [
      { headline: 'നിങ്ങളുടെ നഗരത്തിൽ മികച്ച സേവനം', description: 'ഗുണനിലവാരവും വിശ്വാസവുംകൊണ്ട് — നിങ്ങൾക്കായി.', cta: 'കൂടുതൽ അറിയുക' },
      { headline: 'പുതിയ അനുഭവത്തെ സ്വാഗതം ചെയ്യുക', description: 'ഞങ്ങളുടെ സേവനങ്ങൾ കണ്ടെത്തി ഇന്ന് തന്നെ ചേരുക.', cta: 'ഞങ്ങളെ അറിയുക' },
      { headline: 'നിങ്ങളുടെ വിശ്വസ്ത ബിസിനസ്', description: 'പ്രാദേശിക ബിസിനസ്, മികച്ച ഗുണനിലവാരം — നിങ്ങൾക്കായി.', cta: 'കാണുക' },
    ],
  },
  pa: {
    messages: [
      { headline: 'ਅੱਜ ਹੀ WhatsApp ਤੇ ਸੰਪਰਕ ਕਰੋ', description: 'ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਬਾਰੇ ਜਾਣੋ ਅਤੇ ਹੁਣੇ ਅਪੌਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ।', cta: 'WhatsApp ਤੇ ਸੰਪਰਕ ਕਰੋ' },
      { headline: 'ਵਧੀਆ ਸੇਵਾ, ਤੁਹਾਡੇ ਨੇੜੇ', description: 'ਸਾਨੂੰ WhatsApp ਤੇ ਮੈਸੇਜ ਕਰੋ ਅਤੇ ਵੇਰਵੇ ਪ੍ਰਾਪਤ ਕਰੋ।', cta: 'ਹੁਣੇ ਮੈਸੇਜ ਕਰੋ' },
      { headline: 'ਗੁਣਵੱਤਾ ਸੇਵਾ, ਸਿੱਧਾ ਸੰਪਰਕ', description: 'ਆਪਣੀਆਂ ਲੋੜਾਂ ਸਾਡੇ ਨਾਲ ਸਾਂਝੀਆਂ ਕਰੋ।', cta: 'WhatsApp ਕਰੋ' },
    ],
    leads: [
      { headline: 'ਹੁਣੇ ਜਾਣਕਾਰੀ ਲਓ ਅਤੇ ਬੁੱਕ ਕਰੋ', description: 'ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਬਾਰੇ ਪੁੱਛੋ ਅਤੇ ਬੁਕਿੰਗ ਕਰੋ।', cta: 'ਹੁਣੇ ਬੁੱਕ ਕਰੋ' },
      { headline: 'ਤੁਹਾਡੇ ਲਈ ਖਾਸ ਪੇਸ਼ਕਸ਼', description: 'ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਅਤੇ ਸੇਵਾਵਾਂ ਬੁੱਕ ਕਰੋ।', cta: 'ਫਾਰਮ ਭਰੋ' },
      { headline: 'ਅੱਜ ਹੀ ਸੰਪਰਕ ਕਰੋ', description: 'ਸਾਡੇ ਮਾਹਰ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਤਿਆਰ ਹਨ।', cta: 'ਪੁੱਛਗਿੱਛ ਕਰੋ' },
    ],
    awareness: [
      { headline: 'ਤੁਹਾਡੇ ਸ਼ਹਿਰ ਵਿੱਚ ਸਭ ਤੋਂ ਵਧੀਆ ਸੇਵਾ', description: 'ਗੁਣਵੱਤਾ ਅਤੇ ਭਰੋਸੇ ਨਾਲ — ਤੁਹਾਡੇ ਲਈ।', cta: 'ਹੋਰ ਜਾਣੋ' },
      { headline: 'ਨਵੇਂ ਅਨੁਭਵ ਦਾ ਸੁਆਗਤ ਕਰੋ', description: 'ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਦੀ ਖੋਜ ਕਰੋ ਅਤੇ ਅੱਜ ਹੀ ਜੁੜੋ।', cta: 'ਸਾਨੂੰ ਜਾਣੋ' },
      { headline: 'ਤੁਹਾਡਾ ਭਰੋਸੇਮੰਦ ਕਾਰੋਬਾਰ', description: 'ਸਥਾਨਕ ਕਾਰੋਬਾਰ, ਉੱਤਮ ਗੁਣਵੱਤਾ — ਤੁਹਾਡੇ ਲਈ।', cta: 'ਦੇਖੋ' },
    ],
  },
  gu: {
    messages: [
      { headline: 'આજે જ WhatsApp પર સંપર્ક કરો', description: 'અમારી સેવાઓ વિશે જાણો અને હમણાં જ એપોઇન્ટમેન્ટ બુક કરો.', cta: 'WhatsApp પર સંપર્ક કરો' },
      { headline: 'શ્રેષ્ઠ સેવા, તમારી નજીક', description: 'અમને WhatsApp પર મેસેજ કરો અને વિગતો મેળવો.', cta: 'હમણાં જ મેસેજ કરો' },
      { headline: 'ગુણવત્તાયુક્ત સેવા, સીધો સંપર્ક', description: 'તમારી જરૂરિયાતો અમારી સાથે શેર કરો.', cta: 'WhatsApp કરો' },
    ],
    leads: [
      { headline: 'હમણાં જ માહિતી લો અને બુક કરો', description: 'અમારી સેવાઓ વિશે પૂછો અને બુકિંગ કરો.', cta: 'હમણાં જ બુક કરો' },
      { headline: 'તમારા માટે ખાસ ઑફર', description: 'અમારી સાથે સંપર્ક કરો અને સેવાઓ બુક કરો.', cta: 'ફોર્મ ભરો' },
      { headline: 'આજે જ સંપર્ક કરો', description: 'અમારા નિષ્ણાતો તમને મદદ માટે તૈયાર છે.', cta: 'પૂછપરછ કરો' },
    ],
    awareness: [
      { headline: 'તમારા શહેરમાં શ્રેષ્ઠ સેવા', description: 'ગુણવત્તા અને વિશ્વાસ સાથે — તમારા માટે.', cta: 'વધુ જાણો' },
      { headline: 'નવા અનુભવનું સ્વાગત કરો', description: 'અમારી સેવાઓ શોધો અને આજે જ જોડાઓ.', cta: 'અમને જાણો' },
      { headline: 'તમારો વિશ્વાસપાત્ર વ્યવસાય', description: 'સ્થાનિક વ્યવસાય, ઉત્તમ ગુણવત્તા — તમારા માટે.', cta: 'જુઓ' },
    ],
  },
  kn: {
    messages: [
      { headline: 'ಇಂದೇ WhatsApp ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ', description: 'ನಮ್ಮ ಸೇವೆಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ ಮತ್ತು ಈಗಲೇ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ.', cta: 'WhatsApp ಮಾಡಿ' },
      { headline: 'ಅತ್ಯುತ್ತಮ ಸೇವೆ, ನಿಮ್ಮ ಹತ್ತಿರ', description: 'ನಮಗೆ WhatsApp ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ ಮತ್ತು ವಿವರಗಳನ್ನು ಪಡೆಯಿರಿ.', cta: 'ಈಗಲೇ ಸಂದೇಶ ಕಳುಹಿಸಿ' },
      { headline: 'ಗುಣಮಟ್ಟದ ಸೇವೆ, ನೇರ ಸಂಪರ್ಕ', description: 'ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ನಮ್ಮೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.', cta: 'WhatsApp ಮಾಡಿ' },
    ],
    leads: [
      { headline: 'ಈಗಲೇ ಮಾಹಿತಿ ಪಡೆದು ಬುಕ್ ಮಾಡಿ', description: 'ನಮ್ಮ ಸೇವೆಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸಿ ಮತ್ತು ಬುಕಿಂಗ್ ಮಾಡಿ.', cta: 'ಈಗಲೇ ಬುಕ್ ಮಾಡಿ' },
      { headline: 'ನಿಮಗಾಗಿ ವಿಶೇಷ ಕೊಡುಗೆ', description: 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಸೇವೆಗಳನ್ನು ಬುಕ್ ಮಾಡಿ.', cta: 'ಫಾರಂ ಭರ್ತಿ ಮಾಡಿ' },
      { headline: 'ಇಂದೇ ಸಂಪರ್ಕಿಸಿ', description: 'ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಮ್ಮ ತಜ್ಞರು ಸಿದ್ಧರಿದ್ದಾರೆ.', cta: 'ವಿಚಾರಿಸಿ' },
    ],
    awareness: [
      { headline: 'ನಿಮ್ಮ ನಗರದಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಸೇವೆ', description: 'ಗುಣಮಟ್ಟ ಮತ್ತು ವಿಶ್ವಾಸದೊಂದಿಗೆ — ನಿಮಗಾಗಿ.', cta: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ' },
      { headline: 'ಹೊಸ ಅನುಭವವನ್ನು ಸ್ವಾಗತಿಸಿ', description: 'ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ ಮತ್ತು ಇಂದೇ ಸೇರಿ.', cta: 'ನಮ್ಮನ್ನು ತಿಳಿಯಿರಿ' },
      { headline: 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ವ್ಯಾಪಾರ', description: 'ಸ್ಥಳೀಯ ವ್ಯಾಪಾರ, ಉತ್ತಮ ಗುಣಮಟ್ಟ — ನಿಮಗಾಗಿ.', cta: 'ನೋಡಿ' },
    ],
  },
  sd: {
    messages: [
      { headline: 'اڄ ئي WhatsApp تي رابطو ڪريو', description: 'اسان جي خدمتن بابت ڄاڻو ۽ هاڻي اپائنٽمينٽ بُڪ ڪريو.', cta: 'WhatsApp تي رابطو ڪريو' },
      { headline: 'بهترين خدمت، توهان جي ويجهو', description: 'اسان کي WhatsApp تي پيغام موڪليو ۽ تفصيل حاصل ڪريو.', cta: 'هاڻي پيغام موڪليو' },
      { headline: 'معياري خدمت، سڌو رابطو', description: 'پنهنجون ضرورتون اسان سان شيئر ڪريو.', cta: 'WhatsApp ڪريو' },
    ],
    leads: [
      { headline: 'هاڻي معلومات حاصل ڪريو ۽ بُڪ ڪريو', description: 'اسان جي خدمتن بابت پڇو ۽ بُڪنگ ڪريو.', cta: 'هاڻي بُڪ ڪريو' },
      { headline: 'توهان لاءِ خاص پيشڪش', description: 'اسان سان رابطو ڪريو ۽ خدمتون بُڪ ڪريو.', cta: 'فارم ڀريو' },
      { headline: 'اڄ ئي رابطو ڪريو', description: 'اسان جا ماهر توهان جي مدد لاءِ تيار آهن.', cta: 'پڇا ڳڇا ڪريو' },
    ],
    awareness: [
      { headline: 'توهان جي شهر ۾ بهترين خدمت', description: 'معيار ۽ اعتماد سان — توهان لاءِ.', cta: 'وڌيڪ ڄاڻو' },
      { headline: 'نئين تجربي جو استقبال ڪريو', description: 'اسان جي خدمتن کي ڳوليو ۽ اڄ ئي شامل ٿيو.', cta: 'اسان کي ڄاڻو' },
      { headline: 'توهان جو قابل اعتماد ڪاروبار', description: 'مقامي ڪاروبار، بهترين معيار — توهان لاءِ.', cta: 'ڏسو' },
    ],
  },
  as: {
    messages: [
      { headline: 'আজিয়েই WhatsApp ত যোগাযোগ কৰক', description: 'আমাৰ সেৱা সম্পৰ্কে জানক আৰু এতিয়াই এপইণ্টমেণ্ট বুক কৰক।', cta: 'WhatsApp কৰক' },
      { headline: 'উত্তম সেৱা, আপোনাৰ ওচৰতে', description: 'আমাক WhatsApp ত মেছেজ কৰক আৰু বিস্তাৰিত জানক।', cta: 'এতিয়াই মেছেজ কৰক' },
      { headline: 'মানসম্পন্ন সেৱা, পোনপটীয়া যোগাযোগ', description: 'আপোনাৰ প্ৰয়োজনীয়তা আমাৰ সৈতে শ্বেয়াৰ কৰক।', cta: 'WhatsApp কৰক' },
    ],
    leads: [
      { headline: 'এতিয়াই তথ্য লওক আৰু বুক কৰক', description: 'আমাৰ সেৱা সম্পৰ্কে সুধক আৰু বুকিং কৰক।', cta: 'এতিয়াই বুক কৰক' },
      { headline: 'আপোনাৰ বাবে বিশেষ অফাৰ', description: 'আমাৰ সৈতে যোগাযোগ কৰক আৰু সেৱা বুক কৰক।', cta: 'ফৰ্ম পূৰণ কৰক' },
      { headline: 'আজিয়েই যোগাযোগ কৰক', description: 'আপোনাক সহায় কৰিবলৈ আমাৰ বিশেষজ্ঞ সাজু।', cta: 'সুধক' },
    ],
    awareness: [
      { headline: 'আপোনাৰ চহৰত উত্তম সেৱা', description: 'মান আৰু বিশ্বাসৰ সৈতে — আপোনাৰ বাবে।', cta: 'অধিক জানক' },
      { headline: 'নতুন অভিজ্ঞতাৰ স্বাগত', description: 'আমাৰ সেৱা আৱিষ্কাৰ কৰক আৰু আজিয়েই যোগ দিয়ক।', cta: 'আমাক জানক' },
      { headline: 'আপোনাৰ বিশ্বাসযোগ্য ব্যৱসায়', description: 'স্থানীয় ব্যৱসায়, উৎকৃষ্ট মান — আপোনাৰ বাবে।', cta: 'চাওক' },
    ],
  },
};

function applyCreativeDirection(
  variations: CreativeVariation[],
  business: BusinessProfile,
  customPrompt?: string
): CreativeVariation[] {
  const prompt = customPrompt?.trim();
  if (!prompt) return variations;

  const lowerPrompt = prompt.toLowerCase();
  const focus = prompt.match(
    /\b(?:focus(?:ed)? on|highlight(?:ing)?|promot(?:e|ing)|feature|featuring|mention(?:ing)?|include|about)\s+(?:our\s+)?([^.!?\n]+)/i
  )?.[1]?.trim();

  let toneIntro = '';
  if (/\b(luxury|premium|elegant|refined)\b/.test(lowerPrompt)) {
    toneIntro = 'Enjoy a more refined experience.';
  } else if (/\b(warm|friendly|welcoming|personal)\b/.test(lowerPrompt)) {
    toneIntro = 'Get friendly, personal service from a local team.';
  } else if (/\b(playful|fun|cheerful|upbeat)\b/.test(lowerPrompt)) {
    toneIntro = 'Make room for something fun and feel-good.';
  } else if (/\b(professional|expert|trustworthy|reliable)\b/.test(lowerPrompt)) {
    toneIntro = 'Get professional, attentive service close to home.';
  }

  if (!focus && !toneIntro) return variations;

  return variations.map((variation) => ({
    ...variation,
    description: [
      toneIntro,
      focus ? `Ask ${business.businessName} about ${focus} when you reach out.` : '',
      variation.description,
    ]
      .filter(Boolean)
      .join(' '),
  }));
}

export const AIEngine = {
  /**
   * Builds a campaign suggestion from local business and objective rules.
   */
  async generateStrategy({
    business,
    objective,
    budget = 5000,
    durationDays = 10,
  }: GenerateStrategyParams): Promise<AIRecommendation> {
    const city = business.location.city || 'Lucknow';
    const area = business.location.area || 'City Centre';
    const category = business.category.toLowerCase();
    const isBeauty = category.includes('beauty') || category.includes('salon');
    const isEducation = category.includes('education') || category.includes('coach');
    const isFood = category.includes('food') || category.includes('restaurant') || category.includes('cafe');
    const isFitness = category.includes('fitness') || category.includes('gym');

    let defaultName = `${business.businessName} - Local Ad`;
    let hook = `Ask ${business.businessName} about ${business.category.toLowerCase()} services.`;
    let rationale = `People near ${business.businessName} may want to ask about these services.`;
    let recommendedCTA: CTAType = 'Learn More';
    let suggestedInterests: string[] = ['Local Services', 'Community News'];
    let themes = ['Local Service', 'Convenient Location', 'Personal Support'];

    if (objective === 'messages') {
      recommendedCTA = 'Send WhatsApp Message';
      if (isBeauty) {
        defaultName = `${business.businessName} - Bridal & Party Makeover WhatsApp`;
        hook = 'Direct consultation booking with personalized pre-bridal recommendations.';
        rationale = 'People nearby can ask about services and appointment times on WhatsApp.';
        suggestedInterests = ['Bridal Makeup', 'Wedding Planning', 'Skin Care', 'Indian Ethnic Wear', 'Luxury Salons'];
        themes = ['Wedding Season Glamour', 'Customized Consultation', 'Appointment Enquiries'];
      } else if (isFood) {
        defaultName = `${business.businessName} - Table Booking via WhatsApp`;
        hook = 'Ask about menu options and table availability.';
        rationale = 'People nearby can ask about the menu and table availability on WhatsApp.';
        suggestedInterests = ['Fine Dining', 'North Indian Food', 'Weekend Dining', 'Foodies'];
        themes = ['Heritage Taste', 'Celebration Dinners', 'Family Friendly'];
      } else {
        defaultName = `${business.businessName} - WhatsApp Connect`;
        hook = 'Fast, one-on-one consultation with business owner.';
        rationale = 'People can ask you a question directly instead of filling out a form.';
        suggestedInterests = ['Small Business', 'Local Services', 'Instant Booking'];
      }
    } else if (objective === 'leads') {
      recommendedCTA = 'Book Now';
      if (isEducation) {
        defaultName = `${business.businessName} - Course Enquiries`;
        hook = 'Invite prospective students to ask about courses and enrollment.';
        rationale = 'You can call people who want to know more about your courses.';
        suggestedInterests = ['CBSE Board Exams', 'IIT-JEE Preparation', 'NEET Coaching', 'Parenting & Education'];
        themes = ['Course Options', 'Learning Approach', 'Class Enquiries'];
      } else if (isFitness) {
        defaultName = `${business.businessName} - Membership Enquiries`;
        hook = 'Invite prospective members to ask about facilities, schedules, and membership options.';
        rationale = 'People can ask you about the gym, classes, and membership.';
        suggestedInterests = ['Fitness & Gym', 'Weight Loss', 'CrossFit & Strength', 'Healthy Lifestyle'];
        themes = ['Available Facilities', 'Class Schedules', 'Membership Options'];
      } else {
        defaultName = `${business.businessName} - Customer Leads`;
        hook = 'Invite prospective customers to ask about services and availability.';
        rationale = 'People can leave their number so you can call them about your services.';
        suggestedInterests = ['Local Commerce', 'Special Offers', 'Quality Services'];
      }
    } else {
      // awareness
      recommendedCTA = 'Learn More';
      defaultName = `${business.businessName} - Local Awareness`;
      hook = 'Show what your business offers and how nearby customers can find you.';
      rationale = `Build local awareness around ${area}, ${city}, and help nearby residents discover your business.`;
      suggestedInterests = ['Local News', 'City Lifestyle', 'Trending in ' + city, 'Neighbourhood Recommendations'];
      themes = ['Your Services', 'Your Location', 'Your Business'];
    }

    const calculatedDaily = Math.round(budget / durationDays);

    return {
      id: `rec-${Date.now()}`,
      campaignName: defaultName,
      strategySummary: 'We’ll show this ad to people near {area}, {city}.',
      targetAudienceRationale: rationale,
      suggestedDurationDays: durationDays,
      suggestedDailyBudget: calculatedDaily,
      suggestedTotalBudget: budget,
      recommendedCTA,
      keyMarketingHook: hook,
      creativeThemes: themes,
      suggestedInterests,
    };
  },

  /**
   * Builds copy variations from sample creatives or local business details.
   */
  async generateCreatives({
    business,
    objective,
    customPrompt,
    adLanguage = 'en',
  }: GenerateCreativesParams): Promise<CreativeVariation[]> {
    // Check if we have vernacular templates for this language and objective
    if (adLanguage && adLanguage !== 'en' && VERNACULAR_TEMPLATES[adLanguage]) {
      const templates = VERNACULAR_TEMPLATES[adLanguage][objective];
      if (templates && templates.length > 0) {
        const variations = templates.map((template, idx) => ({
          id: `var-${Date.now()}-${idx + 1}`,
          headline: template.headline,
          description: template.description,
          cta: template.cta as CTAType,
          imageUrl: '',
          imageAlt: `${business.businessName} ad`,
          badgeText: `Ad idea ${idx + 1}`,
          primaryBenefit: template.headline,
          tagline: `${business.businessName} • ${business.location.city}`,
        }));
        return applyCreativeDirection(variations, business, customPrompt);
      }
    }

    // Check if we have preset matching
    const matchingPreset = INDIAN_SMB_PRESETS.find(
      (p) => p.category.toLowerCase() === business.category.toLowerCase() ||
             business.businessName.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())
    );

    const city = business.location.city || 'your city';
    const ctaDefault: CTAType =
      objective === 'messages' ? 'Send WhatsApp Message' : objective === 'leads' ? 'Book Now' : 'Learn More';

    if (matchingPreset && matchingPreset.sampleCreatives.length >= 3) {
      const variations = matchingPreset.sampleCreatives.map((c, idx) => {
        // Replace placeholders with actual business values
        const headline = c.headline
          .replace(/\{category\}/g, business.category)
          .replace(/\{name\}/g, business.businessName)
          .replace(/\{city\}/g, city);
        const description = c.description
          .replace(/\{category\}/g, business.category)
          .replace(/\{name\}/g, business.businessName)
          .replace(/\{city\}/g, city);
        
        return {
          id: `var-${Date.now()}-${idx + 1}`,
          headline,
          description,
          cta: (objective === 'messages' ? 'Send WhatsApp Message' : c.cta) as CTAType,
          imageUrl: c.imageUrl,
          imageAlt: c.imageAlt,
          badgeText: `Ad idea ${idx + 1}`,
          primaryBenefit: c.primaryBenefit,
          tagline: `${business.businessName} • ${business.location.city}`,
        };
      });
      return applyCreativeDirection(variations, business, customPrompt);
    }

    // Dynamic generation based on business fields
    const defaultImages = [
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
    ];

    const variations = [
      {
        id: `var-${Date.now()}-1`,
        headline: `Explore ${business.businessName}`,
        description: `${business.description.slice(0, 110)}... Serving ${city}. Tap below to ask about services.`,
        cta: ctaDefault,
        imageUrl: defaultImages[0],
        imageAlt: `${business.businessName} showcase`,
        badgeText: 'Service Information',
        primaryBenefit: 'Local Service & Direct Support',
        tagline: `${business.businessName} • Trusted in ${city}`,
      },
      {
        id: `var-${Date.now()}-2`,
        headline: `Looking for ${business.category} in ${city}?`,
        description: `Connect with ${business.businessName} to learn about services, availability, and pricing.`,
        cta: (objective === 'messages' ? 'Send WhatsApp Message' : 'Get Offer') as CTAType,
        imageUrl: defaultImages[1],
        imageAlt: `${business.businessName} customer experience`,
        badgeText: 'Local Services',
        primaryBenefit: 'Local Service',
        tagline: `Visit us in ${city}`,
      },
      {
        id: `var-${Date.now()}-3`,
        headline: `Ask ${business.businessName} About Available Services`,
        description: `Enjoy personalized service crafted for you. Chat with us on WhatsApp or book an appointment online in seconds.`,
        cta: (objective === 'messages' ? 'Send WhatsApp Message' : 'Call Now') as CTAType,
        imageUrl: defaultImages[2],
        imageAlt: `${business.businessName} team and facility`,
        badgeText: 'Get in Touch',
        primaryBenefit: 'Direct Contact',
        tagline: `Direct Line: ${business.phone || 'Available Now'}`,
      },
    ];
    return applyCreativeDirection(variations, business, customPrompt);
  },

  /**
   * Summarizes simulated campaign metrics for the demo.
   */
  generateInsights(
    objective: CampaignObjective,
    metrics: { totalSpend: number; impressions: number; clicks: number; leads?: number; messages?: number }
  ): {
    headline: string;
    summary: string;
    tips: string[];
    plainExplanation: string;
  } {
    const { totalSpend, impressions, clicks, leads, messages } = metrics;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0';

    if (objective === 'messages') {
      const msgCount = messages || Math.round(clicks * 0.15) || 12;
      const costPerMessage = Math.round(totalSpend / Math.max(1, msgCount));
      return {
        headline: `Practice: ${msgCount} WhatsApp chats`,
        summary: `In this practice data, about ${msgCount} chats came from this ad, at about ₹${costPerMessage} per chat.`,
        tips: [
          'Reply to new WhatsApp messages quickly.',
          'Save a short reply with your prices, menu and address.',
          'Review your offer and area before changing the amount.',
        ],
        plainExplanation: `These are practice numbers: ${msgCount} chats from ${ctr}% of people who clicked. They are not real ad results.`,
      };
    } else if (objective === 'leads') {
      const leadCount = leads || Math.round(clicks * 0.08) || 8;
      const cpl = Math.round(totalSpend / Math.max(1, leadCount));
      return {
        headline: `Practice: ${leadCount} enquiries`,
        summary: `In this practice data, about ${leadCount} enquiries came from this ad, at about ₹${cpl} each.`,
        tips: [
          'Reply to new enquiries quickly.',
          'Mention the offer from your ad when you call or message someone.',
          'Change the area only after you have seen a few results.',
        ],
        plainExplanation: `These are practice numbers: ₹${totalSpend.toLocaleString('en-IN')} of example spend and ${leadCount} enquiries. They are not real ad results.`,
      };
    } else {
      return {
        headline: `Practice: ${impressions.toLocaleString('en-IN')} views`,
        summary: `In this practice data, the ad was shown about ${impressions.toLocaleString('en-IN')} times.`,
        tips: [
          'Use this view to see how results would be shown.',
          'Connect a real ad account before using these numbers to make decisions.',
        ],
        plainExplanation: `These are practice views, not real people reached.`,
      };
    }
  },

  generatePerformanceRecommendations(
    campaign: Campaign,
    options: { acceptableCostPerLead?: number } = {},
  ): PerformanceRecommendation[] {
    const metrics = campaign.metrics;
    const sourceLabel =
      campaign.executionMode === 'simulated' || metrics?.source === 'simulated'
        ? 'shown in the practice data'
        : 'reported by the ad platform';

    if (!metrics) {
      return [
        {
          id: `rec-${campaign.id}-measure`,
          title: 'Get a few numbers first',
          whatHappened: 'This plan has no results yet.',
          whatItMayMean:
            'There is not enough information to judge the ad, the area or the amount.',
          whyItMatters:
            'Changing things without a starting point makes it hard to learn what worked.',
          suggestedAction:
            'Check where people go and how enquiries are counted, then run a small test before changing the amount.',
          evidence: 'This plan has no results attached.',
          uncertainty: 'High: there is no result to look at yet.',
          source: 'best_practice',
          tradeoff: 'A small test takes longer but gives you a result you can trust.',
          metricToWatch: 'Whether the ad ran, the amount used and the first enquiry',
        },
      ];
    }

    const outcomes =
      campaign.objective === 'messages'
        ? metrics.totalMessages || 0
        : campaign.objective === 'leads'
          ? metrics.totalLeads || 0
          : metrics.totalClicks;
    const costPerOutcome =
      outcomes > 0
        ? campaign.objective === 'messages'
          ? metrics.costPerMessage || metrics.totalSpend / outcomes
          : campaign.objective === 'leads'
            ? metrics.costPerLead || metrics.totalSpend / outcomes
            : metrics.costPerClick || metrics.totalSpend / outcomes
        : 0;
    const ctr =
      metrics.totalImpressions > 0
        ? (metrics.totalClicks / metrics.totalImpressions) * 100
        : 0;
    const spendShare =
      campaign.totalBudget > 0 ? (metrics.totalSpend / campaign.totalBudget) * 100 : 0;
    const sampleIsSmall = outcomes < 10 || metrics.totalClicks < 100;
    const acceptable = options.acceptableCostPerLead;

    const recommendations: PerformanceRecommendation[] = [];

    if (acceptable && costPerOutcome > acceptable && outcomes > 0) {
      recommendations.push({
        id: `rec-${campaign.id}-cost`,
        title: 'Each enquiry costs more than your target',
        whatHappened: `The practice data shows about ₹${Math.round(costPerOutcome).toLocaleString('en-IN')} per enquiry. Your target is ₹${acceptable.toLocaleString('en-IN')}.`,
        whatItMayMean:
          'The offer, area or link may need work. The sample may also be too small to trust.',
        whyItMatters:
          'If each enquiry costs more than you can afford, you have less room to make a profit.',
        suggestedAction:
          'Keep the amount steady, improve the offer and your replies, and collect more results before changing the area.',
        evidence: `This is ${sourceLabel}: ${outcomes} attributed outcomes from ${metrics.totalClicks} clicks.`,
        uncertainty: sampleIsSmall
          ? 'The sample is small, so this may change.'
          : 'Some enquiries may be missed, so the real cost could be higher or lower.',
        source: 'observed',
        tradeoff: 'Waiting gives a clearer picture but slows changes.',
        metricToWatch: 'Cost per enquiry over the next two weeks',
      });
    }

    if (metrics.totalClicks > 0 && outcomes === 0) {
      recommendations.push({
        id: `rec-${campaign.id}-destination`,
        title: 'People clicked but no enquiry came through',
        whatHappened: `${metrics.totalClicks} people clicked, but no enquiry was recorded yet.`,
        whatItMayMean:
          'The link or number may be hard to use, replies may not be counted, or people lost interest.',
        whyItMatters:
          'Clicks alone do not bring customers. What happens next decides whether interest becomes an enquiry.',
        suggestedAction:
          'Open the WhatsApp link or call the number yourself. Check that new enquiries are being counted.',
        evidence: `${metrics.totalClicks} clicks in the practice data.`,
        uncertainty: 'The problem may be in how enquiries are counted rather than the link.',
        source: 'diagnostic',
        tradeoff: 'Fixing the link or reply setup may take a little time before you add more money.',
        metricToWatch: 'How many clicks become an enquiry',
      });
    }

    if (spendShare < 70 && campaign.status !== 'completed') {
      recommendations.push({
        id: `rec-${campaign.id}-pacing`,
        title: 'The ad has used less than the planned amount',
        whatHappened: `About ${Math.round(spendShare)}% of the planned amount has been used so far.`,
        whatItMayMean:
          'Fewer people may be seeing it because of the area size, the schedule or a pause.',
        whyItMatters:
          'If it runs too little, there may not be enough results to judge.',
        suggestedAction:
          'Check that the ad is running and the dates are right before adding more money.',
        evidence: `Practice spend is ₹${metrics.totalSpend.toLocaleString('en-IN')} of ₹${campaign.totalBudget.toLocaleString('en-IN')} planned.`,
        uncertainty: 'This practice view does not show live platform reasons.',
        source: 'diagnostic',
        tradeoff: 'Adding money may help, but only after you know why it is low.',
        metricToWatch: 'Daily amount used against the plan',
      });
    }

    const hasDelivery = Boolean(
      metrics && (metrics.totalSpend > 0 || (metrics.totalImpressions ?? 0) > 0),
    );
    if (campaign.status === 'active' && !hasDelivery) {
      recommendations.push({
        id: `rec-${campaign.id}-delivery`,
        title: 'The campaign has not delivered yet',
        whatHappened: metrics
          ? `About ₹${metrics.totalSpend.toLocaleString('en-IN')} was planned, but no delivery is recorded in the practice data yet.`
          : 'No delivery is recorded for this campaign yet.',
        whatItMayMean:
          'The campaign may be waiting on account readiness, tracking or the area setup before delivery can be trusted.',
        whyItMatters:
          'An approved campaign that never delivers can waste budget and owner confidence.',
        suggestedAction:
          'Hold the plan and check the delivery or preflight state before adding more money.',
        evidence: sourceLabel,
        uncertainty: 'High: without delivery data this is still a hypothesis.',
        source: 'diagnostic',
        tradeoff: 'Holding spend is slower, but safer than guessing.',
        metricToWatch: 'Delivery status and first spend',
        apply: { action: 'paused', label: 'Hold plan' },
      });
    }

    const variationCount = campaign.creative?.variations?.length || 0;
    if (variationCount > 1) {
      recommendations.push({
        id: `rec-${campaign.id}-variants`,
        title: 'Compare your creative variants',
        whatHappened: `This plan carries ${variationCount} creative variations to compare.`,
        whatItMayMean:
          'One version may outperform the other, but the practice sample is too small to say yet.',
        whyItMatters:
          'The creative is often the biggest lever in a small local ad.',
        suggestedAction:
          'Keep the stronger variant and test the next one after enough outcomes come in.',
        evidence: `The plan carries ${variationCount} creative variations.`,
        uncertainty:
          'High: creative comparison needs enough outcomes before it is meaningful.',
        source: 'best_practice',
        tradeoff: 'Testing more variants spreads spend thinner.',
        metricToWatch: 'Enquiries per variation over the next test window',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: `rec-${campaign.id}-observe`,
        title: sampleIsSmall ? 'The result is still small' : 'Keep the current plan steady',
        whatHappened: `The practice data shows ${outcomes} enquiries and ${ctr.toFixed(2)}% of people clicked.`,
        whatItMayMean: sampleIsSmall
          ? 'There is not enough result yet to justify a change.'
          : 'No clear problem is visible in the practice data.',
        whyItMatters:
          'Changing things again and again makes it hard to learn what worked.',
        suggestedAction:
          'Keep the plan steady, reply to enquiries quickly, and look again after more results.',
        evidence: `Based on ${sourceLabel}: ${metrics.totalClicks} clicks.`,
        uncertainty: sampleIsSmall
          ? 'A small number of results can vary a lot.'
          : 'Other things may also have caused the enquiry.',
        source: 'observed',
        tradeoff: 'Waiting keeps the test clear but delays changes.',
        metricToWatch: 'Cost per enquiry and how many people reply',
      });
    }

    return recommendations.slice(0, 3);
  },
};
