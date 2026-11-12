export type CampaignObjective = 'leads' | 'messages' | 'awareness';

export type CampaignStatus =
  | 'draft'
  | 'pending_approval'
  | 'simulated'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed';

export type ChannelProvider =
  | 'google_search'
  | 'meta'
  | 'whatsapp'
  | 'google_business'
  | 'ga4';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type CampaignDestination =
  | 'whatsapp'
  | 'phone'
  | 'website'
  | 'lead_form'
  | 'booking_link'
  | 'directions';

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google' | 'phone';
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  location: {
    city: string;
    area: string;
    address?: string;
  };
  websiteUrl?: string;
  phone?: string;
  whatsappNumber?: string;
  instagramHandle?: string;
  operatingHours?: string;
  serviceAreaKm?: number;
  primaryContactMethod?: 'phone' | 'whatsapp' | 'website' | 'form' | 'booking';
  preferredLanguages?: string[];
  tone?: string;
  prohibitedClaims?: string;
  economics?: BusinessEconomics;
  investment?: InvestmentPreferences;
  digitalPresence?: DigitalPresence;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessEconomics {
  averageOrderValue?: number;
  grossMarginPct?: number;
  acceptableCostPerLead?: number;
  capacityLeadsPerMonth?: number;
  targetLeadsPerMonth?: number;
}

export interface InvestmentPreferences {
  monthlyBudget?: number;
  comfortableStart?: number;
  maximumSpend?: number;
  cadence?: 'daily' | 'monthly';
  confidence?: ConfidenceLevel;
  willingToTest?: boolean;
}

export interface DigitalPresence {
  website?: string;
  googleBusinessProfile?: boolean;
  facebookPage?: boolean;
  instagram?: boolean;
  hasAdAccounts?: boolean;
}

export interface ChannelAllocation {
  id: string;
  provider: ChannelProvider;
  label: string;
  amount: number;
  percentage: number;
  role: string;
  objective: string;
  measurementSignal: string;
  risk: string;
  confidence: ConfidenceLevel;
  minimumViableSpend: number;
  enabled: boolean;
}

export interface MarketingPlan {
  id: string;
  businessId: string;
  objective: CampaignObjective;
  scenario: 'recommended' | 'conservative' | 'test_first';
  totalBudget: number;
  monthlyBudget: number;
  durationDays: number;
  allocations: ChannelAllocation[];
  rationale: string;
  assumptions: string[];
  changeTriggers: string[];
  risks: string[];
  confidence: ConfidenceLevel;
  confidenceReason: string;
  approvalState: 'draft' | 'approved';
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountProvider = 'google_ads' | 'meta' | 'whatsapp' | 'ga4' | 'google_business';

export interface ConnectedAccount {
  id: string;
  businessId: string;
  provider: AccountProvider;
  label: string;
  status: 'not_connected' | 'demo_connected' | 'needs_attention';
  externalAccountId?: string;
  scopes: string[];
  whyAccess: string;
  lastChecked?: string;
  connectedAt?: string;
}

export interface PreflightCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  whatHappened: string;
  whatItMayMean: string;
  whyItMatters: string;
  suggestedAction: string;
  evidence: string;
  uncertainty: string;
  source: 'observed' | 'diagnostic' | 'best_practice';
  tradeoff: string;
  metricToWatch: string;
}

export type CTAType =
  | 'Book Now'
  | 'Call Now'
  | 'Send WhatsApp Message'
  | 'Get Offer'
  | 'Learn More'
  | 'Sign Up'
  | 'Visit Store';

export interface CreativeVariation {
  id: string;
  headline: string;
  description: string;
  cta: CTAType;
  ctaLabel?: string;
  imageUrl: string;
  imageAlt?: string;
  badgeText?: string;
  primaryBenefit?: string;
  tagline?: string;
}

export interface Creative {
  id: string;
  campaignId: string;
  headline: string;
  description: string;
  cta: CTAType;
  ctaLabel?: string;
  imageUrl: string;
  approvalStatus: 'draft' | 'approved' | 'rejected';
  variations?: CreativeVariation[];
  createdAt: string;
}

export interface Audience {
  id: string;
  campaignId: string;
  locationCity: string;
  locationArea?: string;
  radiusKm: number;
  ageRangeMin: number;
  ageRangeMax: number;
  gender: 'all' | 'men' | 'women';
  interests: string[];
  estimatedAudienceSize?: string;
  rationale?: string;
}

export interface DailyMetricPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads?: number;
  messages?: number;
  reach?: number;
}

export interface CampaignMetrics {
  id: string;
  campaignId: string;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads?: number;
  totalMessages?: number;
  totalReach?: number;
  costPerLead?: number;
  costPerClick?: number;
  costPerMessage?: number;
  conversionRate?: number;
  dailyData: DailyMetricPoint[];
  lastUpdated: string;
  source?: 'simulated' | 'platform' | 'first_party' | 'manual';
  attributionWindow?: string;
  dateRange?: { start: string; end: string };
  confidence?: ConfidenceLevel;
  note?: string;
}

export interface AIRecommendation {
  id: string;
  campaignId?: string;
  campaignName: string;
  strategySummary: string;
  targetAudienceRationale: string;
  suggestedDurationDays: number;
  suggestedDailyBudget: number;
  suggestedTotalBudget: number;
  recommendedCTA: CTAType;
  keyMarketingHook: string;
  creativeThemes: string[];
  suggestedInterests: string[];
}

export interface Campaign {
  id: string;
  businessId: string;
  campaignName: string;
  creativePrompt?: string;
  objective: CampaignObjective;
  strategy: string;
  status: CampaignStatus;
  executionMode: 'simulated' | 'live';
  totalBudget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  creative: Creative;
  audience: Audience;
  recommendation?: AIRecommendation;
  metrics?: CampaignMetrics;
  channel?: ChannelProvider;
  destinationType?: CampaignDestination;
  destinationValue?: string;
  planId?: string;
  ownerApprovedAt?: string;
  preflight?: PreflightCheck[];
  createdAt: string;
  updatedAt: string;
}

export interface FunnelEvent {
  id: string;
  eventName:
    | 'signup_completed'
    | 'business_profile_created'
    | 'campaign_goal_selected'
    | 'campaign_recommendation_generated'
    | 'creative_generated'
    | 'creative_approved'
    | 'audience_configured'
    | 'budget_configured'
    | 'campaign_previewed'
    | 'campaign_approved'
    | 'campaign_plan_saved'
    | 'demo_started'
    | 'demo_completed'
    | 'campaign_conversion_clicked'
    | 'campaign_paused'
    | 'campaign_resumed'
    | 'campaign_completed';
  timestamp: string;
  campaignId?: string;
  metadata?: Record<string, any>;
}
