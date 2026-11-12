import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'scripts', 'i18n-keys.json');

const walk = (dir) => {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'i18n') continue;
      files.push(...walk(full));
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
};

const files = walk(SRC);
const keys = new Set();

const isCopy = (text) => {
  if (text.length < 5 || text.length > 260) return false;
  if (!/^[A-Z0-9“‘'(₹]/.test(text)) return false;
  if (!/[A-Za-z]{3}/.test(text)) return false;
  if (!/\s/.test(text) && !/^(Yes|No|Save|Close|Next|Back|Cancel|Edit|Delete|Pause|Resume|Stop|Start|Retry|Continue)$/.test(text)) return false;
  if (/[{}<>$`=]/.test(text)) return false;
  if (/:\/\//.test(text)) return false;
  if (/^[A-Z_]+$/.test(text)) return false;
  if (/\b(flex|grid|text-|bg-|border-|rounded|px-|py-|mt-|mb-|w-|h-|min-h|font-|hover:|focus:|sm:|md:|lg:|xl:|gap-|space-|shadow|ring-|absolute|relative|hidden|inline|block)\b/.test(text)) return false;
  if (/^[a-z-]+$/.test(text)) return false;
  if (/(\.ts|\.tsx|\.js|\.json|\.css)$/.test(text)) return false;
  if (/^https?/.test(text)) return false;
  if (/\bpx\b|\brem\b|\bem\b/.test(text)) return false;
  if (/[^\u0000-\u024F\u2000-\u206F\u20B9\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u00A0]/.test(text)) return false;
  return true;
};

// 1. Everything explicitly wrapped in tr('...').
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /\btr\(\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let m;
  while ((m = re.exec(src))) {
    let text = m[2];
    try {
      text = JSON.parse('"' + text.replace(/"/g, '\\"') + '"');
    } catch {
      // Keep the raw string when unescaping fails.
    }
    if (text) keys.add(text);
  }
}

// 2. Interface copy. These are looked up by the English source string in the
// same dictionary, so the hardcoded per-language blocks can be removed.
const languageSrc = fs.readFileSync(path.join(SRC, 'services', 'language.ts'), 'utf8');
const enBlock = languageSrc.match(/const copy[^=]*= \{\s*en: \{([\s\S]*?)\n  \},\n\};/);
if (!enBlock) throw new Error('Could not find the English UI copy block.');
for (const match of enBlock[1].matchAll(/(\w+):\s*'((?:\\.|[^'])*)'/g)) {
  keys.add(match[2].replace(/\\'/g, "'"));
}

// 3. Copy produced by services (rationale, risks, recommendations, presets)
// and similar unwrapped strings in components.
const serviceFiles = [
  'services/aiEngine.ts',
  'services/budgetEngine.ts',
  'services/storage.ts',
  'services/auth.ts',
  'utils/presets.ts',
];
for (const relative of serviceFiles) {
  const file = path.join(SRC, relative);
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  const re = /(['"])((?:\\.|(?!\1)[^\\\n])*?)\1/g;
  let m;
  while ((m = re.exec(src))) {
    let text = m[2];
    try {
      text = JSON.parse('"' + text.replace(/"/g, '\\"') + '"');
    } catch {
      continue;
    }
    if (isCopy(text)) keys.add(text);
  }

  // Template strings with runtime values become {0}, {1} templates.
  for (const match of src.matchAll(/`([^`\\]|\\.)*`/g)) {
    const body = match[0].slice(1, -1);
    if (!body.includes('${')) continue;
    const parts = body.split(/\$\{([^}]*)\}/);
    let template = parts[0];
    for (let i = 1; i < parts.length; i += 2) {
      template += `{${(i - 1) / 2}}` + (parts[i + 1] ?? '');
    }
    template = template.trim();
    if (template.length >= 20 && /[A-Za-z]{3}/.test(template.replace(/\{\d\}/g, ''))) {
      keys.add(template);
    }
  }
}

// 4. Strings looked up through variables rather than literals.
for (const key of [
  'Saved ad',
  'AI ad idea {n}',
  'Ad idea {n}',
  'Beauty & Wellness',
  'Education & Coaching',
  'Restaurant & Dining',
  'Fitness & Gym',
  'Retail & Fashion',
  'Healthcare & Clinic',
  'Other local business',
  'active',
  'paused',
  'completed',
  'draft',
  'simulated',
  'pending_approval',
  'failed',
  'approved',
  'pending',
  'messages',
  'leads',
  'awareness',
  'whatsapp',
  'phone',
  'website',
  'lead_form',
  'booking_link',
  'directions',
  'instagram',
  'google_search',
  'meta',
  'google_ads',
  'ga4',
  'google_business',
  'not_connected',
  'demo_connected',
  'needs_attention',
  'low',
  'medium',
  'high',
  'recommended',
  'conservative',
  'test_first',
  'best_practice',
  'diagnostic',
  'observed',
  'platform',
  'first_party',
  'manual',
  'Button:',
]) keys.add(key);

// Proper nouns are already understood in every language.
for (const key of [
  'Aura Bridal Studio',
  'BrightPath Coaching',
  'Nukkad Kitchen',
  'AdMitra',
  'WhatsApp',
  'Google',
  'Google Search',
  'Google Business Profile',
  'Google Analytics 4',
  'GA4',
  'Instagram',
  'Facebook',
  'Meta',
]) keys.delete(key);

const list = [...keys].sort((a, b) => a.localeCompare(b));
fs.writeFileSync(OUT, JSON.stringify(list, null, 2));
console.log(`Wrote ${list.length} keys to ${path.relative(ROOT, OUT)}`);
