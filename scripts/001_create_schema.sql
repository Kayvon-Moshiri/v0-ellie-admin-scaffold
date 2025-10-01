-- Ellie Admin Database Schema
-- Multi-tenant networking platform with graph analytics
-- Based on detailed specification for tenant-isolated people graph

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Updated tenants table to match specification with branding and federation support
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  branding JSONB DEFAULT '{}',
  is_federated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated profiles table to match specification with offers, asks, scarcity scoring
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('admin','member','guest','scout')) DEFAULT 'member',
  tier TEXT CHECK (tier IN ('member','vip','guest','startup')) DEFAULT 'member',
  offers JSONB DEFAULT '{}',
  asks JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  scarcity_score NUMERIC DEFAULT 0,
  visibility TEXT CHECK (visibility IN ('private','members','federated')) DEFAULT 'members',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Renamed startups to companies and updated structure per specification
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector TEXT,
  stage TEXT,
  traction JSONB DEFAULT '{}',
  asks JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated introductions table to match specification with fit scoring and fatigue
CREATE TABLE IF NOT EXISTS intros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  requester UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target UUID REFERENCES profiles(id) ON DELETE CASCADE,
  context TEXT,
  status TEXT CHECK (status IN ('requested','pre_consented','scheduled','declined','completed','archived')) DEFAULT 'requested',
  fit_score NUMERIC,
  fatigue_penalty NUMERIC DEFAULT 0,
  priority_score NUMERIC DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added engagement_events table for tracking intro interactions
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  intro_id UUID REFERENCES intros(id) ON DELETE CASCADE,
  actor UUID REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT CHECK (kind IN ('view','reply','accept','decline','meet','note','nudge')),
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added scouts table for scout management
CREATE TABLE IF NOT EXISTS scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added scout_submissions table for tracking scout submissions
CREATE TABLE IF NOT EXISTS scout_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  scout_id UUID REFERENCES scouts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  quality NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated events table to match specification with roster
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  roster JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated invitations table to match specification with phone and sent_via
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('admin','member','guest','scout')) DEFAULT 'member',
  tier TEXT CHECK (tier IN ('member','vip','guest','startup')) DEFAULT 'member',
  status TEXT CHECK (status IN ('draft','sent','accepted','expired')) DEFAULT 'draft',
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  sent_via TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added edges table for network graph connections
CREATE TABLE IF NOT EXISTS edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  source UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target UUID REFERENCES profiles(id) ON DELETE CASCADE,
  weight NUMERIC DEFAULT 0,
  last_event_at TIMESTAMP WITH TIME ZONE,
  kind TEXT CHECK (kind IN ('intro','meeting','message','followup')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (tenant_id, source, target)
);

-- Added federation_consent table for cross-tenant data sharing
CREATE TABLE IF NOT EXISTS federation_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_tenant UUID REFERENCES tenants(id) ON DELETE CASCADE,
  counterparty_tenant UUID REFERENCES tenants(id) ON DELETE CASCADE,
  share_people BOOLEAN DEFAULT FALSE,
  share_edges BOOLEAN DEFAULT FALSE,
  share_companies BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending','active','revoked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (owner_tenant, counterparty_tenant)
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE intros ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE federation_consent ENABLE ROW LEVEL SECURITY;

-- Updated RLS policies for new table structure
-- Tenants: Users can only see tenants they belong to
CREATE POLICY "Users can view their tenant" ON tenants FOR SELECT
  USING (id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Profiles: Users can see profiles in their tenant
CREATE POLICY "Users can view profiles in their tenant" ON profiles FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Companies: Tenant-scoped access
CREATE POLICY "Users can view companies in their tenant" ON companies FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage companies" ON companies FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- Intros: Tenant-scoped access
CREATE POLICY "Users can view intros in their tenant" ON intros FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage intros they're involved in" ON intros FOR ALL
  USING (
    requester IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    target IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() AND role IN ('admin'))
  );

-- Engagement events: Tenant-scoped access
CREATE POLICY "Users can view engagement events in their tenant" ON engagement_events FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create engagement events" ON engagement_events FOR INSERT
  WITH CHECK (actor IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Scouts: Tenant-scoped access
CREATE POLICY "Users can view scouts in their tenant" ON scouts FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage scouts" ON scouts FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- Scout submissions: Tenant-scoped access
CREATE POLICY "Users can view scout submissions in their tenant" ON scout_submissions FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Scouts can manage their submissions" ON scout_submissions FOR ALL
  USING (scout_id IN (
    SELECT s.id FROM scouts s 
    JOIN profiles p ON s.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ));

-- Events: Tenant-scoped access
CREATE POLICY "Users can view events in their tenant" ON events FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage events" ON events FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'scout')
  ));

-- Invites: Tenant-scoped access
CREATE POLICY "Users can view invites in their tenant" ON invites FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage invites" ON invites FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- Edges: Tenant-scoped access
CREATE POLICY "Users can view edges in their tenant" ON edges FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage edges they're involved in" ON edges FOR ALL
  USING (
    source IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    target IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() AND role IN ('admin'))
  );

-- Federation consent: Tenant-scoped access
CREATE POLICY "Users can view federation consent for their tenant" ON federation_consent FOR SELECT
  USING (
    owner_tenant IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) OR
    counterparty_tenant IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage federation consent" ON federation_consent FOR ALL
  USING (owner_tenant IN (
    SELECT tenant_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- Updated indexes for new table structure and performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_tags ON profiles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_intros_tenant_id ON intros(tenant_id);
CREATE INDEX IF NOT EXISTS idx_intros_status ON intros(status);
CREATE INDEX IF NOT EXISTS idx_intros_created_at ON intros USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_engagement_events_tenant_id ON engagement_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_intro_id ON engagement_events(intro_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_created_at ON engagement_events USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_edges_tenant_id ON edges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
CREATE INDEX IF NOT EXISTS idx_edges_created_at ON edges USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events USING BRIN(created_at);
