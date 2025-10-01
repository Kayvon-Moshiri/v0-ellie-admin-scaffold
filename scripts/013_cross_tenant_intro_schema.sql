-- Cross-tenant introduction request schema
-- Extend```sql file="scripts/013_cross_tenant_intro_schema.sql"
-- Cross-tenant introduction request schema
-- Extends the existing intro system to support federated introductions

-- Add cross-tenant fields to intros table
ALTER TABLE intros ADD COLUMN IF NOT EXISTS is_cross_tenant BOOLEAN DEFAULT FALSE;
ALTER TABLE intros ADD COLUMN IF NOT EXISTS target_tenant_id UUID REFERENCES tenants(id);
ALTER TABLE intros ADD COLUMN IF NOT EXISTS requester_tenant_id UUID REFERENCES tenants(id);

-- Create cross_tenant_intro_requests table for managing federated intro workflow
CREATE TABLE IF NOT EXISTS cross_tenant_intro_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intro_id UUID REFERENCES intros(id) ON DELETE CASCADE,
  requester_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  target_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  requester_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending_approval','approved','declined','rate_limited')) DEFAULT 'pending_approval',
  approval_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  rate_limit_reset_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate limiting table for cross-tenant requests
CREATE TABLE IF NOT EXISTS cross_tenant_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  target_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  requester_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (requester_tenant_id, target_tenant_id, requester_profile_id)
);

-- Enable RLS on new tables
ALTER TABLE cross_tenant_intro_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_tenant_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for cross_tenant_intro_requests
CREATE POLICY "cross_tenant_intro_requests_select" ON cross_tenant_intro_requests FOR SELECT
  USING (
    requester_tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) OR
    target_tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "cross_tenant_intro_requests_insert" ON cross_tenant_intro_requests FOR INSERT
  WITH CHECK (
    requester_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "cross_tenant_intro_requests_update" ON cross_tenant_intro_requests FOR UPDATE
  USING (
    target_tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin')
    ) OR
    requester_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS policies for cross_tenant_rate_limits
CREATE POLICY "cross_tenant_rate_limits_select" ON cross_tenant_rate_limits FOR SELECT
  USING (
    requester_tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) OR
    target_tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "cross_tenant_rate_limits_manage" ON cross_tenant_rate_limits FOR ALL
  USING (
    requester_tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin')
    )
  );

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_cross_tenant_rate_limit(
  p_requester_tenant_id UUID,
  p_target_tenant_id UUID,
  p_requester_profile_id UUID,
  p_max_requests INTEGER DEFAULT 5,
  p_window_hours INTEGER DEFAULT 24
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get or create rate limit record
  INSERT INTO cross_tenant_rate_limits (
    requester_tenant_id, 
    target_tenant_id, 
    requester_profile_id,
    request_count,
    window_start
  ) VALUES (
    p_requester_tenant_id,
    p_target_tenant_id,
    p_requester_profile_id,
    0,
    NOW()
  ) ON CONFLICT (requester_tenant_id, target_tenant_id, requester_profile_id) 
  DO NOTHING;

  -- Get current rate limit info
  SELECT request_count, window_start INTO current_count, window_start
  FROM cross_tenant_rate_limits
  WHERE requester_tenant_id = p_requester_tenant_id
    AND target_tenant_id = p_target_tenant_id
    AND requester_profile_id = p_requester_profile_id;

  -- Reset window if expired
  IF window_start + INTERVAL '1 hour' * p_window_hours < NOW() THEN
    UPDATE cross_tenant_rate_limits
    SET request_count = 0, window_start = NOW()
    WHERE requester_tenant_id = p_requester_tenant_id
      AND target_tenant_id = p_target_tenant_id
      AND requester_profile_id = p_requester_profile_id;
    current_count := 0;
  END IF;

  -- Check if under limit
  IF current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  -- Increment counter
  UPDATE cross_tenant_rate_limits
  SET request_count = request_count + 1
  WHERE requester_tenant_id = p_requester_tenant_id
    AND target_tenant_id = p_target_tenant_id
    AND requester_profile_id = p_requester_profile_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cross_tenant_intro_requests_status ON cross_tenant_intro_requests(status);
CREATE INDEX IF NOT EXISTS idx_cross_tenant_intro_requests_target_tenant ON cross_tenant_intro_requests(target_tenant_id);
CREATE INDEX IF NOT EXISTS idx_cross_tenant_intro_requests_created_at ON cross_tenant_intro_requests USING BRIN(created_at);
CREATE INDEX IF NOT EXISTS idx_cross_tenant_rate_limits_window ON cross_tenant_rate_limits(requester_tenant_id, target_tenant_id, requester_profile_id);
