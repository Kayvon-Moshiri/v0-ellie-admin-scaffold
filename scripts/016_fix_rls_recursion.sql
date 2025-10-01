-- Fix RLS recursion issues by simplifying policies

-- Drop the problematic helper function
DROP FUNCTION IF EXISTS get_user_profile();
DROP FUNCTION IF EXISTS is_federation_active(UUID, UUID);

-- Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "profile_select" ON profiles;
DROP POLICY IF EXISTS "profile_update" ON profiles;
DROP POLICY IF EXISTS "profile_insert" ON profiles;
DROP POLICY IF EXISTS "profile_admin" ON profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_select_own_tenant" ON profiles FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Drop and recreate simple policies for introductions
DROP POLICY IF EXISTS "intro_select" ON introductions;
DROP POLICY IF EXISTS "intro_manage" ON introductions;

CREATE POLICY "introductions_select" ON introductions FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "introductions_all" ON introductions FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

-- Simple tenant access policy
DROP POLICY IF EXISTS "tenant_access" ON tenants;

CREATE POLICY "tenants_select" ON tenants FOR SELECT
  USING (
    id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );
