-- Priority scoring system for introduction requests
-- Implements Raya-style access control with tier-based rate limiting

-- Add priority scoring fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_intro_limit INTEGER DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_week_intros INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS week_reset_at TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('week', NOW());

-- Add priority scoring fields to intros
ALTER TABLE intros ADD COLUMN IF NOT EXISTS computed_priority NUMERIC DEFAULT 0;
ALTER TABLE intros ADD COLUMN IF NOT EXISTS priority_factors JSONB DEFAULT '{}';
ALTER TABLE intros ADD COLUMN IF NOT EXISTS routing_decision TEXT CHECK (routing_decision IN ('direct','digest','blocked')) DEFAULT 'direct';

-- Create priority thresholds table for tier-based gating
CREATE TABLE IF NOT EXISTS priority_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  target_tier TEXT CHECK (target_tier IN ('member','vip','guest','startup')),
  min_priority_direct NUMERIC DEFAULT 5.0,
  min_priority_digest NUMERIC DEFAULT 2.0,
  weekly_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (tenant_id, target_tier)
);

-- Create passive digest queue for low-priority requests
CREATE TABLE IF NOT EXISTS digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  intro_id UUID REFERENCES intros(id) ON DELETE CASCADE,
  target_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  priority_score NUMERIC,
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  digest_sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('queued','sent','dismissed')) DEFAULT 'queued'
);

-- Enable RLS on new tables
ALTER TABLE priority_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for priority_thresholds
CREATE POLICY "priority_thresholds_tenant_access" ON priority_thresholds FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- RLS policies for digest_queue
CREATE POLICY "digest_queue_tenant_access" ON digest_queue FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Function to compute priority score
CREATE OR REPLACE FUNCTION compute_priority_score(
  p_requester_id UUID,
  p_target_id UUID
) RETURNS JSONB AS $$
DECLARE
  requester_record RECORD;
  target_record RECORD;
  tier_score NUMERIC := 0;
  fit_score NUMERIC := 0;
  scarcity_score NUMERIC := 0;
  history_score NUMERIC := 0;
  fatigue_penalty NUMERIC := 0;
  final_priority NUMERIC := 0;
  factors JSONB := '{}';
BEGIN
  -- Get requester profile
  SELECT tier, scarcity_score INTO requester_record
  FROM profiles WHERE id = p_requester_id;
  
  -- Get target profile
  SELECT tier, scarcity_score, current_week_intros, weekly_intro_limit 
  INTO target_record
  FROM profiles WHERE id = p_target_id;
  
  -- Tier scoring (requester tier importance)
  tier_score := CASE requester_record.tier
    WHEN 'vip' THEN 10.0
    WHEN 'member' THEN 7.0
    WHEN 'startup' THEN 5.0
    WHEN 'guest' THEN 2.0
    ELSE 1.0
  END;
  
  -- Fit score (placeholder - would use ML model in production)
  -- For now, use a simple heuristic based on shared tags/interests
  SELECT COALESCE(
    (SELECT COUNT(*) * 2.0 
     FROM unnest((SELECT tags FROM profiles WHERE id = p_requester_id)) AS r_tag
     JOIN unnest((SELECT tags FROM profiles WHERE id = p_target_id)) AS t_tag
     ON r_tag = t_tag), 
    3.0
  ) INTO fit_score;
  
  -- Scarcity score (target's scarcity increases priority)
  scarcity_score := COALESCE(target_record.scarcity_score, 5.0);
  
  -- History score (previous successful intros boost priority)
  SELECT COALESCE(COUNT(*) * 0.5, 0) INTO history_score
  FROM intros 
  WHERE requester = p_requester_id 
    AND status = 'completed'
    AND created_at > NOW() - INTERVAL '6 months';
  
  -- Fatigue penalty (target's current intro load)
  fatigue_penalty := CASE 
    WHEN target_record.current_week_intros >= target_record.weekly_intro_limit THEN -5.0
    WHEN target_record.current_week_intros >= (target_record.weekly_intro_limit * 0.8) THEN -2.0
    WHEN target_record.current_week_intros >= (target_record.weekly_intro_limit * 0.6) THEN -1.0
    ELSE 0.0
  END;
  
  -- Compute final priority (weighted sum)
  final_priority := (tier_score * 0.3) + (fit_score * 0.25) + (scarcity_score * 0.2) + 
                   (history_score * 0.15) + (fatigue_penalty * 0.1);
  
  -- Build factors object
  factors := jsonb_build_object(
    'tier_score', tier_score,
    'fit_score', fit_score,
    'scarcity_score', scarcity_score,
    'history_score', history_score,
    'fatigue_penalty', fatigue_penalty,
    'final_priority', final_priority,
    'computed_at', NOW()
  );
  
  RETURN factors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to determine routing decision
CREATE OR REPLACE FUNCTION determine_routing(
  p_tenant_id UUID,
  p_target_id UUID,
  p_priority_score NUMERIC,
  p_requester_tier TEXT
) RETURNS TEXT AS $$
DECLARE
  target_tier TEXT;
  threshold_record RECORD;
  routing TEXT := 'direct';
BEGIN
  -- Get target tier
  SELECT tier INTO target_tier FROM profiles WHERE id = p_target_id;
  
  -- Get priority thresholds for target tier
  SELECT min_priority_direct, min_priority_digest INTO threshold_record
  FROM priority_thresholds 
  WHERE tenant_id = p_tenant_id AND target_tier = target_tier;
  
  -- Use default thresholds if not configured
  IF threshold_record IS NULL THEN
    threshold_record.min_priority_direct := CASE target_tier
      WHEN 'vip' THEN 8.0
      WHEN 'member' THEN 5.0
      WHEN 'startup' THEN 3.0
      WHEN 'guest' THEN 1.0
      ELSE 5.0
    END;
    threshold_record.min_priority_digest := threshold_record.min_priority_direct - 3.0;
  END IF;
  
  -- Determine routing
  IF p_priority_score >= threshold_record.min_priority_direct THEN
    routing := 'direct';
  ELSIF p_priority_score >= threshold_record.min_priority_digest THEN
    -- Guest requesters go to digest if below direct threshold
    IF p_requester_tier = 'guest' THEN
      routing := 'digest';
    ELSE
      routing := 'direct';
    END IF;
  ELSE
    routing := 'blocked';
  END IF;
  
  RETURN routing;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update weekly intro limits
CREATE OR REPLACE FUNCTION check_weekly_intro_limit(
  p_profile_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Get current profile data
  SELECT current_week_intros, weekly_intro_limit, week_reset_at, tier
  INTO profile_record
  FROM profiles WHERE id = p_profile_id;
  
  -- Reset weekly counter if week has passed
  IF profile_record.week_reset_at < date_trunc('week', NOW()) THEN
    UPDATE profiles 
    SET current_week_intros = 0, 
        week_reset_at = date_trunc('week', NOW())
    WHERE id = p_profile_id;
    profile_record.current_week_intros := 0;
  END IF;
  
  -- Check if under limit
  IF profile_record.current_week_intros >= profile_record.weekly_intro_limit THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default priority thresholds for common tiers
INSERT INTO priority_thresholds (tenant_id, target_tier, min_priority_direct, min_priority_digest, weekly_limit)
SELECT DISTINCT tenant_id, 'vip', 8.0, 5.0, 5
FROM tenants
ON CONFLICT (tenant_id, target_tier) DO NOTHING;

INSERT INTO priority_thresholds (tenant_id, target_tier, min_priority_direct, min_priority_digest, weekly_limit)
SELECT DISTINCT tenant_id, 'member', 5.0, 2.0, 10
FROM tenants
ON CONFLICT (tenant_id, target_tier) DO NOTHING;

INSERT INTO priority_thresholds (tenant_id, target_tier, min_priority_direct, min_priority_digest, weekly_limit)
SELECT DISTINCT tenant_id, 'startup', 3.0, 1.0, 15
FROM tenants
ON CONFLICT (tenant_id, target_tier) DO NOTHING;

INSERT INTO priority_thresholds (tenant_id, target_tier, min_priority_direct, min_priority_digest, weekly_limit)
SELECT DISTINCT tenant_id, 'guest', 2.0, 0.5, 20
FROM tenants
ON CONFLICT (tenant_id, target_tier) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_priority_thresholds_tenant_tier ON priority_thresholds(tenant_id, target_tier);
CREATE INDEX IF NOT EXISTS idx_digest_queue_target_status ON digest_queue(target_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_digest_queue_queued_at ON digest_queue USING BRIN(queued_at);
CREATE INDEX IF NOT EXISTS idx_profiles_weekly_reset ON profiles(week_reset_at);
CREATE INDEX IF NOT EXISTS idx_intros_computed_priority ON intros(computed_priority DESC);
