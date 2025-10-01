-- Add support tables for startups discovery feature
-- This script is idempotent and safe to run multiple times

-- Create member_interests table for tracking which members are interested in which companies
CREATE TABLE IF NOT EXISTS member_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_level TEXT NOT NULL DEFAULT 'interested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, company_id, member_id)
);

-- Create scout_submissions table for tracking scout submissions
CREATE TABLE IF NOT EXISTS scout_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  scout_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create engagement_events table for tracking user engagement
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_member_interests_tenant ON member_interests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_member_interests_company ON member_interests(company_id);
CREATE INDEX IF NOT EXISTS idx_member_interests_member ON member_interests(member_id);
CREATE INDEX IF NOT EXISTS idx_scout_submissions_tenant ON scout_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scout_submissions_company ON scout_submissions(company_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_tenant ON engagement_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_actor ON engagement_events(actor);

-- Enable RLS
ALTER TABLE member_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_interests
DROP POLICY IF EXISTS "Users can view interests in their tenant" ON member_interests;
CREATE POLICY "Users can view interests in their tenant"
  ON member_interests FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own interests" ON member_interests;
CREATE POLICY "Users can manage their own interests"
  ON member_interests FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    AND member_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for scout_submissions
DROP POLICY IF EXISTS "Users can view submissions in their tenant" ON scout_submissions;
CREATE POLICY "Users can view submissions in their tenant"
  ON scout_submissions FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Scouts can manage their own submissions" ON scout_submissions;
CREATE POLICY "Scouts can manage their own submissions"
  ON scout_submissions FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    AND scout_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for engagement_events
DROP POLICY IF EXISTS "Users can view events in their tenant" ON engagement_events;
CREATE POLICY "Users can view events in their tenant"
  ON engagement_events FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create their own events" ON engagement_events;
CREATE POLICY "Users can create their own events"
  ON engagement_events FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    AND actor IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
