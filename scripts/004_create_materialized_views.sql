-- Added materialized views for Graph/Heatboard analytics per specification

-- Materialized view for people heat analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS vw_people_heat AS
SELECT 
  e.tenant_id,
  p.id as profile_id,
  COUNT(DISTINCT CASE WHEN e.source = p.id THEN e.target WHEN e.target = p.id THEN e.source END) as degree,
  COALESCE(SUM(CASE WHEN e.source = p.id OR e.target = p.id THEN e.weight END), 0) as weighted_degree,
  GREATEST(
    COALESCE(MAX(e.last_event_at), p.created_at),
    COALESCE(MAX(ee.created_at), p.created_at)
  ) as last_active
FROM profiles p
LEFT JOIN edges e ON (e.source = p.id OR e.target = p.id) AND e.tenant_id = p.tenant_id
LEFT JOIN engagement_events ee ON ee.actor = p.id AND ee.tenant_id = p.tenant_id
GROUP BY e.tenant_id, p.id, p.created_at;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_people_heat_unique ON vw_people_heat(tenant_id, profile_id);

-- Materialized view for startup heat analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS vw_startup_heat AS
SELECT 
  c.tenant_id,
  c.id as company_id,
  COALESCE(AVG(ss.quality), 0) + 
  COALESCE(COUNT(DISTINCT ee.actor) * 0.1, 0) as interest_score
FROM companies c
LEFT JOIN scout_submissions ss ON ss.company_id = c.id AND ss.tenant_id = c.tenant_id
LEFT JOIN engagement_events ee ON ee.payload->>'company_id' = c.id::text AND ee.tenant_id = c.tenant_id
GROUP BY c.tenant_id, c.id;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_startup_heat_unique ON vw_startup_heat(tenant_id, company_id);
