-- Nuclear RLS Fix - Drops ALL policies and creates simple demo policies
-- This script ensures no recursive policies remain by dropping every possible policy name

-- Drop ALL policies from all previous scripts (comprehensive list)
-- From script 001
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- From script 006
DROP POLICY IF EXISTS "profile_select" ON profiles;
DROP POLICY IF EXISTS "profile_update" ON profiles;
DROP POLICY IF EXISTS "profile_insert" ON profiles;
DROP POLICY IF EXISTS "profile_admin" ON profiles;

-- From script 016
DROP POLICY IF EXISTS "profiles_select_own_tenant" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- From script 019
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- From script 021
DROP POLICY IF EXISTS "profiles_select_v2" ON profiles;
DROP POLICY IF EXISTS "profiles_update_v2" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_v2" ON profiles;

-- From script 022
DROP POLICY IF EXISTS "profiles_select_demo" ON profiles;
DROP POLICY IF EXISTS "profiles_update_demo" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_demo" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_demo" ON profiles;

-- Additional variations that might exist
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create ONE simple policy that allows all authenticated users to read profiles
-- This policy does NOT query the profiles table, so it cannot cause recursion
CREATE POLICY "profiles_allow_authenticated_read" ON profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow users to update only their own profile
CREATE POLICY "profiles_allow_own_update" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "profiles_allow_own_insert" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "profiles_allow_own_delete" ON profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify the policies are in place
DO $$
BEGIN
  RAISE NOTICE 'RLS policies have been reset. Current policies on profiles table:';
END $$;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
