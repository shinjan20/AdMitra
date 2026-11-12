# AdMitra — Local Campaign Planning, Safely Simulated

## Slide 1 — The opportunity

### Give a local business owner a clear first step

Many owner-operated businesses know what they want to promote but find campaign tools hard to approach. They have to make decisions about goals, audiences, creative, and budgets before they know whether the plan makes sense.

**Product thesis:** Help a local business shape and review a small campaign plan in plain steps, with control over every recommendation and no surprise publishing or spend.

AdMitra is currently a campaign-planning simulation with a separate AI creative studio. It does not publish ads, connect to ad inventory, charge money, or promise business results.

## Slide 2 — Who it serves

### Start with familiar neighbourhood businesses

- **Salon or beauty studio:** Wants more appointment enquiries for a seasonal offer.
- **Restaurant:** Wants nearby customers to notice a menu or meal offer.
- **Coaching centre:** Wants families to ask about a new course batch.

The public sample lets visitors explore all three scenarios without signing in. These are illustrative personas and not research findings; validate them with business owners before making market or adoption claims.

### Core job to be done

“Help me turn my business goal into a clear campaign plan I can understand, edit, and approve before anything goes live.”

## Slide 3 — The experience

### From business goal to reviewed plan

1. Choose a salon, restaurant, or coaching example in the ungated interactive demo.
2. Set up a business profile and select a customer action: enquiries, messages, or awareness.
3. Review an example strategy and editable ad concept.
4. Adjust a suggested audience and local area, then set an example budget and duration.
5. Review the creative, location, and proposed budget together.
6. Approve and save the plan as **simulated**. The campaign dashboard shows saved plans and clearly labelled examples.

The campaign wizard's strategy and creative examples are generated from local rules and presets, not a live campaign platform. Separately, the creative studio can use Gemini for ad text and images when its Supabase and provider configuration is available.

### Explicit product boundary

No campaign is published, no audience is actually targeted, no money is spent, and user-created plans have no performance results. Seeded dashboard results are fictional examples. The app does not yet validate advertising inventory, provider permissions, pricing, billing, or measurement.

## Slide 4 — What is implemented

| Capability | Current status |
|---|---|
| Ungated salon, restaurant, and coaching sample walkthrough | Implemented |
| Business setup and campaign goal selection | Implemented |
| Editable example strategy and ad concept | Implemented; recommendations are local presets |
| Audience area, budget, schedule, and final review | Implemented as planning inputs |
| Explicit approval and saved simulation state | Implemented; no publish or spend action |
| Campaign overview and plan details | Implemented; seeded results are labelled illustrative |
| Separate multilingual text/image creative studio | Implemented when Supabase and Gemini are configured |
| Video generation in the creative studio | Experimental; provider availability and quota require validation |
| Account-synced campaign plans and drafts | Not implemented; browser-local storage only |
| Live campaign publishing, billing, targeting, and analytics | Not implemented; blocked on product/provider validation |

## Slide 5 — How to validate the MVP

Run observed usability sessions with owners across the three example business types and supported languages. These are proposed pilot measures, not achieved outcomes:

- At least **8 of 10** participants finish and explain their campaign plan without step-by-step assistance.
- Median time from choosing a goal to reviewing the plan is **5 minutes or less**.
- At least **9 of 10** understand that approval saves a simulation and does not publish an ad or spend money.
- At least **7 of 10** can identify and edit the recommendation they would change first.
- Track abandonment by step, budget/audience comprehension, copy edits, and mistakes users correct.
- Separately monitor creative-generation success, latency, provider errors, and cost. Treat video as a separate experiment.

Do not use campaign reach, leads, conversions, ROI, or CTR as success measures until real delivery and trustworthy measurement exist.

## Slide 6 — Risks and next steps

| Risk or dependency | Next action |
|---|---|
| People mistake a simulation or example metric for a real campaign | Keep the simulation label at approval, in the dashboard, and in plan details; test comprehension |
| Suggested audience or budget appears authoritative | Explain assumptions, allow edits, and validate recommendations with owners |
| Localized copy is unnatural or confusing | Review the landing, demo, and campaign flow with native speakers |
| Plans disappear across devices | Decide whether users need saved account records; add account-scoped persistence and deletion/export controls if so |
| Provider quotas or outages affect creative generation | Monitor errors and cost, explain failures, and keep video optional |
| Real campaign delivery is not yet validated | Research inventory, platform APIs and permissions, approval, spend caps, pricing/billing, attribution, support, and rollback before building it |

### Recommended sequence

1. Test the ungated demo and six-step plan with local owners; fix comprehension and completion issues.
2. Validate language quality, mobile usability, and the difference between sample metrics and saved simulations.
3. Improve persistence, privacy controls, provider monitoring, and automated flow tests.
4. Reassess whether evidence justifies a real delivery integration. Keep publishing and spend disabled until the dependencies above are verified.

**Submission note:** The customer-facing name remains **AdMitra**. “CampaignPilot 2.0” describes the campaign-planning direction in the supplied PRD, not a change to the product name.
