# CampaignPilot 🚀
### Self-Serve AI Advertising Platform for Indian SMB Advertisers

> **"Turn your business goals into advertising campaigns in minutes, without needing to become an advertising expert."**

CampaignPilot is an AI-powered self-serve advertising platform purpose-built for small business owners (salons, coaching centres, restaurants, gyms, and local retailers). It removes advertising jargon (CTR, CPM, CPC) and replaces complex ad managers with a guided 6-step creation journey, AI-generated creatives, smart Indian location targeting, transparent budget math in Indian Rupees (₹), and a business-first analytics dashboard.

---

## 🌟 Key Features Implemented (PRD v1.0 Alignment)

### 1. Business Onboarding & Multi-Profile Management (Feature 1 - P0)
- **Indian SMB Presets (1-Click Instant Demo):**
  - *Aura Bridal Studio & Luxury Salon* (Lucknow) - Bridal makeovers, HD cosmetics, pre-wedding rituals
  - *Apex Scholars Academy* (Bengaluru) - Class 9-12 CBSE/ICSE, foundational JEE/NEET prep
  - *Saffron & Spice Artisan Kitchen* (Delhi NCR) - Authentic Awadhi dining, wood-fired kebabs
  - *IronPulse Fitness & Strength Club* (Mumbai) - CrossFit turf, strength training, 3-day guest trials
- **Custom Business Creation:** Supports business name, category, localized address, website, WhatsApp number, phone, and Instagram handle.
- Context is persistently saved and passed to downstream AI strategy and creative engines.

### 2. Campaign Goal Selection (Feature 2 - P0)
- Translates technical platform objectives into plain-language business outcomes:
  - **Get More Messages:** Direct WhatsApp & chat conversations with prospective clients.
  - **Generate More Leads:** Qualified contact enquiry collection for consultation or call-backs.
  - **Increase Local Brand Awareness:** Neighborhood recall for grand openings and store visits.
- Visual selection cards with examples, channel descriptions, and AI industry recommendations.

### 3. AI Campaign Recommendation Engine (Feature 3 - P0)
- Synthesizes business details, selected goal, and city to generate:
  - Campaign name and high-converting marketing hook.
  - Strategic rationale and audience matching score.
  - Recommended CTA button.
  - Duration and daily spend breakdown.
- Entire recommendation is editable with a 1-click **Regenerate Strategy** option.

### 4. AI Creative Studio & Multi-Format Previews (Feature 4 - P0)
- Generates **3+ distinct copy variations** (Headlines, Descriptions, Primary Benefits, and CTAs).
- **Curated High-Resolution Visual Assets** tailored to Indian local services.
- **In-Place Creative Customizer:** Edit headlines, descriptions, CTAs, and prompt-swap imagery.
- **Interactive Multi-Device Live Mockup:**
  - *Instagram/Facebook Feed (1:1)*
  - *WhatsApp Direct Click Ad (Chat flow)*
  - *Story / Reels (9:16 vertical)*
- **Guardrails:** Adheres to safety policies (no fake awards, testimonials, or certifications; clearly marked with an AI watermark).

### 5. Audience Configuration & Reach Estimator (Feature 5 - P0)
- **Indian City Targeting:** Pre-loaded with Lucknow, Bengaluru, Mumbai, Delhi NCR, Pune, Hyderabad, Kolkata, Ahmedabad, etc.
- **Interactive Distance Radius Slider:** 2 km to 35 km with immediate locality focus.
- **Demographics:** Age slider (18–65) and gender filters (All, Women, Men).
- **Affinities & Interests:** Quick-add tags tailored to Indian consumers (e.g. *Bridal Makeup*, *IIT-JEE Prep*, *Biryani Lovers*, *CrossFit*).
- **Live Audience Size Estimator:** Dynamically calculates estimated target reach with visual gauge.

### 6. Budget & Schedule Planner (Feature 6 - P0)
- 100% Indian Rupee (₹) pricing.
- **1-Click Preset Packages:**
  - *Starter Trial:* ₹2,500 over 5 days (Low risk testing)
  - *Growth Push:* ₹5,000 over 10 days (Recommended SMB balance)
  - *Maximum Reach:* ₹10,000 over 14 days (Local dominance)
- **Custom Budget & Duration:** Daily spend calculation (`₹5,000 / 10 days = ₹500/day`) and start date picker.
- **Projected Outcome Calculator:** Estimates expected WhatsApp chats, phone leads, or impressions.

### 7. Pre-Flight Validation & Simulated Demo Launch (Feature 7 - P0)
- Automated 5-point checklist verifying business data, objective, creative approval, audience radius, and budget.
- Clear **Prototype Simulation Notice** preventing any accidental real-world financial liability.
- Explicit user confirmation checkbox.
- Celebratory confetti launch animation on activation.

### 8. Campaign Dashboard & Management (Feature 8 - P0)
- **KPI Overview Cards:** Total Spend (₹), Direct Customer Inquiries, Cost per Lead/Chat, and Active Campaigns.
- **Campaign Table:** Filter by status (Active, Paused, Completed) and objective; search by campaign name or city.
- **Quick Controls:** Pause, Resume, Stop, and Delete campaigns in real-time.

### 9. Business-First Analytics & AI Performance Coach (Feature 9 - P0)
- Drill-down modal with interactive **Recharts Area Charts** (Daily Spend vs. Inquiries).
- **AI Performance Coach:** Translates CTR and CPC into plain English:
  - *"Your campaign has generated 25 enquiries so far at ₹120 per chat."*
  - Actionable tips (e.g., *"Respond on WhatsApp within 10 minutes to double conversion"*).

### 10. Funnel KPI Tracking & North Star Metrics (PRD Section 7)
- Persistent tracking of all 13 funnel events (`signup_completed`, `campaign_goal_selected`, `creative_generated`, `campaign_launch_confirmed`, etc.).
- Calculates **Weekly Value-Generating Advertisers (WVGA)** and launch conversion rates.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Strict typing across all PRD entities |
| **Build Tool** | Vite 6 | Sub-second HMR & optimized production build |
| **Styling** | Tailwind CSS 3 | Professional SaaS aesthetic, custom typography & colors |
| **Icons** | Lucide React | Clean, accessible iconography |
| **Charts** | Recharts 2 | Interactive spend vs. outcome visualizer |
| **Celebrations**| Canvas-Confetti | Launch confirmation animation |
| **Storage & DB** | Browser LocalStorage + Supabase JS Client | Zero-setup offline persistence with plug-and-play Supabase cloud readiness |
| **AI Layer** | Built-in Smart Prompt Engine + Optional OpenAI API | Works 100% out of the box with zero required API keys |

---

## 🗄️ Database Schema & Supabase RLS

The database architecture is designed in strict accordance with PRD Section 9 (`businesses`, `campaigns`, `creatives`, `audiences`, `campaign_metrics`, `ai_recommendations`, `users`).

To inspect or copy the complete PostgreSQL schema with Row Level Security (RLS) policies, open **Settings & Architecture Controls** in the application or view [`src/services/supabaseClient.ts`](file:///Users/shinjanpatra/CampaignPilot/src/services/supabaseClient.ts).

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in `dist/` ready for immediate deployment on **Vercel**, **Netlify**, or **Cloudflare Pages**.

---

## 🧪 Testing the Guided Journey (< 5 Minutes)

1. Open `http://localhost:3000`. Notice the dashboard pre-populated with active and completed campaigns for *Aura Bridal Studio*.
2. Click **Create Campaign** in the header.
3. **Step 1:** Select **Get More Messages (WhatsApp)** and click *Next*.
4. **Step 2:** Review the AI-generated strategy. Modify the marketing hook or click *Regenerate Strategy*.
5. **Step 3:** Browse the 3 creative variations. Switch preview tabs (Feed, WhatsApp Ad, Story) to see the live rendering. Click *Approve Creative*.
6. **Step 4:** Adjust the radius slider (e.g., 12 km) and inspect the *Audience Reach Estimator*.
7. **Step 5:** Choose the *Growth Push (₹5,000)* package. Review daily spend math.
8. **Step 6:** Review the pre-flight checklist. Check the approval confirmation and click **Launch Demo Campaign**.
9. Watch the celebratory confetti, then drill down into your new campaign in the Dashboard to view performance trends and AI Coach recommendations!

