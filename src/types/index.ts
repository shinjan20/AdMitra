export type CampaignObjective = 'leads' | 'messages' | 'awareness';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google';
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
  createdAt: string;
  updatedAt: string;
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
  imageUrl: string;
  approvalStatus: 'draft' | 'approved' | 'rejected';
  variations?: CreativeVariation[];
  isAIGenerated: boolean;
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
  confidenceScore: number;
  rationaleExplanation: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  campaignName: string;
  objective: CampaignObjective;
  strategy: string;
  status: CampaignStatus;
  totalBudget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  creative: Creative;
  audience: Audience;
  recommendation?: AIRecommendation;
  metrics?: CampaignMetrics;
  isDemoLaunch: boolean;
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
    | 'campaign_launch_confirmed'
    | 'campaign_created'
    | 'campaign_paused'
    | 'campaign_resumed'
    | 'campaign_completed';
  timestamp: string;
  campaignId?: string;
  metadata?: Record<string, any>;
}

export interface AppSettings {
  isDemoMode: boolean;
  openAIApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  useLiveAI: boolean;
}

