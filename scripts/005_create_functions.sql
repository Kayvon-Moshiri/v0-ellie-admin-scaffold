-- Added network dynamics functions per specification

-- Function to increment edge weight and update last event time
CREATE OR REPLACE FUNCTION increment_edge(
  p_source UUID,
  p_target UUID,
  p_weight_inc NUMERIC,
  p_kind TEXT
) RETURNS VOID AS $$
DECLARE
  p_tenant_id UUID;
BEGIN
  -- Get tenant_id from source profile
  SELECT tenant_id INTO p_tenant_id FROM profiles WHERE id = p_source;
  
  -- Upsert edge with weight increment and timestamp update
  INSERT INTO edges (tenant_id, source, target, weight, last_event_at, kind, created_at)
  VALUES (p_tenant_id, p_source, p_target, p_weight_inc, NOW(), p_kind, NOW())
  ON CONFLICT (tenant_id, source, target)
  DO UPDATE SET
    weight = edges.weight + p_weight_inc,
    last_event_at = NOW(),
    kind = p_kind;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate scarcity scores for profiles in a tenant
CREATE OR REPLACE FUNCTION recalc_scarcity(p_tenant_id UUID) RETURNS VOID AS $$
DECLARE
  profile_record RECORD;
  reply_rate NUMERIC;
  role_multiplier NUMERIC;
  availability_factor NUMERIC;
  recent_load NUMERIC;
  final_score NUMERIC;
BEGIN
  FOR profile_record IN 
    SELECT id, role, availability FROM profiles WHERE tenant_id = p_tenant_id
  LOOP
    -- Calculate reply rate from engagement events
    SELECT 
      COALESCE(
        COUNT(CASE WHEN kind = 'reply' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(CASE WHEN kind = 'view' THEN 1 END), 0),
        0.5
      ) INTO reply_rate
    FROM engagement_events ee
    JOIN intros i ON ee.intro_id = i.id
    WHERE ee.actor = profile_record.id 
      AND ee.created_at > NOW() - INTERVAL '30 days';
    
    -- Role-based multiplier
    role_multiplier := CASE profile_record.role
      WHEN 'admin' THEN 1.5
      WHEN 'scout' THEN 1.3
      WHEN 'member' THEN 1.0
      WHEN 'guest' THEN 0.8
      ELSE 1.0
    END;
    
    -- Availability factor (lower availability = higher scarcity)
    availability_factor := CASE 
      WHEN profile_record.availability->>'status' = 'busy' THEN 2.0
      WHEN profile_record.availability->>'status' = 'limited' THEN 1.5
      WHEN profile_record.availability->>'status' = 'available' THEN 1.0
      ELSE 1.2
    END;
    
    -- Recent load (number of recent intros)
    SELECT COUNT(*) INTO recent_load
    FROM intros 
    WHERE (requester = profile_record.id OR target = profile_record.id)
      AND created_at > NOW() - INTERVAL '7 days';
    
    -- Calculate final scarcity score
    final_score := (1.0 - reply_rate) * role_multiplier * availability_factor * (1.0 + recent_load * 0.1);
    
    -- Update profile with new scarcity score
    UPDATE profiles 
    SET scarcity_score = ROUND(final_score, 2)
    WHERE id = profile_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get network graph data for visualization
CREATE OR REPLACE FUNCTION get_network_graph_data(p_tenant_id UUID)
RETURNS TABLE(
  nodes JSONB,
  edges_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Nodes (profiles)
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.full_name,
          'email', p.email,
          'role', p.role,
          'tier', p.tier,
          'scarcity_score', p.scarcity_score,
          'tags', p.tags
        )
      ), '[]'::jsonb
    ) as nodes,
    -- Edges (connections)
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'source', e.source,
          'target', e.target,
          'weight', e.weight,
          'kind', e.kind,
          'last_event_at', e.last_event_at
        )
      ) FROM edges e WHERE e.tenant_id = p_tenant_id),
      '[]'::jsonb
    ) as edges_data
  FROM profiles p 
  WHERE p.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
