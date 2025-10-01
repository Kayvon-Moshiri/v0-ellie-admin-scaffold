-- Create federation and related tables that are missing from the schema

-- Federation consent table for cross-tenant connections
CREATE TABLE IF NOT EXISTS federation_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_tenant UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  counterparty_tenant UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  share_people BOOLEAN DEFAULT true,
  share_edges BOOLEAN DEFAULT false,
  share_companies BOOLEAN DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'revoked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_tenant, counterparty_tenant)
);

-- Add is_federated flag to tenants if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'is_federated'
  ) THEN
    ALTER TABLE tenants ADD COLUMN is_federated BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add visibility column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'tenant', 'federated'));
  END IF;
END $$;

-- Add user_id column to profiles if it doesn't exist (for auth)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_federation_consent_owner ON federation_consent(owner_tenant);
CREATE INDEX IF NOT EXISTS idx_federation_consent_counterparty ON federation_consent(counterparty_tenant);
CREATE INDEX IF NOT EXISTS idx_federation_consent_status ON federation_consent(status);

-- Enable RLS
ALTER TABLE federation_consent ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for federation_consent (no recursion)
CREATE POLICY "federation_consent_select" ON federation_consent FOR SELECT
  USING (
    owner_tenant IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) OR
    counterparty_tenant IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "federation_consent_insert" ON federation_consent FOR INSERT
  WITH CHECK (
    owner_tenant IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "federation_consent_update" ON federation_consent FOR UPDATE
  USING (
    owner_tenant IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    counterparty_tenant IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "federation_consent_delete" ON federation_consent FOR DELETE
  USING (
    owner_tenant IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON federation_consent TO authenticated;
