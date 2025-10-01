-- Simple RLS Policies for Demo Environment
-- This script removes complex recursive policies and implements simple, permissive policies
-- suitable for development and demo environments.
--
-- IMPORTANT: In production, you should implement proper tenant isolation using one of these approaches:
-- 1. Store tenant_id in JWT claims (auth.jwt() -> 'app_metadata')
-- 2. Use a separate user_tenants junction table
-- 3. Implement application-layer authorization with service role key

-- Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "profile_select" ON profiles;
DROP POLICY IF EXISTS "profile_update" ON profiles;
DROP POLICY IF EXISTS "profile_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_tenant" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

-- Create simple, non-recursive policies for demo environment
-- These policies allow authenticated users to access profiles without complex tenant checks

-- SELECT: Allow authenticated users to read all profiles
-- In production, add: AND tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'
CREATE POLICY "profiles_select_demo" ON profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- UPDATE: Allow users to update their own profile
CREATE POLICY "profiles_update_demo" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INSERT: Allow authenticated users to create profiles
CREATE POLICY "profiles_insert_demo" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Allow users to delete their own profile (optional)
CREATE POLICY "profiles_delete_demo" ON profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add helpful comment
COMMENT ON TABLE profiles IS 'Demo RLS policies - allows authenticated users to read all profiles. Tighten for production.';
