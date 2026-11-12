import {
  BusinessProfile,
  Campaign,
  ConnectedAccount,
  FunnelEvent,
  MarketingPlan,
  User,
  CampaignMetrics,
} from '../types';
import { INDIAN_SMB_PRESETS } from '../utils/presets';
import { toISODateOnly, addDays } from '../utils/date';

const STORAGE_KEYS = {
  USER: 'cp_user',
  BUSINESS: 'cp_active_business',
  ALL_BUSINESSES: 'cp_all_businesses',
  CAMPAIGNS: 'cp_campaigns',
  FUNNEL_EVENTS: 'cp_funnel_events',
  LEGACY_SETTINGS: 'cp_settings',
  ACTIVE_DRAFT: 'cp_active_draft',
  MARKETING_PLANS: 'cp_marketing_plans',
  CONNECTED_ACCOUNTS: 'cp_connected_accounts',
};

// Initial Seed User
export const INITIAL_USER: User = {
  id: 'usr-demo-01',
  email: 'owner@aurabridal.in',
  username: 'pooja_aura',
  name: 'Pooja Sharma',
  authProvider: 'email',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  createdAt: '2026-10-15T09:00:00Z',
};

// Initial Seed Business
export const INITIAL_BUSINESS: BusinessProfile = {
  id: 'biz-aura-01',
  userId: INITIAL_USER.id,
  businessName: 'Aura Bridal Studio & Luxury Salon',
  category: 'Beauty',
  description: 'Premier bridal makeup studio and beauty salon specializing in HD bridal makeovers, pre-wedding rituals, and customized skincare treatments.',
  location: {
    city: 'Lucknow',
    area: 'Gomti Nagar & Hazratganj',
    address: 'Shop 14, Vibhuti Khand, Gomti Nagar',
  },
  websiteUrl: 'https://aurabridalstudio.in',
  phone: '+91 98765 43210',
  whatsappNumber: '+91 98765 43210',
  instagramHandle: '@aurabridalstudio',
  operatingHours: 'Mon–Sun, 10:00–20:00',
  serviceAreaKm: 12,
  primaryContactMethod: 'whatsapp',
  preferredLanguages: ['Hindi', 'English'],
  tone: 'Warm, reassuring and premium',
  prohibitedClaims: 'Avoid guaranteed makeovers or guaranteed wedding-day results.',
  economics: {
    averageOrderValue: 4500,
    grossMarginPct: 62,
    acceptableCostPerLead: 450,
    capacityLeadsPerMonth: 60,
    targetLeadsPerMonth: 30,
  },
  investment: {
    monthlyBudget: 18000,
    comfortableStart: 6000,
    maximumSpend: 25000,
    cadence: 'monthly',
    confidence: 'medium',
    willingToTest: true,
  },
  digitalPresence: {
    website: 'https://aurabridalstudio.in',
    googleBusinessProfile: true,
    facebookPage: true,
    instagram: true,
    hasAdAccounts: false,
  },
  createdAt: '2026-10-15T09:15:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
};

// Generate illustrative metrics for seeded examples only.
export function generateMockMetrics(
  campaignId: string,
  totalBudget: number,
  objective: 'leads' | 'messages' | 'awareness',
  daysElapsed = 5
): CampaignMetrics {
  const dailyData = [];
  const today = new Date();
  const dailySpend = Math.round(totalBudget / 10);
  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalLeads = 0;
  let totalMessages = 0;
  let totalReach = 0;

  for (let i = daysElapsed - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toISODateOnly(d);

    const spend = dailySpend + Math.floor((Math.random() - 0.5) * 80);
    const impressions = Math.floor(spend * 7.5 + Math.random() * 200);
    const clicks = Math.floor(impressions * (0.022 + Math.random() * 0.015));
    const reach = Math.floor(impressions * 0.82);

    let dayLeads = 0;
    let dayMessages = 0;

    if (objective === 'leads') {
      dayLeads = Math.max(1, Math.floor(clicks * (0.09 + Math.random() * 0.05)));
    } else if (objective === 'messages') {
      dayMessages = Math.max(2, Math.floor(clicks * (0.16 + Math.random() * 0.08)));
    }

    totalSpend += spend;
    totalImpressions += impressions;
    totalClicks += clicks;
    totalLeads += dayLeads;
    totalMessages += dayMessages;
    totalReach += reach;

    dailyData.push({
      date: dateStr,
      spend,
      impressions,
      clicks,
      leads: dayLeads,
      messages: dayMessages,
      reach,
    });
  }

  const costPerLead = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : undefined;
  const costPerMessage = totalMessages > 0 ? Math.round(totalSpend / totalMessages) : undefined;
  const costPerClick = totalClicks > 0 ? Number((totalSpend / totalClicks).toFixed(1)) : 0;
  const conversionRate =
    objective === 'leads' && totalClicks > 0
      ? Number(((totalLeads / totalClicks) * 100).toFixed(1))
      : objective === 'messages' && totalClicks > 0
      ? Number(((totalMessages / totalClicks) * 100).toFixed(1))
      : 0;

  return {
    id: `metrics-${campaignId}`,
    campaignId,
    totalSpend,
    totalImpressions,
    totalClicks,
    totalLeads: objective === 'leads' ? totalLeads : undefined,
    totalMessages: objective === 'messages' ? totalMessages : undefined,
    totalReach,
    costPerLead,
    costPerMessage,
    costPerClick,
    conversionRate,
    dailyData,
    lastUpdated: new Date().toISOString(),
    source: 'simulated',
    attributionWindow: 'Example 7-day click window',
    dateRange: {
      start: dailyData[0]?.date || toISODateOnly(today),
      end: dailyData[dailyData.length - 1]?.date || toISODateOnly(today),
    },
    confidence: 'low',
    note: 'Illustrative sample data. Not platform-reported and not a verified business outcome.',
  };
}

// Seed Campaigns for initial rich dashboard state
export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-active-bridal-01',
    businessId: INITIAL_BUSINESS.id,
    campaignName: 'Winter Wedding Bridal Special 2026',
    objective: 'messages',
    strategy: 'Direct WhatsApp enquiry flow for brides-to-be and families in Lucknow within a 12 km radius.',
    status: 'simulated',
    executionMode: 'simulated',
    totalBudget: 6000,
    dailyBudget: 600,
    startDate: toISODateOnly(new Date(Date.now() - 5 * 86400000)),
    endDate: toISODateOnly(new Date(Date.now() + 5 * 86400000)),
    durationDays: 10,
    creative: {
      id: 'cr-01',
      campaignId: 'camp-active-bridal-01',
      headline: 'Your Dream Bridal Look Starts Here',
      description: 'Explore bridal and pre-bridal makeup services. Ask about appointment availability and consultation options.',
      cta: 'Send WhatsApp Message',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      approvalStatus: 'approved',
      createdAt: '2026-11-06T10:00:00Z',
    },
    audience: {
      id: 'aud-01',
      campaignId: 'camp-active-bridal-01',
      locationCity: 'Lucknow',
      locationArea: 'Gomti Nagar, Hazratganj & Aliganj',
      radiusKm: 12,
      ageRangeMin: 20,
      ageRangeMax: 36,
      gender: 'women',
      interests: ['Bridal Makeup', 'Wedding Planning', 'Skin Care', 'Indian Ethnic Wear'],
      estimatedAudienceSize: '65,000 - 85,000 women',
      rationale: 'Concentrated around upscale residential and bridal shopping hubs in Lucknow.',
    },
    channel: 'meta',
    destinationType: 'whatsapp',
    destinationValue: '+91 98765 43210',
    ownerApprovedAt: '2026-11-06T09:45:00Z',
    preflight: [
      { id: 'asset', label: 'Ad creative', status: 'pass', detail: 'Headline, description, image and button are complete.' },
      { id: 'destination', label: 'Customer destination', status: 'pass', detail: 'WhatsApp number is recorded.' },
      { id: 'tracking', label: 'Tracking readiness', status: 'warn', detail: 'No live platform tracking is connected in this demo.' },
      { id: 'account', label: 'Ad account', status: 'warn', detail: 'Demo mode: no ad account is connected.' },
      { id: 'budget', label: 'Budget', status: 'pass', detail: 'Proposed budget is above the sample minimum.' },
    ],
    metrics: generateMockMetrics('camp-active-bridal-01', 6000, 'messages', 5),
    createdAt: '2026-11-06T09:30:00Z',
    updatedAt: '2026-11-10T14:20:00Z',
  },
  {
    id: 'camp-completed-festive-02',
    businessId: INITIAL_BUSINESS.id,
    campaignName: 'Diwali & Karwa Chauth Glow Campaign',
    objective: 'leads',
    strategy: 'High-intent enquiry capture for pre-festival salon packages with early bird slots.',
    status: 'simulated',
    executionMode: 'simulated',
    totalBudget: 4500,
    dailyBudget: 450,
    startDate: toISODateOnly(new Date(Date.now() - 20 * 86400000)),
    endDate: toISODateOnly(new Date(Date.now() - 10 * 86400000)),
    durationDays: 10,
    creative: {
      id: 'cr-02',
      campaignId: 'camp-completed-festive-02',
      headline: 'Festive Glow: Pre-Book Your Glam Slot',
      description: 'Explore keratin, facial, and nail services. Ask about current packages and appointment availability.',
      cta: 'Book Now',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
      approvalStatus: 'approved',
      createdAt: '2026-10-20T10:00:00Z',
    },
    audience: {
      id: 'aud-02',
      campaignId: 'camp-completed-festive-02',
      locationCity: 'Lucknow',
      radiusKm: 10,
      ageRangeMin: 18,
      ageRangeMax: 45,
      gender: 'women',
      interests: ['Festive Shopping', 'Beauty Salons', 'Hair Care', 'Skin Treatments'],
      estimatedAudienceSize: '90,000 - 110,000',
    },
    channel: 'google_search',
    destinationType: 'website',
    destinationValue: 'https://aurabridalstudio.in',
    ownerApprovedAt: '2026-10-20T08:20:00Z',
    preflight: [
      { id: 'asset', label: 'Ad creative', status: 'pass', detail: 'Headline, description, image and button are complete.' },
      { id: 'destination', label: 'Customer destination', status: 'pass', detail: 'Website is recorded.' },
      { id: 'tracking', label: 'Tracking readiness', status: 'warn', detail: 'No live website analytics connection is configured.' },
      { id: 'account', label: 'Ad account', status: 'warn', detail: 'Demo mode: no ad account is connected.' },
      { id: 'budget', label: 'Budget', status: 'pass', detail: 'Proposed budget is above the sample minimum.' },
    ],
    metrics: generateMockMetrics('camp-completed-festive-02', 4500, 'leads', 10),
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-30T23:59:59Z',
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCampaignRecord = (value: unknown): value is Campaign => {
  if (!isRecord(value) || !isRecord(value.creative) || !isRecord(value.audience)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.businessId === 'string' &&
    typeof value.campaignName === 'string' &&
    typeof value.strategy === 'string' &&
    ['leads', 'messages', 'awareness'].includes(String(value.objective)) &&
    ['draft', 'pending_approval', 'simulated', 'active', 'paused', 'completed', 'failed'].includes(
      String(value.status),
    ) &&
    (value.executionMode === undefined ||
      value.executionMode === 'simulated' ||
      value.executionMode === 'live') &&
    typeof value.totalBudget === 'number' &&
    typeof value.dailyBudget === 'number' &&
    typeof value.durationDays === 'number' &&
    typeof value.startDate === 'string' &&
    typeof value.endDate === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.creative.id === 'string' &&
    typeof value.creative.campaignId === 'string' &&
    typeof value.creative.headline === 'string' &&
    typeof value.creative.description === 'string' &&
    [
      'Book Now',
      'Call Now',
      'Send WhatsApp Message',
      'Get Offer',
      'Learn More',
      'Sign Up',
      'Visit Store',
    ].includes(String(value.creative.cta)) &&
    typeof value.creative.imageUrl === 'string' &&
    ['draft', 'approved', 'rejected'].includes(String(value.creative.approvalStatus)) &&
    typeof value.creative.createdAt === 'string' &&
    typeof value.audience.id === 'string' &&
    typeof value.audience.campaignId === 'string' &&
    typeof value.audience.locationCity === 'string' &&
    typeof value.audience.radiusKm === 'number' &&
    typeof value.audience.ageRangeMin === 'number' &&
    typeof value.audience.ageRangeMax === 'number' &&
    ['all', 'men', 'women'].includes(String(value.audience.gender)) &&
    Array.isArray(value.audience.interests) &&
    value.audience.interests.every((interest) => typeof interest === 'string') &&
    (value.metrics === undefined ||
      (isRecord(value.metrics) &&
        typeof value.metrics.totalSpend === 'number' &&
        typeof value.metrics.totalImpressions === 'number' &&
        typeof value.metrics.totalClicks === 'number' &&
        Array.isArray(value.metrics.dailyData)))
  );
};

// Storage helper methods
export const StorageService = {
  clearLegacySettings(): void {
    localStorage.removeItem(STORAGE_KEYS.LEGACY_SETTINGS);
  },

  getUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) return null;
    try {
      const user = JSON.parse(stored) as User;
      if (user.id === INITIAL_USER.id && !localStorage.getItem('cp_auth_session')) {
        this.clearUser();
        return null;
      }
      return user;
    } catch {
      this.clearUser();
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getActiveBusiness(): BusinessProfile {
    const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(INITIAL_BUSINESS));
      return INITIAL_BUSINESS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_BUSINESS;
    }
  },

  setActiveBusiness(biz: BusinessProfile): void {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(biz));
    // also update in all businesses
    const all = this.getAllBusinesses();
    const idx = all.findIndex((b) => b.id === biz.id);
    if (idx >= 0) {
      all[idx] = biz;
    } else {
      all.push(biz);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_BUSINESSES, JSON.stringify(all));
  },

  getAllBusinesses(): BusinessProfile[] {
    const stored = localStorage.getItem(STORAGE_KEYS.ALL_BUSINESSES);
    if (!stored) {
      const initial = [INITIAL_BUSINESS];
      localStorage.setItem(STORAGE_KEYS.ALL_BUSINESSES, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [INITIAL_BUSINESS];
    }
  },

  getCampaigns(): Campaign[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
      return INITIAL_CAMPAIGNS;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(stored);
    } catch (error) {
      console.error('Could not parse saved campaign data:', error);
      throw new Error('Saved campaign data could not be read. Clear local app data to restore the sample workspace.');
    }
    if (!Array.isArray(parsed)) {
      console.error('Saved campaign data is not an array.');
      throw new Error('Saved campaign data is invalid. Clear local app data to restore the sample workspace.');
    }
    const records = parsed.filter(isCampaignRecord);
    if (records.length !== parsed.length) {
      console.error('Saved campaign data contains invalid campaign records.');
      throw new Error('Saved campaign data is invalid. Clear local app data to restore the sample workspace.');
    }
    const needsMigration = records.some((campaign) => !campaign.executionMode);
    const campaigns = records.map((campaign) => campaign.executionMode
      ? campaign
      : {
          ...campaign,
          executionMode: 'simulated' as const,
          status: campaign.status === 'draft' ? 'draft' as const : 'simulated' as const,
        });
    if (needsMigration) {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    }
    return campaigns;
  },

  saveCampaign(campaign: Campaign): Campaign {
    const campaigns = this.getCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaign.id);
    if (index >= 0) {
      campaigns[index] = { ...campaign, updatedAt: new Date().toISOString() };
    } else {
      campaigns.unshift(campaign);
    }
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    return campaign;
  },

  deleteCampaign(id: string): void {
    const campaigns = this.getCampaigns().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  },

  updateCampaignStatus(id: string, status: Campaign['status']): Campaign | null {
    const campaigns = this.getCampaigns();
    const target = campaigns.find((c) => c.id === id);
    if (target && target.executionMode === 'live') {
      target.status = status;
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      return target;
    }
    return null;
  },

  getActiveDraft(): Partial<Campaign> | null {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  saveActiveDraft(draft: Partial<Campaign> | null): void {
    if (draft === null) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
    }
  },

  getMarketingPlans(): MarketingPlan[] {
    const stored = localStorage.getItem(STORAGE_KEYS.MARKETING_PLANS);
    if (!stored) return [];
    try {
      const plans = JSON.parse(stored);
      return Array.isArray(plans) ? plans : [];
    } catch {
      return [];
    }
  },

  saveMarketingPlan(plan: MarketingPlan): MarketingPlan {
    const plans = this.getMarketingPlans();
    const index = plans.findIndex((item) => item.id === plan.id);
    const updated = { ...plan, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      plans[index] = updated;
    } else {
      plans.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEYS.MARKETING_PLANS, JSON.stringify(plans.slice(0, 50)));
    return updated;
  },

  approveMarketingPlan(planId: string): MarketingPlan | null {
    const plans = this.getMarketingPlans();
    const target = plans.find((plan) => plan.id === planId);
    if (!target) return null;
    const updated: MarketingPlan = {
      ...target,
      approvalState: 'approved',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextPlans = plans.map((plan) => (plan.id === planId ? updated : plan));
    localStorage.setItem(STORAGE_KEYS.MARKETING_PLANS, JSON.stringify(nextPlans));
    return updated;
  },

  getConnectedAccounts(businessId: string): ConnectedAccount[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CONNECTED_ACCOUNTS);
    let accounts: ConnectedAccount[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        accounts = Array.isArray(parsed) ? parsed : [];
      } catch {
        accounts = [];
      }
    }
    const businessAccounts = accounts.filter((account) => account.businessId === businessId);
    if (businessAccounts.length > 0) return businessAccounts;

    const seeded = this.buildDefaultConnectedAccounts(businessId);
    localStorage.setItem(
      STORAGE_KEYS.CONNECTED_ACCOUNTS,
      JSON.stringify([...accounts.filter((account) => account.businessId !== businessId), ...seeded]),
    );
    return seeded;
  },

  buildDefaultConnectedAccounts(businessId: string): ConnectedAccount[] {
    const now = new Date().toISOString();
    const definitions: Array<Pick<ConnectedAccount, 'provider' | 'label' | 'scopes' | 'whyAccess'>> = [
      {
        provider: 'google_ads',
        label: 'Google Ads',
        scopes: ['See how your ads did (read only)', 'Create and pause ads (only with your approval)'],
        whyAccess:
          'Only if you want to plan or run Search ads and see their results. AdMitra never holds your ad money.',
      },
      {
        provider: 'meta',
        label: 'Meta ads (Facebook / Instagram)',
        scopes: ['See how your ads did', 'Create and pause ads (only with your approval)', 'See your Facebook Page'],
        whyAccess:
          'Only if you want to plan or run Facebook and Instagram ads and see their results. Instagram and Facebook are both part of Meta.',
      },
      {
        provider: 'whatsapp',
        label: 'WhatsApp Business',
        scopes: ['Reply to customer messages', 'Use saved reply templates', 'Receive message alerts'],
        whyAccess:
          'WhatsApp is where customers message you. It is not a paid ad channel.',
      },
      {
        provider: 'ga4',
        label: 'Google Analytics 4',
        scopes: ['See website visit numbers (read only)'],
        whyAccess:
          'Optional. It adds website visit numbers. It does not replace the results shown by Google or Meta.',
      },
      {
        provider: 'google_business',
        label: 'Google Business Profile',
        scopes: ['See and update your public shop listing (with your approval)'],
        whyAccess:
          'Optional. It shows your public shop listing details. A shop listing is free, not a paid ad.',
      },
    ];

    return definitions.map((definition) => ({
      ...definition,
      id: `acct-${businessId}-${definition.provider}`,
      businessId,
      status: 'not_connected',
      lastChecked: now,
    }));
  },

  setConnectedAccountStatus(
    businessId: string,
    provider: ConnectedAccount['provider'],
    status: ConnectedAccount['status'],
  ): ConnectedAccount[] {
    const allStored = localStorage.getItem(STORAGE_KEYS.CONNECTED_ACCOUNTS);
    let all: ConnectedAccount[] = [];
    if (allStored) {
      try {
        const parsed = JSON.parse(allStored);
        all = Array.isArray(parsed) ? parsed : [];
      } catch {
        all = [];
      }
    }
    let accountsForBusiness = all.filter((account) => account.businessId === businessId);
    if (accountsForBusiness.length === 0) {
      accountsForBusiness = this.buildDefaultConnectedAccounts(businessId);
    }
    const now = new Date().toISOString();
    const updatedForBusiness = accountsForBusiness.map((account) =>
      account.provider === provider
        ? {
            ...account,
            status,
            lastChecked: now,
            connectedAt: status === 'demo_connected' ? now : undefined,
            externalAccountId:
              status === 'demo_connected' ? `DEMO-${provider.toUpperCase()}-001` : undefined,
          }
        : account,
    );
    const next = [...all.filter((account) => account.businessId !== businessId), ...updatedForBusiness];
    localStorage.setItem(STORAGE_KEYS.CONNECTED_ACCOUNTS, JSON.stringify(next));
    return updatedForBusiness;
  },

  getFunnelEvents(): FunnelEvent[] {
    const stored = localStorage.getItem(STORAGE_KEYS.FUNNEL_EVENTS);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  logFunnelEvent(eventName: FunnelEvent['eventName'], campaignId?: string, metadata?: Record<string, any>): void {
    const events = this.getFunnelEvents();
    const newEvent: FunnelEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      campaignId,
      metadata,
      timestamp: new Date().toISOString(),
    };
    events.unshift(newEvent);
    // keep latest 100 events
    localStorage.setItem(STORAGE_KEYS.FUNNEL_EVENTS, JSON.stringify(events.slice(0, 100)));
  },

  resetAllToSeed(): void {
    this.clearUser();
    localStorage.removeItem('cp_auth_session');
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(INITIAL_BUSINESS));
    localStorage.setItem(STORAGE_KEYS.ALL_BUSINESSES, JSON.stringify([INITIAL_BUSINESS]));
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    this.clearLegacySettings();
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
    localStorage.removeItem(STORAGE_KEYS.FUNNEL_EVENTS);
    localStorage.removeItem(STORAGE_KEYS.MARKETING_PLANS);
    localStorage.removeItem(STORAGE_KEYS.CONNECTED_ACCOUNTS);
  },
};
