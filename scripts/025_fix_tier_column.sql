-- Fix tier column naming inconsistency
-- The schema originally had 'tier' but some code expects 'membership_tier'
-- This script ensures both columns exist for compatibility

-- Check if membership_tier exists, if not, rename tier to membership_tier
DO $$
BEGIN
  -- If membership_tier doesn't exist but tier does, rename it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_tier'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'tier'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN tier TO membership_tier;
  END IF;
  
  -- If neither exists, add membership_tier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_tier TEXT 
      CHECK (membership_tier IN ('core','plus','guest','startup')) 
      DEFAULT 'core';
  END IF;
END $$;

-- Update the check constraint to use the correct values
DO $$
BEGIN
  -- Drop old tier constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_tier_check'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_tier_check;
  END IF;
  
  -- Drop old membership_tier constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_membership_tier_check'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_membership_tier_check;
  END IF;
  
  -- Add new constraint with correct values
  ALTER TABLE profiles ADD CONSTRAINT profiles_membership_tier_check 
    CHECK (membership_tier IN ('core','plus','guest','startup'));
END $$;

-- Update invites table similarly
DO $$
BEGIN
  -- If membership_tier doesn't exist but tier does in invites, rename it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'membership_tier'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'tier'
  ) THEN
    ALTER TABLE invites RENAME COLUMN tier TO membership_tier;
  END IF;
  
  -- If neither exists, add membership_tier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'membership_tier'
  ) THEN
    ALTER TABLE invites ADD COLUMN membership_tier TEXT 
      CHECK (membership_tier IN ('core','plus','guest','startup')) 
      DEFAULT 'core';
  END IF;
END $$;

-- Update invites constraints
DO $$
BEGIN
  -- Drop old tier constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'invites' AND constraint_name = 'invites_tier_check'
  ) THEN
    ALTER TABLE invites DROP CONSTRAINT invites_tier_check;
  END IF;
  
  -- Drop old membership_tier constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'invites' AND constraint_name = 'invites_membership_tier_check'
  ) THEN
    ALTER TABLE invites DROP CONSTRAINT invites_membership_tier_check;
  END IF;
  
  -- Add new constraint
  ALTER TABLE invites ADD CONSTRAINT invites_membership_tier_check 
    CHECK (membership_tier IN ('core','plus','guest','startup'));
END $$;

-- Update any existing data to use the new tier values
UPDATE profiles 
SET membership_tier = CASE 
  WHEN membership_tier = 'member' THEN 'core'
  WHEN membership_tier = 'vip' THEN 'plus'
  ELSE membership_tier
END
WHERE membership_tier IN ('member', 'vip');

UPDATE invites 
SET membership_tier = CASE 
  WHEN membership_tier = 'member' THEN 'core'
  WHEN membership_tier = 'vip' THEN 'plus'
  ELSE membership_tier
END
WHERE membership_tier IN ('member', 'vip');
