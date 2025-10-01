-- Update the startup heat materialized view to work with new schema
-- This replaces the previous view with proper company and scout submission integration

-- Drop the old view first
DROP MATERIALIZED VIEW IF EXISTS vw_startup_heat;

-- Create updated materialized view for startup heat analytics
CREATE MATERIALIZED VIEW vw_startup_heat AS
SELECT 
  c.tenant_id,
  c.id as company_id,
  c.name as company_name,
  c.industry as sector,
  c.stage,
  c.momentum_score,
  c.tags,
  
  -- Scout submission quality (weighted heavily)
  COALESCE(AVG(ss.quality), 0) as avg_quality,
  COUNT(DISTINCT ss.id) as submission_count,
  
  -- Member interest metrics
  COUNT(DISTINCT mi.member_id) as interest_count,
  COUNT(DISTINCT CASE WHEN mi.interest_level = 'very_interested' THEN mi.member_id END) as high_interest_count,
  
  -- Recent activity boost
  COUNT(DISTINCT CASE WHEN ee.created_at > NOW() - INTERVAL '7 days' THEN ee.actor END) as recent_activity_count,
  COUNT(DISTINCT CASE WHEN mi.created_at > NOW() - INTERVAL '30 days' THEN mi.member_id END) as recent_interest_count,
  
  -- Calculate final interest score (0-100 scale)
  LEAST(100, GREATEST(0, 
    -- Base momentum score from company
    COALESCE(c.momentum_score, 50) +
    -- Quality bonus (approved submissions with high ratings)
    (COALESCE(AVG(CASE WHEN ss.status = 'approved' THEN ss.quality END), 0) * 3)::INTEGER +
    -- Interest multiplier
    (COUNT(DISTINCT mi.member_id) * 2) +
    -- High interest bonus
    (COUNT(DISTINCT CASE WHEN mi.interest_level = 'very_interested' THEN mi.member_id END) * 5) +
    -- Recent activity bonus
    (COUNT(DISTINCT CASE WHEN ee.created_at > NOW() - INTERVAL '7 days' THEN ee.actor END) * 1) +
    -- Recency bonus for new interests
    (COUNT(DISTINCT CASE WHEN mi.created_at > NOW() - INTERVAL '7 days' THEN mi.member_id END) * 3)
  )) as interest_score,
  
  -- Latest activity timestamp
  GREATEST(
    COALESCE(MAX(ss.created_at), c.created_at),
    COALESCE(MAX(mi.created_at), c.created_at),
    COALESCE(MAX(ee.created_at), c.created_at)
  ) as last_activity,
  
  -- Scout attribution
  STRING_AGG(DISTINCT p.display_name, ', ') as scout_names,
  MAX(ss.created_at) as latest_submission_date

FROM companies c
LEFT JOIN scout_submissions ss ON ss.company_id = c.id AND ss.tenant_id = c.tenant_id
LEFT JOIN member_interests mi ON mi.company_id = c.id AND mi.tenant_id = c.tenant_id
LEFT JOIN engagement_events ee ON ee.payload->>'company_id' = c.id::text AND ee.tenant_id = c.tenant_id
LEFT JOIN profiles p ON p.id = ss.scout_id AND p.tenant_id = c.tenant_id
GROUP BY c.tenant_id, c.id, c.name, c.industry, c.stage, c.momentum_score, c.tags, c.created_at;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX idx_vw_startup_heat_unique ON vw_startup_heat(tenant_id, company_id);

-- Create additional indexes for performance
CREATE INDEX idx_vw_startup_heat_interest_score ON vw_startup_heat(tenant_id, interest_score DESC);
CREATE INDEX idx_vw_startup_heat_last_activity ON vw_startup_heat(tenant_id, last_activity DESC);
CREATE INDEX idx_vw_startup_heat_sector ON vw_startup_heat(tenant_id, sector);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_startup_heat_view()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_startup_heat;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh (can be called by cron or application)
-- This should be called periodically to keep the view up to date
