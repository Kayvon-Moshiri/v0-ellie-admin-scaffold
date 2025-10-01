-- Utility functions for Ellie Admin

-- Function to calculate user activity score
CREATE OR REPLACE FUNCTION calculate_activity_score(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  connection_count INTEGER;
  intro_count INTEGER;
  event_count INTEGER;
  recent_activity INTEGER;
BEGIN
  -- Count connections (weight: 2 points each)
  SELECT COUNT(*) INTO connection_count
  FROM connections 
  WHERE from_user_id = user_id OR to_user_id = user_id;
  
  score := score + (connection_count * 2);
  
  -- Count successful introductions (weight: 5 points each)
  SELECT COUNT(*) INTO intro_count
  FROM introductions 
  WHERE (person_a_id = user_id OR person_b_id = user_id) 
    AND status = 'completed';
  
  score := score + (intro_count * 5);
  
  -- Count event attendance (weight: 3 points each)
  SELECT COUNT(*) INTO event_count
  FROM event_attendees 
  WHERE user_id = user_id AND status = 'attended';
  
  score := score + (event_count * 3);
  
  -- Recent activity bonus (last 30 days)
  SELECT COUNT(*) INTO recent_activity
  FROM activities 
  WHERE user_id = user_id 
    AND created_at > NOW() - INTERVAL '30 days';
  
  score := score + recent_activity;
  
  RETURN GREATEST(score, 0);
END;
$$;

-- Function to calculate startup momentum score
CREATE OR REPLACE FUNCTION calculate_momentum_score(startup_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  employee_growth INTEGER;
  funding_stage_score INTEGER;
  activity_count INTEGER;
BEGIN
  -- Base score from employee count
  SELECT employee_count INTO score FROM startups WHERE id = startup_id;
  score := COALESCE(score, 0);
  
  -- Funding stage multiplier
  SELECT 
    CASE stage
      WHEN 'idea' THEN 10
      WHEN 'pre-seed' THEN 20
      WHEN 'seed' THEN 35
      WHEN 'series-a' THEN 50
      WHEN 'series-b' THEN 70
      WHEN 'series-c' THEN 85
      WHEN 'growth' THEN 95
      WHEN 'ipo' THEN 100
      WHEN 'acquired' THEN 90
      ELSE 0
    END INTO funding_stage_score
  FROM startups WHERE id = startup_id;
  
  score := score + COALESCE(funding_stage_score, 0);
  
  -- Recent activity bonus
  SELECT COUNT(*) INTO activity_count
  FROM activities 
  WHERE entity_id = startup_id 
    AND entity_type = 'startup'
    AND created_at > NOW() - INTERVAL '30 days';
  
  score := score + (activity_count * 2);
  
  RETURN GREATEST(score, 0);
END;
$$;

-- Function to get network graph data
CREATE OR REPLACE FUNCTION get_network_graph(tenant_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  WITH nodes AS (
    SELECT 
      p.id,
      p.display_name,
      p.full_name,
      p.avatar_url,
      p.company,
      p.job_title,
      p.activity_score,
      p.role
    FROM profiles p
    WHERE p.tenant_id = tenant_uuid
  ),
  edges AS (
    SELECT 
      c.from_user_id as source,
      c.to_user_id as target,
      c.strength,
      c.connection_type,
      c.context
    FROM connections c
    WHERE c.tenant_id = tenant_uuid
  )
  SELECT json_build_object(
    'nodes', json_agg(nodes.*),
    'edges', (SELECT json_agg(edges.*) FROM edges)
  ) INTO result
  FROM nodes;
  
  RETURN result;
END;
$$;

-- Function to get introduction pipeline data
CREATE OR REPLACE FUNCTION get_intro_pipeline(tenant_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', i.id,
        'status', i.status,
        'priority', i.priority,
        'reason', i.reason,
        'context', i.context,
        'created_at', i.created_at,
        'scheduled_for', i.scheduled_for,
        'requester', json_build_object(
          'id', r.id,
          'name', r.display_name,
          'avatar', r.avatar_url
        ),
        'person_a', json_build_object(
          'id', pa.id,
          'name', pa.display_name,
          'avatar', pa.avatar_url,
          'company', pa.company
        ),
        'person_b', json_build_object(
          'id', pb.id,
          'name', pb.display_name,
          'avatar', pb.avatar_url,
          'company', pb.company
        )
      )
    )
    FROM introductions i
    JOIN profiles r ON i.requester_id = r.id
    JOIN profiles pa ON i.person_a_id = pa.id
    JOIN profiles pb ON i.person_b_id = pb.id
    WHERE i.tenant_id = tenant_uuid
    ORDER BY i.priority DESC, i.created_at DESC
  );
END;
$$;
