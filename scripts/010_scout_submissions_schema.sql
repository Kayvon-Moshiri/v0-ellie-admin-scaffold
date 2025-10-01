-- Scout submissions and deal discovery system
-- Creates tables for company submissions, ratings, and member interest tracking

-- Companies table (extends existing startups table concept)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  industry TEXT,
  stage TEXT, -- pre-seed, seed, series-a, etc.
  funding_amount BIGINT, -- in cents
  employee_count INTEGER,
  location TEXT,
  founded_year INTEGER,
  tags TEXT[] DEFAULT '{}',
  momentum_score INTEGER DEFAULT 0,
  traction_links JSONB DEFAULT '[]', -- Array of {type, url, description}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scout submissions table
CREATE TABLE IF NOT EXISTS scout_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scout_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Submission details
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  raise_amount BIGINT, -- in cents
  traction_links JSONB DEFAULT '[]', -- Array of {type, url, description}
  notes TEXT,
  
  -- Admin rating (1-10 scale)
  quality INTEGER CHECK (quality >= 1 AND quality <= 10),
  rated_by UUID REFERENCES profiles(id),
  rated_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member interest tracking
CREATE TABLE IF NOT EXISTS member_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  interest_level TEXT DEFAULT 'interested' CHECK (interest_level IN ('interested', 'very_interested', 'not_interested')),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate interests from same member
  UNIQUE(tenant_id, company_id, member_id)
);

-- Engagement events for tracking interactions
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL, -- 'view_company', 'express_interest', 'rate_submission', etc.
  payload JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_momentum_score ON companies(tenant_id, momentum_score DESC);
CREATE INDEX IF NOT EXISTS idx_companies_stage ON companies(tenant_id, stage);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(tenant_id, industry);

CREATE INDEX IF NOT EXISTS idx_scout_submissions_tenant_id ON scout_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scout_submissions_company_id ON scout_submissions(company_id);
CREATE INDEX IF NOT EXISTS idx_scout_submissions_scout_id ON scout_submissions(scout_id);
CREATE INDEX IF NOT EXISTS idx_scout_submissions_status ON scout_submissions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_scout_submissions_quality ON scout_submissions(tenant_id, quality DESC);

CREATE INDEX IF NOT EXISTS idx_member_interests_tenant_id ON member_interests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_member_interests_company_id ON member_interests(company_id);
CREATE INDEX IF NOT EXISTS idx_member_interests_member_id ON member_interests(member_id);

CREATE INDEX IF NOT EXISTS idx_engagement_events_tenant_id ON engagement_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_actor ON engagement_events(actor);
CREATE INDEX IF NOT EXISTS idx_engagement_events_type ON engagement_events(tenant_id, event_type);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view companies in their tenant" ON companies
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND 
    get_current_user_role() IN ('admin', 'owner')
  );

-- Scout submissions policies
CREATE POLICY "Users can view scout submissions in their tenant" ON scout_submissions
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Scouts can create submissions" ON scout_submissions
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id() AND
    scout_id = auth.uid()
  );

CREATE POLICY "Scouts can update their own submissions" ON scout_submissions
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id() AND
    scout_id = auth.uid() AND
    status = 'pending'
  );

CREATE POLICY "Admins can manage all submissions" ON scout_submissions
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND 
    get_current_user_role() IN ('admin', 'owner')
  );

-- Member interests policies
CREATE POLICY "Users can view interests in their tenant" ON member_interests
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Members can manage their own interests" ON member_interests
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    member_id = auth.uid()
  );

-- Engagement events policies
CREATE POLICY "Users can view engagement events in their tenant" ON engagement_events
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can create engagement events" ON engagement_events
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id() AND
    actor = auth.uid()
  );

-- Functions for calculating momentum and heat
CREATE OR REPLACE FUNCTION calculate_company_momentum(company_id UUID)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 50;
  submission_quality NUMERIC;
  interest_count INTEGER;
  recent_activity INTEGER;
  final_score INTEGER;
BEGIN
  -- Get average submission quality (weighted heavily)
  SELECT COALESCE(AVG(quality), 0) INTO submission_quality
  FROM scout_submissions 
  WHERE company_id = calculate_company_momentum.company_id 
    AND status = 'approved'
    AND quality IS NOT NULL;
  
  -- Count member interests (recent activity boost)
  SELECT COUNT(*) INTO interest_count
  FROM member_interests 
  WHERE company_id = calculate_company_momentum.company_id
    AND interest_level IN ('interested', 'very_interested')
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- Count recent engagement events
  SELECT COUNT(*) INTO recent_activity
  FROM engagement_events 
  WHERE payload->>'company_id' = calculate_company_momentum.company_id::text
    AND created_at > NOW() - INTERVAL '7 days';
  
  -- Calculate final score (0-100 scale)
  final_score := base_score + 
    (submission_quality * 5)::INTEGER + 
    (interest_count * 2) + 
    (recent_activity * 1);
  
  -- Cap at 100
  final_score := LEAST(final_score, 100);
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh company momentum scores
CREATE OR REPLACE FUNCTION refresh_company_momentum()
RETURNS VOID AS $$
BEGIN
  UPDATE companies 
  SET momentum_score = calculate_company_momentum(id),
      updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT company_id 
    FROM scout_submissions 
    WHERE updated_at > NOW() - INTERVAL '1 hour'
    UNION
    SELECT DISTINCT company_id 
    FROM member_interests 
    WHERE updated_at > NOW() - INTERVAL '1 hour'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update company momentum when submissions are rated
CREATE OR REPLACE FUNCTION update_company_momentum_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies 
  SET momentum_score = calculate_company_momentum(NEW.company_id),
      updated_at = NOW()
  WHERE id = NEW.company_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_momentum
  AFTER UPDATE OF quality, status ON scout_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_company_momentum_trigger();

-- Trigger to update company momentum when interests change
CREATE OR REPLACE FUNCTION update_company_momentum_on_interest()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies 
  SET momentum_score = calculate_company_momentum(COALESCE(NEW.company_id, OLD.company_id)),
      updated_at = NOW()
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_momentum_on_interest
  AFTER INSERT OR UPDATE OR DELETE ON member_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_company_momentum_on_interest();
