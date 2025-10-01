-- Fix infinite recursion in profiles RLS policies
-- The issue: policies on profiles were querying profiles, creating infinite recursion
-- Solution: Use a security definer function to bypass RLS when checking user's tenant

-- Drop all existing problematic policies on profiles
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_tenant" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profile_select" ON profiles;
DROP POLICY IF EXISTS "profile_update" ON profiles;
DROP POLICY IF EXISTS "profile_insert" ON profiles;
DROP POLICY IF EXISTS "profile_admin" ON profiles;

-- Drop problematic helper functions
DROP FUNCTION IF EXISTS get_user_profile();
DROP FUNCTION IF EXISTS is_federation_active(UUID, UUID);

-- Create a SECURITY DEFINER function that bypasses RLS to get user's tenant_id
-- This breaks the recursion by not being subject to RLS policies
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create simple, non-recursive policies for profiles
-- SELECT: Users can view profiles in their own tenant
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT: Users can insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- DELETE: Only admins can delete profiles (optional, add if needed)
-- CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE
--   USING (user_id = auth.uid());

-- Also fix other tables that had recursive issues

-- Drop and recreate introductions policies
DROP POLICY IF EXISTS "Users can view intros in their tenant" ON intros;
DROP POLICY IF EXISTS "Users can manage intros they're involved in" ON intros;
DROP POLICY IF EXISTS "intro_select" ON intros;
DROP POLICY IF EXISTS "intro_manage" ON intros;
DROP POLICY IF EXISTS "introductions_select" ON introductions;
DROP POLICY IF EXISTS "introductions_all" ON introductions;

CREATE POLICY "intros_select_policy" ON intros FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "intros_all_policy" ON intros FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- Fix tenants policies
DROP POLICY IF EXISTS "Users can view their tenant" ON tenants;
DROP POLICY IF EXISTS "tenant_access" ON tenants;
DROP POLICY IF EXISTS "tenants_select" ON tenants;

CREATE POLICY "tenants_select_policy" ON tenants FOR SELECT
  USING (id = auth.user_tenant_id());

-- Fix companies policies
DROP POLICY IF EXISTS "Users can view companies in their tenant" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
DROP POLICY IF EXISTS "company_select" ON companies;
DROP POLICY IF EXISTS "company_manage" ON companies;

CREATE POLICY "companies_select_policy" ON companies FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "companies_all_policy" ON companies FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- Fix engagement_events policies
DROP POLICY IF EXISTS "Users can view engagement events in their tenant" ON engagement_events;
DROP POLICY IF EXISTS "Users can create engagement events" ON engagement_events;
DROP POLICY IF EXISTS "engagement_select" ON engagement_events;
DROP POLICY IF EXISTS "engagement_insert" ON engagement_events;

CREATE POLICY "engagement_events_select_policy" ON engagement_events FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "engagement_events_insert_policy" ON engagement_events FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- Fix scouts policies
DROP POLICY IF EXISTS "Users can view scouts in their tenant" ON scouts;
DROP POLICY IF EXISTS "Admins can manage scouts" ON scouts;
DROP POLICY IF EXISTS "scout_select" ON scouts;
DROP POLICY IF EXISTS "scout_manage" ON scouts;

CREATE POLICY "scouts_select_policy" ON scouts FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "scouts_all_policy" ON scouts FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- Fix scout_submissions policies
DROP POLICY IF EXISTS "Users can view scout submissions in their tenant" ON scout_submissions;
DROP POLICY IF EXISTS "Scouts can manage their submissions" ON scout_submissions;
DROP POLICY IF EXISTS "scout_submission_select" ON scout_submissions;
DROP POLICY IF EXISTS "scout_submission_manage" ON scout_submissions;

CREATE POLICY "scout_submissions_select_policy" ON scout_submissions FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "scout_submissions_all_policy" ON scout_submissions FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- Fix events policies
DROP POLICY IF EXISTS "Users can view events in their tenant" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "event_select" ON events;
DROP POLICY IF EXISTS "event_manage" ON events;

CREATE POLICY "events_select_policy" ON events FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "events_all_policy" ON events FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- Fix invites policies
DROP POLICY IF EXISTS "Users can view invites in their tenant" ON invites;
DROP POLICY IF EXISTS "Admins can manage invites" ON invites;
DROP POLICY IF EXISTS "invite_select" ON invites;
DROP POLICY IF EXISTS "invite_manage" ON invites;

CREATE POLICY "invites_select_policy" ON invites FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "invites_all_policy" ON invites FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- Fix edges policies
DROP POLICY IF EXISTS "Users can view edges in their tenant" ON edges;
DROP POLICY IF EXISTS "Users can manage edges they're involved in" ON edges;
DROP POLICY IF EXISTS "edge_select" ON edges;
DROP POLICY IF EXISTS "edge_manage" ON edges;

CREATE POLICY "edges_select_policy" ON edges FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "edges_all_policy" ON edges FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- Fix federation_consent policies
DROP POLICY IF EXISTS "Users can view federation consent for their tenant" ON federation_consent;
DROP POLICY IF EXISTS "Admins can manage federation consent" ON federation_consent;
DROP POLICY IF EXISTS "federation_select" ON federation_consent;
DROP POLICY IF EXISTS "federation_manage" ON federation_consent;

CREATE POLICY "federation_consent_select_policy" ON federation_consent FOR SELECT
  USING (
    owner_tenant = auth.user_tenant_id() OR 
    counterparty_tenant = auth.user_tenant_id()
  );

CREATE POLICY "federation_consent_all_policy" ON federation_consent FOR ALL
  USING (owner_tenant = auth.user_tenant_id());
