-- Communications Providers Schema
-- Enables tenants to configure their own communication channels (white-label friendly)

-- Create comms_providers table for tenant-specific communication credentials
CREATE TABLE IF NOT EXISTS comms_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type TEXT CHECK (provider_type IN ('email_supabase', 'email_sendgrid', 'sms_twilio', 'voice_twilio', 'imessage_apple', 'whatsapp_twilio')) NOT NULL,
  provider_name TEXT NOT NULL, -- Display name like "Company SMTP" or "Main SMS Line"
  
  -- Encrypted credentials storage
  credentials JSONB NOT NULL DEFAULT '{}', -- Encrypted provider-specific config
  
  -- Configuration and status
  config JSONB DEFAULT '{}', -- Provider-specific settings (from_name, etc.)
  status TEXT CHECK (status IN ('pending', 'verified', 'failed', 'disabled')) DEFAULT 'pending',
  is_default BOOLEAN DEFAULT FALSE, -- Default provider for this type
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Verification and testing
  last_test_at TIMESTAMP WITH TIME ZONE,
  last_test_status TEXT CHECK (last_test_status IN ('success', 'failed')),
  last_test_error TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one default per provider type per tenant
  UNIQUE (tenant_id, provider_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS
ALTER TABLE comms_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view comms providers in their tenant" ON comms_providers FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage comms providers" ON comms_providers FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comms_providers_tenant_id ON comms_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comms_providers_type ON comms_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_comms_providers_status ON comms_providers(status);
CREATE INDEX IF NOT EXISTS idx_comms_providers_default ON comms_providers(tenant_id, provider_type, is_default) WHERE is_default = true;

-- Function to ensure only one default per provider type per tenant
CREATE OR REPLACE FUNCTION ensure_single_default_provider()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a provider as default, unset others of the same type
  IF NEW.is_default = true THEN
    UPDATE comms_providers 
    SET is_default = false 
    WHERE tenant_id = NEW.tenant_id 
      AND provider_type = NEW.provider_type 
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single default constraint
CREATE TRIGGER trigger_ensure_single_default_provider
  BEFORE INSERT OR UPDATE ON comms_providers
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_provider();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comms_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_comms_providers_updated_at
  BEFORE UPDATE ON comms_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_comms_providers_updated_at();
