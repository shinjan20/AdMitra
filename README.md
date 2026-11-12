# AdMitra

AdMitra is a unified AI advertising and growth workspace for local Indian businesses. It turns business context into an explainable starting plan, helps create the ad, makes the hand-off and approval explicit, and separates simulated reporting from real outcomes.

This repository is a front-end demo. It does not publish ads, spend money, connect to ad accounts, or report verified performance. Every sample metric is labelled as demo data.

## What the product does

1. **Business context** — capture the category, service area, contact destinations, economics, investment comfort and brand guardrails. Unknown financial fields stay blank instead of being invented; the plan lowers its confidence when context is missing.
2. **Marketing plan** — build a budget allocation from the goal, category, readiness, economics, connected accounts and budget size. The recommendation includes assumptions, risks, a measurement signal and a confidence level, and every amount is editable.
3. **Creative** — generate or edit ad copy and an image in the chosen language, then review the customer destination before anything is saved.
4. **Preflight and owner approval** — check creative completeness, destination, audience, budget, tracking and ad-account readiness. Saving or materially changing spend requires an explicit owner approval.
5. **Reporting** — show spend, enquiries, cost per enquiry and channel performance with their source, attribution window and date range. Seeded results are illustrative examples, not campaign results.
6. **Recommendations** — explain what happened, what it may mean, why it matters, the suggested next action, the evidence, the uncertainty and the trade-off. Recommendations never change spend, audiences or publishing automatically.
7. **Connections** — describe the permissions each provider needs and why. Connections in this demo are simulated and stored only in the browser.

### Channel policy

- Paid media is allocated only to **Google Search** and **Meta ads (Facebook / Instagram)**.
- **WhatsApp** is a conversation and follow-up destination, never a standalone paid media channel.
- **Google Business Profile** is a free local listing, not a paid campaign.
- **Google Analytics 4** supplies optional website context and does not replace ad-platform reporting.

## Demo boundary

- The campaign wizard's strategy and creative suggestions come from local rules, presets and the deterministic budget engine.
- Budgets, audience estimates, schedules and dashboard metrics are planning examples only. Saving or approving a plan does not create an ad-account relationship, publish an ad, incur charges, or produce measurable reach or enquiries.
- "Connect demo" stores a simulated connection in this browser. No OAuth flow, provider token, account access or publishing permission is active.
- Business details, plans, drafts and simulated connections are stored in the browser and do not sync across devices.
- Sample business details and generated ad content are examples. Review all generated copy before using it.

## AI generation and languages

Live text and image generation use Gemini through the authenticated Supabase Edge Function in `supabase/functions/generate-ad`. Experimental video generation uses Gemini Omni Flash through `supabase/functions/generate-video`; provider availability and quota can vary, and generated MP4s are stored in the private `ad-videos` bucket. The Gemini key stays on the server. Each signed-in account can make up to 25 text/image attempts and 25 video attempts per UTC day; failed provider calls after quota consumption count as attempts.

AI generation requires a configured Supabase project, a real signed-in account, the quota/video-storage migrations, and a Gemini API key. Without that setup, the app shows a setup or sign-in message instead of substituting sample text. Video generation is asynchronous and can take several minutes; leave the studio open while it runs.

The interface and ad language choices include English, Hindi, Bengali, Tamil, Telugu, Marathi, Urdu, Malayalam, Punjabi, Gujarati, Kannada, Sindhi, and Assamese. Users can choose a language before signing in; signed-in first-time users are prompted to choose it and set up their shop before the optional visual tour. Urdu and Sindhi use right-to-left document direction. Voice typing uses the browser's speech-recognition service; language and browser support vary, and that service may send audio to its provider. Typed input is always available. Users can attach up to six photos per generation attempt (8 MB max per original photo); the browser resizes them before sending visual context to Gemini.

Generated images are held in the page for preview and are not saved with the local text draft. Generated videos are stored privately in Supabase Storage, and the studio reopens the most recent video for the signed-in account.

Instagram sharing is a manual copy-and-paste workflow: copy the caption, download the generated image, then add both in Instagram. Video sharing uses the device share sheet or a download. AdMitra does not connect to Meta accounts or publish posts directly.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To use live AI locally, create a Supabase project and configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a local `.env` file. Never put the Gemini key in a `VITE_` variable.

### Make ad pictures locally

The ad studio can make a new picture from the current ad idea. That request goes to a small server-side route in `vite.config.ts` (`POST /api/generate-ad-image`), which calls Gemini with the server-only key. Add the key to `.env.local` and restart the dev server:

```bash
GEMINI_API_KEY=<your-gemini-key>
```

`GEMINI_IMAGE_MODEL` is optional and defaults to `gemini-2.5-flash-image`. The key is read only by the dev/preview server, so it never reaches the browser bundle. On a hosted site, the same handler has to be deployed as a serverless function (or served through the Supabase function) because a static build has no server to read the key. If the key is missing, the studio says the picture maker is switched off instead of failing silently.


Without Supabase configuration the app runs in local demo mode. Sign in with the seeded demo owner account (`owner@aurabridal.in` / `password123`) to review the full flow.

## Set up live AI

1. Link the Supabase CLI to your project, then apply the usage-limit, video quota, and private storage migrations:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

2. Enable Google sign-in in Supabase if you plan to use it and configure your app's allowed redirect URLs. Email/password sign-in is available. To offer mobile-number OTP, enable Phone Auth and configure a Supabase-supported SMS provider; provider charges and delivery limits may apply. New users complete shop and language setup after verification.
3. Set the server-only Gemini key and the deployed app's exact origin:

   ```bash
   supabase secrets set GEMINI_API_KEY=<your-gemini-key> APP_ORIGIN=https://your-domain.example
   ```

   Keep this key out of source control, browser environment variables, and client code.
4. Optionally select text and image models using `GEMINI_TEXT_MODEL` and `GEMINI_IMAGE_MODEL` server secrets. Defaults are `gemini-3.8-flash` and `gemini-2.5-flash-image`. Video uses `gemini-omni-1.2-flash`.
5. Deploy both functions:

   ```bash
   supabase functions deploy generate-ad
   supabase functions deploy generate-video
   ```

For local Supabase development, set the same secrets in the local Edge Functions environment before serving the functions. The authenticated remaining-attempt RPCs report text/image and video limits separately.

## Check the build

```bash
npm run build
```

With live AI configured, try voice typing in each language supported by your browser, typed input, image and video generation, editing, copy/download/share, and reloading the saved text and latest video. At least one browser may not support the requested speech locale; typed input is the fallback. Video generation cannot be verified without a configured Gemini key and a project with access to Gemini Omni Flash.

## What this demo does not do

- It does not publish ads, connect to Google/Meta/WhatsApp/GA4 accounts, or spend money.
- Campaign planning, audience recommendations, budgets, schedules, seeded dashboard metrics and simulated connections are examples only; none are sent to an ad platform or measured.
- Authentication is handled by Supabase when configured; without it, sign-in is only a local demo and cannot use live AI.
- Business details, plans and drafts are stored in the browser, not a production database.
- Voice recognition is supplied by the browser and its speech provider; locale availability and audio handling vary.
- Sample business details and generated ad content are examples. Review all generated text before using it.

## Next steps before production

1. Run observed usability sessions with salon, restaurant, and coaching owners. Measure plan comprehension, approval comprehension, time to review, and edits to recommendations.
2. Validate every localized landing and planning-flow string with native speakers; test voice locale availability and browser privacy behavior.
3. Decide whether plans need account-scoped persistence, then add migration, export, and deletion support before using them as customer records.
4. Document provider data handling, consent, retention, and deletion for uploaded photos, generated videos, and Gemini interactions; the current video bucket has no automatic cleanup.
5. Before any real delivery, validate ad inventory and provider APIs, permissions and account linking, approval flows, spend caps, pricing and billing, attribution, support ownership, and rollback behavior.
6. Configure a Gemini key and verify live text, image, and video responses; provider behavior cannot be tested without project credentials.
7. Configure Supabase Phone Auth and an SMS provider, then test OTP delivery, resend limits, and verification with Indian numbers before launch.
8. Add automated tests for prompt validation, separate daily limits, multilingual output, video polling/storage, onboarding enforcement, plan persistence, approval gating, budget-engine rules, and copy/download/share behavior.
9. Validate Urdu and Sindhi RTL screens and review privacy, security, accessibility, mobile behavior, and performance before launch.
