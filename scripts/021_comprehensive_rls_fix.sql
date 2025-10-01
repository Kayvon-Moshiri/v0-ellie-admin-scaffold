-- Comprehensive fix for infinite recursion in RLS policies
-- This script ensures ALL old policies are removed and creates clean, non-recursive policies

-- ============================================================================
-- STEP 1: Drop ALL possible policy variations that could exist
-- ============================================================================

-- Drop all possible profiles policies (from all previous scripts)
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
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- ============================================================================
-- STEP 2: Drop problematic helper functions and recreate the safe one
-- ============================================================================

-- Drop old problematic functions
DROP FUNCTION IF EXISTS get_user_profile();
DROP FUNCTION IF EXISTS is_federation_active(UUID, UUID);

-- Recreate the SECURITY DEFINER function that safely bypasses RLS
-- This is the KEY to breaking the recursion
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- STEP 3: Create simple, non-recursive policies for profiles
-- ============================================================================

-- SELECT: Users can view profiles in their own tenant
-- Uses auth.user_tenant_id() which bypasses RLS, preventing recursion
CREATE POLICY "profiles_select_v2" ON profiles FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

-- UPDATE: Users can only update their own profile
-- No recursion because it only checks auth.uid(), not profiles table
CREATE POLICY "profiles_update_v2" ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT: Users can insert their own profile
-- No recursion because it only checks auth.uid()
CREATE POLICY "profiles_insert_v2" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STEP 4: Fix all other tables to use the same pattern
-- ============================================================================

-- TENANTS
DROP POLICY IF EXISTS "Users can view their tenant" ON tenants;
DROP POLICY IF EXISTS "tenant_access" ON tenants;
DROP POLICY IF EXISTS "tenants_select" ON tenants;
DROP POLICY IF EXISTS "tenants_select_policy" ON tenants;

CREATE POLICY "tenants_select_v2" ON tenants FOR SELECT
  USING (id = auth.user_tenant_id());

-- COMPANIES
DROP POLICY IF EXISTS "Users can view companies in their tenant" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
DROP POLICY IF EXISTS "company_select" ON companies;
DROP POLICY IF EXISTS "company_manage" ON companies;
DROP POLICY IF EXISTS "companies_select_policy" ON companies;
DROP POLICY IF EXISTS "companies_all_policy" ON companies;

CREATE POLICY "companies_select_v2" ON companies FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "companies_all_v2" ON companies FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- INTROS
DROP POLICY IF EXISTS "Users can view intros in their tenant" ON intros;
DROP POLICY IF EXISTS "Users can manage intros they're involved in" ON intros;
DROP POLICY IF EXISTS "intro_select" ON intros;
DROP POLICY IF EXISTS "intro_manage" ON intros;
DROP POLICY IF EXISTS "introductions_select" ON introductions;
DROP POLICY IF EXISTS "introductions_all" ON introductions;
DROP POLICY IF EXISTS "intros_select_policy" ON intros;
DROP POLICY IF EXISTS "intros_all_policy" ON intros;

CREATE POLICY "intros_select_v2" ON intros FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "intros_all_v2" ON intros FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- ENGAGEMENT_EVENTS
DROP POLICY IF EXISTS "Users can view engagement events in their tenant" ON engagement_events;
DROP POLICY IF EXISTS "Users can create engagement events" ON engagement_events;
DROP POLICY IF EXISTS "engagement_select" ON engagement_events;
DROP POLICY IF EXISTS "engagement_insert" ON engagement_events;
DROP POLICY IF EXISTS "engagement_events_select_policy" ON engagement_events;
DROP POLICY IF EXISTS "engagement_events_insert_policy" ON engagement_events;

CREATE POLICY "engagement_events_select_v2" ON engagement_events FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "engagement_events_insert_v2" ON engagement_events FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- SCOUTS
DROP POLICY IF EXISTS "Users can view scouts in their tenant" ON scouts;
DROP POLICY IF EXISTS "Admins can manage scouts" ON scouts;
DROP POLICY IF EXISTS "scout_select" ON scouts;
DROP POLICY IF EXISTS "scout_manage" ON scouts;
DROP POLICY IF EXISTS "scouts_select_policy" ON scouts;
DROP POLICY IF EXISTS "scouts_all_policy" ON scouts;

CREATE POLICY "scouts_select_v2" ON scouts FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "scouts_all_v2" ON scouts FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- SCOUT_SUBMISSIONS
DROP POLICY IF EXISTS "Users can view scout submissions in their tenant" ON scout_submissions;
DROP POLICY IF EXISTS "Scouts can manage their submissions" ON scout_submissions;
DROP POLICY IF EXISTS "scout_submission_select" ON scout_submissions;
DROP POLICY IF EXISTS "scout_submission_manage" ON scout_submissions;
DROP POLICY IF EXISTS "scout_submissions_select_policy" ON scout_submissions;
DROP POLICY IF EXISTS "scout_submissions_all_policy" ON scout_submissions;

CREATE POLICY "scout_submissions_select_v2" ON scout_submissions FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "scout_submissions_all_v2" ON scout_submissions FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- EVENTS
DROP POLICY IF EXISTS "Users can view events in their tenant" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "event_select" ON events;
DROP POLICY IF EXISTS "event_manage" ON events;
DROP POLICY IF EXISTS "events_select_policy" ON events;
DROP POLICY IF EXISTS "events_all_policy" ON events;

CREATE POLICY "events_select_v2" ON events FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "events_all_v2" ON events FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- INVITES
DROP POLICY IF EXISTS "Users can view invites in their tenant" ON invites;
DROP POLICY IF EXISTS "Admins can manage invites" ON invites;
DROP POLICY IF EXISTS "invite_select" ON invites;
DROP POLICY IF EXISTS "invite_manage" ON invites;
DROP POLICY IF EXISTS "invites_select_policy" ON invites;
DROP POLICY IF EXISTS "invites_all_policy" ON invites;

CREATE POLICY "invites_select_v2" ON invites FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "invites_all_v2" ON invites FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- EDGES
DROP POLICY IF EXISTS "Users can view edges in their tenant" ON edges;
DROP POLICY IF EXISTS "Users can manage edges they're involved in" ON edges;
DROP POLICY IF EXISTS "edge_select" ON edges;
DROP POLICY IF EXISTS "edge_manage" ON edges;
DROP POLICY IF EXISTS "edges_select_policy" ON edges;
DROP POLICY IF EXISTS "edges_all_policy" ON edges;

CREATE POLICY "edges_select_v2" ON edges FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "edges_all_v2" ON edges FOR ALL
  USING (tenant_id = auth.user_tenant_id());

-- FEDERATION_CONSENT
DROP POLICY IF EXISTS "Users can view federation consent for their tenant" ON federation_consent;
DROP POLICY IF EXISTS "Admins can manage federation consent" ON federation_consent;
DROP POLICY IF EXISTS "federation_select" ON federation_consent;
DROP POLICY IF EXISTS "federation_manage" ON federation_consent;
DROP POLICY IF EXISTS "federation_consent_select_policy" ON federation_consent;
DROP POLICY IF EXISTS "federation_consent_all_policy" ON federation_consent;

CREATE POLICY "federation_consent_select_v2" ON federation_consent FOR SELECT
  USING (
    owner_tenant = auth.user_tenant_id() OR 
    counterparty_tenant = auth.user_tenant_id()
  );

CREATE POLICY "federation_consent_all_v2" ON federation_consent FOR ALL
  USING (owner_tenant = auth.user_tenant_id());
