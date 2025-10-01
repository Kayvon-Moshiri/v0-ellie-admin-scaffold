-- Fix RLS policies on federation tables to prevent recursion
-- These policies were querying profiles table which caused infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "cross_tenant_intro_requests_select" ON cross_tenant_intro_requests;
DROP POLICY IF EXISTS "cross_tenant_intro_requests_insert" ON cross_tenant_intro_requests;
DROP POLICY IF EXISTS "cross_tenant_intro_requests_update" ON cross_tenant_intro_requests;
DROP POLICY IF EXISTS "cross_tenant_rate_limits_select" ON cross_tenant_rate_limits;
DROP POLICY IF EXISTS "cross_tenant_rate_limits_manage" ON cross_tenant_rate_limits;

-- Create non-recursive policies using the auth.user_tenant_id() function

-- cross_tenant_intro_requests policies
CREATE POLICY "cross_tenant_intro_requests_select" ON cross_tenant_intro_requests FOR SELECT
  USING (
    requester_tenant_id = auth.user_tenant_id() OR
    target_tenant_id = auth.user_tenant_id()
  );

CREATE POLICY "cross_tenant_intro_requests_insert" ON cross_tenant_intro_requests FOR INSERT
  WITH CHECK (
    requester_tenant_id = auth.user_tenant_id()
  );

CREATE POLICY "cross_tenant_intro_requests_update" ON cross_tenant_intro_requests FOR UPDATE
  USING (
    target_tenant_id = auth.user_tenant_id() OR
    requester_tenant_id = auth.user_tenant_id()
  );

-- cross_tenant_rate_limits policies
CREATE POLICY "cross_tenant_rate_limits_select" ON cross_tenant_rate_limits FOR SELECT
  USING (
    requester_tenant_id = auth.user_tenant_id() OR
    target_tenant_id = auth.user_tenant_id()
  );

CREATE POLICY "cross_tenant_rate_limits_insert" ON cross_tenant_rate_limits FOR INSERT
  WITH CHECK (
    requester_tenant_id = auth.user_tenant_id()
  );

CREATE POLICY "cross_tenant_rate_limits_update" ON cross_tenant_rate_limits FOR UPDATE
  USING (
    requester_tenant_id = auth.user_tenant_id() OR
    target_tenant_id = auth.user_tenant_id()
  );

CREATE POLICY "cross_tenant_rate_limits_delete" ON cross_tenant_rate_limits FOR DELETE
  USING (
    requester_tenant_id = auth.user_tenant_id()
  );
