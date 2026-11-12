import { Campaign, CampaignObjective, Creative, Audience, AIRecommendation, DailyMetricPoint } from '../types';

/**
 * Generate mock metrics for demo campaigns
 */
export function generateMockMetrics(objective: CampaignObjective, budget: number) {
  const impressions = Math.floor(budget * 25); // ~₹1 per 25 impressions
  const clicks = Math.floor(impressions * 0.027); // ~2.7% CTR
  const conversions = Math.floor(clicks * 0.08); // ~8% conversion from click

  return {
    totalSpend: budget,
    totalImpressions: impressions,
    totalClicks: clicks,
    totalMessages: objective === 'messages' ? Math.floor(conversions * 0.6) : 0,
    totalLeads: objective === 'leads' ? conversions : 0,
    costPerClick: Math.round(budget / Math.max(1, clicks)),
    costPerMessage:
      objective === 'messages' ? Math.round(budget / Math.max(1, Math.floor(conversions * 0.6))) : 0,
    costPerLead: objective === 'leads' ? Math.round(budget / Math.max(1, conversions)) : 0,
    source: 'simulated' as const,
  };
}

/**
 * Generate daily metric data points for a campaign
 */
export function generateDailyMetrics(
  startDate: Date,
  durationDays: number,
  totalSpend: number,
  objective: CampaignObjective,
): DailyMetricPoint[] {
  const dailyPoints: DailyMetricPoint[] = [];
  const dailyBudget = totalSpend / durationDays;
  const dailyImpressions = Math.floor(dailyBudget * 25);
  const dailyClicks = Math.floor(dailyImpressions * 0.027);

  for (let i = 0; i < durationDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Add some variance to make it realistic
    const variance = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x
    const impressions = Math.floor(dailyImpressions * variance);
    const clicks = Math.floor(dailyClicks * variance);
    const conversions = Math.floor(clicks * 0.08);

    dailyPoints.push({
      date: dateStr,
      spend: Math.round(dailyBudget * variance),
      impressions,
      clicks,
      leads: objective === 'leads' ? conversions : undefined,
      messages: objective === 'messages' ? Math.floor(conversions * 0.6) : undefined,
    });
  }

  return dailyPoints;
}

/**
 * Complete demo scenario data for all 6 wizard steps
 */
export interface DemoScenario {
  // Step 1: Objective
  objective: CampaignObjective;

  // Step 2: Strategy
  businessName: string;
  campaignName: string;
  recommendation?: AIRecommendation;
  channel: 'meta' | 'google_search';

  // Step 3: Creative
  headline: string;
  description: string;
  cta: 'Send WhatsApp Message' | 'Book Now' | 'Call Now' | 'Get Offer' | 'Learn More' | 'Visit Store';
  imageUrl: string; // Must be a valid data URL or placeholder

  // Step 4: Audience
  city: string;
  area: string;
  radiusKm: number;

  // Step 5: Budget
  budget: number;
  duration: number;

  // Additional
  offer?: string;
}

/**
 * Pre-defined demo scenarios ready to walk through entire wizard
 */
export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  beauty_salon: {
    objective: 'messages',
    businessName: 'Radiant Beauty Salon',
    campaignName: 'Summer Beauty Promotion',
    channel: 'meta',
    headline: 'Transform Your Look This Summer',
    description: 'Get 20% off all treatments this month. Premium skincare, haircuts & styling. Limited time offer!',
    cta: 'Send WhatsApp Message',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22400%22%20height=%22400%22%3E%3Crect%20fill=%22%23f5f5dc%22%20width=%22400%22%20height=%22400%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22150%22%20r=%2260%22%20fill=%22%23daa520%22/%3E%3Ctext%20x=%22200%22%20y=%22280%22%20font-size=%2232%22%20font-weight=%22bold%22%20text-anchor=%22middle%22%20fill=%22%23333%22%3EBeauty%20Promo%3C/text%3E%3C/svg%3E',
    city: 'Delhi',
    area: 'Dwarka',
    radiusKm: 5,
    budget: 5000,
    duration: 10,
    offer: 'Summer beauty packages at discounted rates',
  },

  restaurant: {
    objective: 'leads',
    businessName: 'The Spice House Restaurant',
    campaignName: 'Dine & Reserve Now',
    channel: 'google_search',
    headline: 'Authentic Indian Cuisine',
    description: 'Experience authentic flavors. Book your table today. Reservations available for lunch & dinner.',
    cta: 'Book Now',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22400%22%20height=%22400%22%3E%3Crect%20fill=%22%23ffe4b5%22%20width=%22400%22%20height=%22400%22/%3E%3Crect%20x=%2780%22%20y=%22100%22%20width=%22240%22%20height=%22200%22%20fill=%22%23ff6347%22%20rx=%2210%22/%3E%3Ctext%20x=%22200%22%20y=%22220%22%20font-size=%2232%22%20font-weight=%22bold%22%20text-anchor=%22middle%22%20fill=%22%23fff%22%3ERestaurant%3C/text%3E%3C/svg%3E',
    city: 'Mumbai',
    area: 'Bandra',
    radiusKm: 3,
    budget: 3500,
    duration: 14,
    offer: '20% discount on first booking',
  },

  fitness: {
    objective: 'messages',
    businessName: 'FitLife Gym',
    campaignName: 'Join Our Fitness Journey',
    channel: 'meta',
    headline: 'Get Fit in 30 Days',
    description: 'Expert trainers, modern equipment, flexible schedules. Join hundreds of happy members today!',
    cta: 'Send WhatsApp Message',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22400%22%20height=%22400%22%3E%3Crect%20fill=%22%23e6f3ff%22%20width=%22400%22%20height=%22400%22/%3E%3Crect%20x=%2250%22%20y=%22150%22%20width=%22300%22%20height=%22100%22%20fill=%22%231e90ff%22%20rx=%2210%22/%3E%3Ctext%20x=%22200%22%20y=%22210%22%20font-size=%2236%22%20font-weight=%22bold%22%20text-anchor=%22middle%22%20fill=%22%23fff%22%3E💪%3C/text%3E%3C/svg%3E',
    city: 'Bangalore',
    area: 'Indiranagar',
    radiusKm: 4,
    budget: 4000,
    duration: 10,
    offer: 'Free first month trial',
  },

  ecommerce: {
    objective: 'leads',
    businessName: 'Style Hub Online',
    campaignName: 'Fashion Flash Sale',
    channel: 'meta',
    headline: 'Latest Fashion Trends',
    description: 'Explore trending styles, exclusive collections & unbeatable prices. Shop now with free delivery!',
    cta: 'Get Offer',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22400%22%20height=%22400%22%3E%3Crect%20fill=%22%23fff0f5%22%20width=%22400%22%20height=%22400%22/%3E%3Crect%20x=%2260%22%20y=%2280%22%20width=%22280%22%20height=%22240%22%20fill=%22%23ff69b4%22%20rx=%2210%22/%3E%3Ctext%20x=%22200%22%20y=%22210%22%20font-size=%2232%22%20text-anchor=%22middle%22%20fill=%22%23fff%22%20font-weight=%22bold%22%3ESale%3C/text%3E%3C/svg%3E',
    city: 'Hyderabad',
    area: 'Hitech City',
    radiusKm: 6,
    budget: 6000,
    duration: 7,
    offer: 'Free shipping on orders above ₹500',
  },
};

/**
 * Create complete demo campaign with all required fields
 */
export function createCompletedemoCampaign(
  businessId: string,
  userId: string,
  scenarioKey: string = 'beauty_salon',
): Campaign {
  const scenario = DEMO_SCENARIOS[scenarioKey] || DEMO_SCENARIOS.beauty_salon;
  const now = new Date();
  const startDate = now.toISOString().split('T')[0];

  // Calculate end date
  const endDateObj = new Date(now);
  endDateObj.setDate(endDateObj.getDate() + scenario.duration);
  const endDate = endDateObj.toISOString().split('T')[0];

  // Generate daily metrics
  const dailyData = generateDailyMetrics(now, scenario.duration, scenario.budget, scenario.objective);
  const totalMetrics = generateMockMetrics(scenario.objective, scenario.budget);

  const campaignId = `demo-${scenarioKey}-${Date.now()}`;

  const creative: Creative = {
    id: `cr-${campaignId}`,
    campaignId,
    headline: scenario.headline,
    description: scenario.description,
    cta: scenario.cta,
    imageUrl: scenario.imageUrl,
    approvalStatus: 'approved',
    createdAt: new Date().toISOString(),
  };

  const audience: Audience = {
    id: `aud-${campaignId}`,
    campaignId,
    locationCity: scenario.city,
    locationArea: scenario.area,
    radiusKm: scenario.radiusKm,
    ageRangeMin: 20,
    ageRangeMax: 55,
    gender: 'all',
    interests: [],
    estimatedAudienceSize: '50K - 100K',
    rationale: `People within ${scenario.radiusKm}km of ${scenario.area}, ${scenario.city}`,
  };

  const recommendation: AIRecommendation = {
    id: `rec-${campaignId}`,
    campaignId,
    campaignName: scenario.campaignName,
    strategySummary: `Reach local audience in ${scenario.city} with focus on ${scenario.objective}`,
    targetAudienceRationale: `Target people aged 20-55 interested in your services within ${scenario.radiusKm}km radius`,
    suggestedDurationDays: scenario.duration,
    suggestedDailyBudget: Math.round(scenario.budget / scenario.duration),
    suggestedTotalBudget: scenario.budget,
    recommendedCTA: scenario.cta,
    keyMarketingHook: scenario.offer || 'Exclusive offer this month',
    creativeThemes: ['local', 'promotional', 'engagement'],
    suggestedInterests: ['local_businesses', scenario.objective],
  };

  const campaign: Campaign = {
    id: campaignId,
    businessId,
    campaignName: scenario.campaignName,
    creativePrompt: scenario.offer,
    objective: scenario.objective,
    strategy: `Multi-channel campaign targeting ${scenario.city} market`,
    status: 'simulated',
    executionMode: 'simulated',
    totalBudget: scenario.budget,
    dailyBudget: Math.round(scenario.budget / scenario.duration),
    startDate,
    endDate,
    durationDays: scenario.duration,
    creative,
    audience,
    recommendation,
    channel: scenario.channel,
    destinationType: scenario.objective === 'messages' ? 'whatsapp' : 'phone',
    destinationValue: '+91 98765 43210', // Placeholder
    metrics: {
      id: `met-${campaignId}`,
      campaignId,
      totalSpend: totalMetrics.totalSpend,
      totalImpressions: totalMetrics.totalImpressions,
      totalClicks: totalMetrics.totalClicks,
      totalMessages: totalMetrics.totalMessages,
      totalLeads: totalMetrics.totalLeads,
      costPerClick: totalMetrics.costPerClick,
      costPerMessage: totalMetrics.costPerMessage,
      costPerLead: totalMetrics.costPerLead,
      dailyData,
      lastUpdated: new Date().toISOString(),
      source: 'simulated',
      dateRange: { start: startDate, end: endDate },
      confidence: 'medium',
    },
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
  };

  return campaign;
}

/**
 * Create demo campaigns for landing page dashboard
 */
export function createDemoCampaigns(businessId: string, userId: string): Campaign[] {
  const campaigns = [
    createCompletedemoCampaign(businessId, userId, 'beauty_salon'),
    createCompletedemoCampaign(businessId, userId, 'restaurant'),
  ];

  return campaigns;
}
