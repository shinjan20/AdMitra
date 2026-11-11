import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or fallback
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey);
      return clientInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * SQL Schema Definition for Supabase Database
 * Matches PRD Section 9: Core database entities & Row Level Security
 */
export const SUPABASE_SQL_SCHEMA = `
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Businesses table
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  business_name text not null,
  category text not null,
  description text,
  location jsonb not null default '{}'::jsonb,
  website_url text,
  phone text,
  whatsapp_number text,
  instagram_handle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Campaigns table
create table if not exists public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  campaign_name text not null,
  objective text not null check (objective in ('leads', 'messages', 'awareness')),
  strategy text,
  status text not null check (status in ('draft', 'active', 'paused', 'completed')),
  total_budget numeric not null,
  daily_budget numeric not null,
  start_date date not null,
  end_date date not null,
  duration_days integer not null,
  is_demo_launch boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Creatives table
create table if not exists public.creatives (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  headline text not null,
  description text not null,
  cta text not null,
  image_url text not null,
  approval_status text not null check (approval_status in ('draft', 'approved', 'rejected')),
  is_ai_generated boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Audiences table
create table if not exists public.audiences (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  location_city text not null,
  location_area text,
  radius_km numeric not null default 10,
  age_range_min integer default 18,
  age_range_max integer default 65,
  gender text default 'all',
  interests text[] default array[]::text[],
  estimated_audience_size text,
  rationale text
);

-- 6. Campaign Metrics table
create table if not exists public.campaign_metrics (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  total_spend numeric default 0,
  total_impressions integer default 0,
  total_clicks integer default 0,
  total_leads integer default 0,
  total_messages integer default 0,
  total_reach integer default 0,
  daily_data jsonb default '[]'::jsonb,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. AI Recommendations table
create table if not exists public.ai_recommendations (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  recommendation_type text not null,
  recommendation_content jsonb not null,
  status text default 'applied',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.businesses enable row level security;
alter table public.campaigns enable row level security;
alter table public.creatives enable row level security;
alter table public.audiences enable row level security;
alter table public.campaign_metrics enable row level security;
alter table public.ai_recommendations enable row level security;

-- Policies ensuring advertisers only access their own data
create policy "Users can view and manage their own businesses"
  on public.businesses for all using (auth.uid() = user_id);

create policy "Users can manage campaigns through their business"
  on public.campaigns for all using (
    business_id in (select id from public.businesses where user_id = auth.uid())
  );
`;
