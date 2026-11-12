import {
  AccountProvider,
  BusinessProfile,
  CampaignObjective,
  ChannelAllocation,
  ChannelProvider,
  ConfidenceLevel,
  MarketingPlan,
} from '../types';

export type PlanScenario = MarketingPlan['scenario'];

interface BuildPlanParams {
  business: BusinessProfile;
  objective: CampaignObjective;
  budget: number;
  durationDays: number;
  scenario?: PlanScenario;
  connectedProviders?: AccountProvider[];
}

interface ChannelDefinition {
  provider: ChannelProvider;
  label: string;
  role: string;
  minimumMonthlySpend: number;
  measurementSignal: string;
  risk: string;
}

const CHANNELS: Record<'google_search' | 'meta', ChannelDefinition> = {
  google_search: {
    provider: 'google_search',
    label: 'Google Search',
    role: 'Show up when nearby people search for what you offer.',
    minimumMonthlySpend: 4000,
    measurementSignal: 'Calls, website enquiries or form fills that come from Google Search.',
    risk: 'Works best when people already search for this service and your phone or website is ready.',
  },
  meta: {
    provider: 'meta',
    label: 'Meta ads (Facebook / Instagram)',
    role: 'Put your business in front of nearby people on Facebook and Instagram.',
    minimumMonthlySpend: 3000,
    measurementSignal: 'Clicks to WhatsApp, calls or enquiry forms from Facebook and Instagram.',
    risk: 'Results depend on your ad pictures and wording, how many people you reach, and the permissions you allow.',
  },
};

const roundToHundred = (value: number): number => Math.max(0, Math.round(value / 100) * 100);

const monthlyEquivalent = (budget: number, durationDays: number): number =>
  Math.max(0, Math.round((budget / Math.max(1, durationDays)) * 30));

const buildAllocation = (
  definition: ChannelDefinition,
  amount: number,
  totalBudget: number,
  confidence: ConfidenceLevel,
): ChannelAllocation => ({
  id: `alloc-${definition.provider}`,
  provider: definition.provider,
  label: definition.label,
  amount,
  percentage: totalBudget > 0 ? Math.round((amount / totalBudget) * 100) : 0,
  role: definition.role,
  objective:
    definition.provider === 'google_search'
      ? 'Be found by people already looking'
      : 'Get noticed by nearby people',
  measurementSignal: definition.measurementSignal,
  risk: definition.risk,
  confidence,
  minimumViableSpend: definition.minimumMonthlySpend,
  enabled: amount > 0,
});

const normalizeWeights = (weights: Record<'google_search' | 'meta', number>) => {
  const google = Math.max(0, weights.google_search);
  const meta = Math.max(0, weights.meta);
  const total = google + meta;
  if (total === 0) return { google_search: 0.5, meta: 0.5 };
  return { google_search: google / total, meta: meta / total };
};

const splitBudget = (
  total: number,
  weights: { google_search: number; meta: number },
  scenario: PlanScenario,
  monthlyBudget: number,
): Record<'google_search' | 'meta', number> => {
  const canSupportTwo = monthlyBudget >= 7000 && total >= 3000;

  if (!canSupportTwo || scenario === 'test_first') {
    const primary = weights.google_search >= weights.meta ? 'google_search' : 'meta';
    return {
      google_search: primary === 'google_search' ? total : 0,
      meta: primary === 'meta' ? total : 0,
    };
  }

  if (scenario === 'conservative') {
    const primary = weights.google_search >= weights.meta ? 'google_search' : 'meta';
    const primaryAmount = roundToHundred(total * 0.8);
    return primary === 'google_search'
      ? { google_search: primaryAmount, meta: total - primaryAmount }
      : { google_search: total - primaryAmount, meta: primaryAmount };
  }

  const googleAmount = roundToHundred(total * weights.google_search);
  return {
    google_search: googleAmount,
    meta: total - googleAmount,
  };
};

const getWeights = (
  business: BusinessProfile,
  objective: CampaignObjective,
): Record<'google_search' | 'meta', number> => {
  const category = `${business.category} ${business.description}`.toLowerCase();
  const isEducation = /education|coach|school|academy|tuition|course/.test(category);
  const isDiscoveryLed = /beauty|salon|restaurant|food|cafe|fitness|gym|retail|shop|fashion|wedding/.test(
    category,
  );
  const hasWebsite = Boolean(business.digitalPresence?.website || business.websiteUrl);

  let google = objective === 'leads' ? 45 : objective === 'messages' ? 30 : 35;
  let meta = 100 - google;

  if (isEducation) google += 15;
  if (isDiscoveryLed) meta += 15;
  if (!hasWebsite) google -= 20;
  if (!business.phone && !business.whatsappNumber) google -= 10;
  if (business.digitalPresence?.googleBusinessProfile) meta += 5;

  return normalizeWeights({ google_search: google, meta });
};

const confidenceFromBusiness = (
  business: BusinessProfile,
  connectedProviders: AccountProvider[],
): { level: ConfidenceLevel; reason: string } => {
  let score = 0;
  if (business.economics?.averageOrderValue) score += 1;
  if (business.economics?.acceptableCostPerLead) score += 1;
  if (business.economics?.capacityLeadsPerMonth) score += 1;
  if (business.investment?.monthlyBudget) score += 1;
  if (connectedProviders.includes('ga4')) score += 1;
  if (connectedProviders.includes('google_ads') || connectedProviders.includes('meta')) score += 1;

  if (score >= 5) {
    return {
      level: 'medium',
      reason:
        'We have your money basics and some accounts set up. This is still a starting guess, because this business has not run ads here before.',
    };
  }
  if (score >= 2) {
    return {
      level: 'medium',
      reason:
        'We know some things about your business. Since there is no past ad history, treat this as a careful starting guess.',
    };
  }
  return {
    level: 'low',
    reason:
      'We do not know much about your costs or accounts yet. Treat this as a starting guess and update it once you see real results.',
  };
};

export const BudgetEngine = {
  buildPlan({
    business,
    objective,
    budget,
    durationDays,
    scenario = 'recommended',
    connectedProviders = [],
  }: BuildPlanParams): MarketingPlan {
    const safeBudget = Math.max(0, Math.round(budget || 0));
    const safeDuration = Math.max(1, Math.round(durationDays || 1));
    const monthlyBudget = monthlyEquivalent(safeBudget, safeDuration);
    const weights = getWeights(business, objective);
    const amounts = splitBudget(safeBudget, weights, scenario, monthlyBudget);
    const confidence = confidenceFromBusiness(business, connectedProviders);

    const allocations = (Object.keys(amounts) as Array<'google_search' | 'meta'>)
      .map((provider) =>
        buildAllocation(CHANNELS[provider], amounts[provider], safeBudget, confidence.level),
      )
      .filter((allocation) => allocation.amount > 0);

    const hasWhatsApp = Boolean(business.whatsappNumber);
    const hasWebsite = Boolean(business.digitalPresence?.website || business.websiteUrl);
    const hasPrimaryDestination = Boolean(
      hasWhatsApp || business.phone || hasWebsite || business.primaryContactMethod,
    );
    const cpl = business.economics?.acceptableCostPerLead;
    const capacity = business.economics?.capacityLeadsPerMonth;
    const economicsWarning =
      cpl && monthlyBudget > 0 && capacity
        ? `At the cost per enquiry you are comfortable with, about ${Math.floor(monthlyBudget / cpl)} enquiries a month may be possible. You said you can handle ${capacity} a month.`
        : 'You have not set a comfortable cost per enquiry, so we cannot check whether the results are good value yet.';

    const assumptions = [
      'This business has no past ad results to learn from. This is a starting guess, not a promise.',
      `It assumes about ${safeDuration} days of ads and an ad budget of about ₹${monthlyBudget.toLocaleString('en-IN')} a month.`,
      'Only paid ads are divided below. WhatsApp is where enquiries land, and Google Business Profile is a free listing — neither gets an ad budget here.',
      'AdMitra does not hold this ad money or take a cut of it.',
    ];

    if (!hasWebsite) {
      assumptions.push(
        'No website is saved. We are putting less into Google Search because you should have a working page or phone number first.',
      );
    }
    if (!hasWhatsApp) {
      assumptions.push(
        'No WhatsApp number is saved. Add one before running WhatsApp enquiry ads.',
      );
    }
    if (!hasPrimaryDestination) {
      assumptions.push(
        'No way for customers to reach you is saved yet. Add a phone number, WhatsApp number, website or enquiry form before launch.',
      );
    }

    if (monthlyBudget > 0 && monthlyBudget < 5000) {
      assumptions.push(
        'This budget is too small to test two places at once, so the plan puts the money into one place instead of splitting it thin.',
      );
    }

    const changeTriggers = [
      'If your average sale value, profit margin or comfortable cost per enquiry changes, the plan should change too.',
      'If cost per enquiry stays above your target for two weeks in a row, pause the plan or narrow it.',
      'If you cannot reply to enquiries quickly, spend less before spending more.',
      'Once you can see which ads bring enquiries, the two places can be compared more reliably.',
    ];

    const risks = [
      'Google and Meta do not promise views, enquiries or sales. Results depend on demand, your offer, your ad and how quickly you reply.',
      'With small budgets and short runs, it is easy to give credit to the wrong ad. One place may look better than it really is.',
      'Someone who clicks a Google ad cannot automatically be shown a Facebook or Instagram ad. That needs extra setup and permission.',
      hasWhatsApp
        ? 'WhatsApp enquiries still need a quick reply. A slow reply can waste good leads.'
        : 'Without a WhatsApp or phone number, message ads cannot work.',
    ];

    const rationalePrefix =
      scenario === 'test_first'
        ? 'One-place test: put the whole budget into the place most likely to show whether this works.'
        : scenario === 'conservative'
          ? 'Cautious start: keep most of the budget where people are already looking, with a small amount elsewhere.'
          : 'Recommended: divide the budget based on your goal, your type of business and what is already set up.';

    const rationale = [
      rationalePrefix,
      `Your goal is ${objective === 'messages' ? 'WhatsApp or message enquiries' : objective === 'leads' ? 'phone calls or form enquiries' : 'helping nearby people find you'}.`,
      economicsWarning,
    ].join(' ');

    return {
      id: `plan-${business.id}-${objective}-${scenario}-${safeBudget}-${safeDuration}`,
      businessId: business.id,
      objective,
      scenario,
      totalBudget: safeBudget,
      monthlyBudget,
      durationDays: safeDuration,
      allocations,
      rationale,
      assumptions,
      changeTriggers,
      risks,
      confidence: confidence.level,
      confidenceReason: confidence.reason,
      approvalState: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  summaryForWizard(plan: MarketingPlan): string {
    const channels = plan.allocations.map((allocation) => allocation.label).join(' + ');
    return `Spend ${plan.totalBudget > 0 ? `₹${plan.totalBudget.toLocaleString('en-IN')}` : 'your ad budget'} over ${plan.durationDays} days on ${channels || 'one focused local test'}.`;
  },
};
