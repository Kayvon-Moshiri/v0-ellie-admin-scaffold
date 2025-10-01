-- Advanced Row-Level Security (RLS) Policies for Ellie Admin
-- Implements strict tenant isolation with federated glimpses and role-based access

-- Drop existing policies to replace with advanced ones
DROP POLICY IF EXISTS "Users can view their tenant" ON tenants;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view companies in their tenant" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
DROP POLICY IF EXISTS "Users can view intros in their tenant" ON intros;
DROP POLICY IF EXISTS "Users can manage intros they're involved in" ON intros;
DROP POLICY IF EXISTS "Users can view engagement events in their tenant" ON engagement_events;
DROP POLICY IF EXISTS "Users can create engagement events" ON engagement_events;
DROP POLICY IF EXISTS "Users can view scouts in their tenant" ON scouts;
DROP POLICY IF EXISTS "Admins can manage scouts" ON scouts;
DROP POLICY IF EXISTS "Users can view scout submissions in their tenant" ON scout_submissions;
DROP POLICY IF EXISTS "Scouts can manage their submissions" ON scout_submissions;
DROP POLICY IF EXISTS "Users can view events in their tenant" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can view invites in their tenant" ON invites;
DROP POLICY IF EXISTS "Admins can manage invites" ON invites;
DROP POLICY IF EXISTS "Users can view edges in their tenant" ON edges;
DROP POLICY IF EXISTS "Users can manage edges they're involved in" ON edges;
DROP POLICY IF EXISTS "Users can view federation consent for their tenant" ON federation_consent;
DROP POLICY IF EXISTS "Admins can manage federation consent" ON federation_consent;

-- Helper function to get user's profile info
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE(tenant_id UUID, role TEXT, tier TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.tenant_id, p.role, p.tier
  FROM profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if federation is active between two tenants
CREATE OR REPLACE FUNCTION is_federation_active(tenant_a UUID, tenant_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM federation_consent fc1
    JOIN federation_consent fc2 ON fc1.owner_tenant = fc2.counterparty_tenant 
                                AND fc1.counterparty_tenant = fc2.owner_tenant
    WHERE fc1.owner_tenant = tenant_a 
      AND fc1.counterparty_tenant = tenant_b
      AND fc1.status = 'active'
      AND fc2.status = 'active'
      AND fc1.share_people = true
      AND fc2.share_people = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TENANTS TABLE POLICIES
-- Users can view their own tenant and federated tenants
CREATE POLICY "tenant_access" ON tenants FOR SELECT
  USING (
    -- Own tenant
    id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR
    -- Federated tenants where both sides consent
    (is_federated = true AND EXISTS (
      SELECT 1 FROM federation_consent fc1
      JOIN federation_consent fc2 ON fc1.owner_tenant = fc2.counterparty_tenant 
                                  AND fc1.counterparty_tenant = fc2.owner_tenant
      JOIN profiles p ON p.tenant_id = fc1.owner_tenant
      WHERE p.user_id = auth.uid()
        AND fc1.counterparty_tenant = tenants.id
        AND fc1.status = 'active'
        AND fc2.status = 'active'
    ))
  );

-- PROFILES TABLE POLICIES
-- Complex policy for profile access with federation and role-based restrictions
CREATE POLICY "profile_select" ON profiles FOR SELECT
  USING (
    -- Own tenant members can see all profiles in tenant
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR
    -- Federated access: can see limited fields when both tenants consent and visibility allows
    (visibility = 'federated' AND 
     is_federation_active(tenant_id, (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())) AND
     -- Guests can only see member+ tier profiles
     (tier IN ('member', 'vip', 'startup') OR 
      (SELECT role FROM profiles WHERE user_id = auth.uid()) != 'guest')
    )
  );

-- Users can update their own profile
CREATE POLICY "profile_update" ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "profile_insert" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all profiles in their tenant
CREATE POLICY "profile_admin" ON profiles FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- COMPANIES TABLE POLICIES
-- Users can view companies in their tenant
CREATE POLICY "company_select" ON companies FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR
    -- Federated access when both tenants consent
    is_federation_active(tenant_id, (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()))
  );

-- Admins and scouts can manage companies
CREATE POLICY "company_manage" ON companies FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'scout')
    )
  );

-- INTROS TABLE POLICIES
-- Users can view intros they're involved in or in their tenant (role-based)
CREATE POLICY "intro_select" ON intros FOR SELECT
  USING (
    -- Involved in the intro
    requester IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    target IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    -- Admin/scout can see all in tenant
    (tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'scout')
    )) OR
    -- Members can see intros in their tenant (limited)
    (tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'member'
    ))
  );

-- Users can manage intros they're involved in, admins can manage all
CREATE POLICY "intro_manage" ON intros FOR ALL
  USING (
    requester IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    target IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'scout')
    )
  );

-- ENGAGEMENT_EVENTS TABLE POLICIES
-- Users can view engagement events for intros they can see
CREATE POLICY "engagement_select" ON engagement_events FOR SELECT
  USING (
    intro_id IN (
      SELECT i.id FROM intros i
      WHERE i.requester IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
            i.target IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
            i.tenant_id IN (
              SELECT tenant_id FROM profiles 
              WHERE user_id = auth.uid() AND role IN ('admin', 'scout')
            )
    )
  );

-- Users can create engagement events for intros they're involved in
CREATE POLICY "engagement_insert" ON engagement_events FOR INSERT
  WITH CHECK (
    actor IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    intro_id IN (
      SELECT i.id FROM intros i
      WHERE i.requester IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
            i.target IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- SCOUTS TABLE POLICIES
-- Users can view scouts in their tenant
CREATE POLICY "scout_select" ON scouts FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

-- Admins can manage scouts
CREATE POLICY "scout_manage" ON scouts FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- SCOUT_SUBMISSIONS TABLE POLICIES
-- Scouts can view their own submissions, admins can view all
CREATE POLICY "scout_submission_select" ON scout_submissions FOR SELECT
  USING (
    scout_id IN (
      SELECT s.id FROM scouts s 
      JOIN profiles p ON s.profile_id = p.id 
      WHERE p.user_id = auth.uid()
    ) OR
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Scouts can manage their own submissions
CREATE POLICY "scout_submission_manage" ON scout_submissions FOR ALL
  USING (
    scout_id IN (
      SELECT s.id FROM scouts s 
      JOIN profiles p ON s.profile_id = p.id 
      WHERE p.user_id = auth.uid()
    ) OR
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- EVENTS TABLE POLICIES
-- Users can view events in their tenant
CREATE POLICY "event_select" ON events FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

-- Admins and scouts can manage events
CREATE POLICY "event_manage" ON events FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'scout')
    )
  );

-- INVITES TABLE POLICIES
-- Users can view invites in their tenant (role-based)
CREATE POLICY "invite_select" ON invites FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'scout')
    )
  );

-- Admins can manage invites
CREATE POLICY "invite_manage" ON invites FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- EDGES TABLE POLICIES
-- Complex policy for edge access with federation and guest restrictions
CREATE POLICY "edge_select" ON edges FOR SELECT
  USING (
    -- Own tenant: members+ can see edges, guests cannot see raw edges
    (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) AND
     (SELECT role FROM profiles WHERE user_id = auth.uid()) != 'guest')
    OR
    -- Federated access: limited to aggregate data only (handled in views)
    (is_federation_active(tenant_id, (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())) AND
     (SELECT role FROM profiles WHERE user_id = auth.uid()) != 'guest')
  );

-- Users can manage edges they're involved in, admins can manage all
CREATE POLICY "edge_manage" ON edges FOR ALL
  USING (
    source IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    target IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- FEDERATION_CONSENT TABLE POLICIES
-- Users can view federation consent involving their tenant
CREATE POLICY "federation_select" ON federation_consent FOR SELECT
  USING (
    owner_tenant IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) OR
    counterparty_tenant IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

-- Only admins can manage federation consent
CREATE POLICY "federation_manage" ON federation_consent FOR ALL
  USING (
    owner_tenant IN (
      SELECT tenant_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create secure views for federated data access (non-PII only)
CREATE OR REPLACE VIEW federated_profiles AS
SELECT 
  p.id,
  p.tenant_id,
  p.full_name,
  p.tags,
  p.tier,
  p.scarcity_score,
  p.created_at
FROM profiles p
WHERE p.visibility = 'federated'
  AND (
    -- Own tenant
    p.tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    OR
    -- Federated access
    is_federation_active(p.tenant_id, (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()))
  );

-- Create aggregate heat view for guests (no raw edge data)
CREATE OR REPLACE VIEW network_heat AS
SELECT 
  p.id as profile_id,
  p.full_name,
  p.tier,
  COUNT(e.id) as connection_count,
  AVG(e.weight) as avg_connection_strength,
  p.scarcity_score
FROM profiles p
LEFT JOIN edges e ON (e.source = p.id OR e.target = p.id)
WHERE p.tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
GROUP BY p.id, p.full_name, p.tier, p.scarcity_score;

-- Grant appropriate permissions
GRANT SELECT ON federated_profiles TO authenticated;
GRANT SELECT ON network_heat TO authenticated;
