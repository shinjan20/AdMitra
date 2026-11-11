import {
  BusinessProfile,
  Campaign,
  FunnelEvent,
  User,
  AppSettings,
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
  SETTINGS: 'cp_settings',
  ACTIVE_DRAFT: 'cp_active_draft',
};

// Initial Seed User
export const INITIAL_USER: User = {
  id: 'usr-demo-01',
  email: 'owner@aurabridal.in',
  name: 'Pooja Sharma',
  createdAt: '2026-10-15T09:00:00Z',
};

// Initial Seed Business
export const INITIAL_BUSINESS: BusinessProfile = {
  id: 'biz-aura-01',
  userId: INITIAL_USER.id,
  businessName: 'Aura Bridal Studio & Luxury Salon',
  category: 'Beauty & Wellness',
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
  createdAt: '2026-10-15T09:15:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
};

// Generate realistic mock daily metrics for an active campaign
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
  };
}

// Seed Campaigns for initial rich dashboard state
export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-active-bridal-01',
    businessId: INITIAL_BUSINESS.id,
    campaignName: 'Winter Wedding Bridal Special 2026',
    objective: 'messages',
    strategy: 'Direct WhatsApp booking flow targeting brides-to-be & families in Lucknow within 12km radius. Promotes free consultation.',
    status: 'active',
    totalBudget: 6000,
    dailyBudget: 600,
    startDate: toISODateOnly(new Date(Date.now() - 5 * 86400000)),
    endDate: toISODateOnly(new Date(Date.now() + 5 * 86400000)),
    durationDays: 10,
    isDemoLaunch: true,
    creative: {
      id: 'cr-01',
      campaignId: 'camp-active-bridal-01',
      headline: 'Your Dream Bridal Look Starts Here',
      description: 'Book your pre-bridal & HD bridal makeup consultation with Lucknow’s top bridal artists. Limited slots available this wedding season!',
      cta: 'Send WhatsApp Message',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      approvalStatus: 'approved',
      isAIGenerated: true,
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
    status: 'completed',
    totalBudget: 4500,
    dailyBudget: 450,
    startDate: toISODateOnly(new Date(Date.now() - 20 * 86400000)),
    endDate: toISODateOnly(new Date(Date.now() - 10 * 86400000)),
    durationDays: 10,
    isDemoLaunch: true,
    creative: {
      id: 'cr-02',
      campaignId: 'camp-completed-festive-02',
      headline: 'Festive Glow: Pre-Book Your Glam Slot',
      description: 'Special keratin, facial & nail art combo packages. Zero wait time with advance booking.',
      cta: 'Book Now',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
      approvalStatus: 'approved',
      isAIGenerated: true,
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
    metrics: generateMockMetrics('camp-completed-festive-02', 4500, 'leads', 10),
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-30T23:59:59Z',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  isDemoMode: true,
  useLiveAI: false,
};

// Storage helper methods
export const StorageService = {
  getUser(): User {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_USER;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_CAMPAIGNS;
    }
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
    if (target) {
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

  getSettings(): AppSettings {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(INITIAL_BUSINESS));
    localStorage.setItem(STORAGE_KEYS.ALL_BUSINESSES, JSON.stringify([INITIAL_BUSINESS]));
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
    localStorage.removeItem(STORAGE_KEYS.FUNNEL_EVENTS);
  },
};

