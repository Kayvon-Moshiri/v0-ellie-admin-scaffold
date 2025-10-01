-- Add missing columns to profiles table for waitlist/pipeline functionality

-- Add status column for waitlist pipeline
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active' 
      CHECK (status IN ('pending_approval', 'approved', 'rejected', 'scheduled_call', 'active', 'inactive'));
  END IF;
END $$;

-- Add AI recommendation fields for waitlist review
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ai_recommendation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ai_recommendation TEXT 
      CHECK (ai_recommendation IN ('yes', 'no', 'maybe'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ai_insights'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ai_insights TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'recommended_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN recommended_tier TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE profiles ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_status ON profiles(tenant_id, status);

-- Update existing profiles to have 'active' status if null
UPDATE profiles SET status = 'active' WHERE status IS NULL;
