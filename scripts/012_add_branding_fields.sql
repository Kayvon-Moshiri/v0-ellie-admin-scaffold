-- Add branding and theme configuration to tenants table
-- Supports white-label customization per tenant

-- Update tenants table to include proper branding fields
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
  "brand_bg": "#0f172a",
  "brand_primary": "#6366f1", 
  "brand_accent": "#8b5cf6",
  "ai_name": "Ellie"
}',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Update existing demo tenant with proper theme config
UPDATE tenants 
SET theme_config = '{
  "brand_bg": "#0f172a",
  "brand_primary": "#6366f1", 
  "brand_accent": "#8b5cf6",
  "ai_name": "Ellie"
}'
WHERE slug = 'demo-network';

-- Create index for domain lookups
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
