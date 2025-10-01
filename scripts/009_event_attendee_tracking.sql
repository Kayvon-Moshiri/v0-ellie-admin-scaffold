-- Event attendee tracking and check-in system
-- Extends the existing events table with attendee management

-- Add attendee check-ins table
CREATE TABLE IF NOT EXISTS event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  kiosk_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (event_id, profile_id)
);

-- Add event meetings table for tracking at-event connections
CREATE TABLE IF NOT EXISTS event_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  person_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  person_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  initiated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  meeting_type TEXT CHECK (meeting_type IN ('meet_now', 'swap_info', 'scheduled')) DEFAULT 'meet_now',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (event_id, person_a, person_b)
);

-- Add post-event nudges table
CREATE TABLE IF NOT EXISTS event_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  person_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  person_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  nudge_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for event tables
ALTER TABLE event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_nudges ENABLE ROW LEVEL SECURITY;

-- Event check-ins policies
CREATE POLICY "Users can view checkins in their tenant" ON event_checkins FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage checkins for events they can access" ON event_checkins FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Event meetings policies
CREATE POLICY "Users can view meetings in their tenant" ON event_meetings FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create meetings they're involved in" ON event_meetings FOR INSERT
  WITH CHECK (
    person_a IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    person_b IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scout'))
  );

-- Event nudges policies
CREATE POLICY "Users can view nudges in their tenant" ON event_nudges FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage nudges they're involved in" ON event_nudges FOR ALL
  USING (
    person_a IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    person_b IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scout'))
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_checkins_event_id ON event_checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_checkins_profile_id ON event_checkins(profile_id);
CREATE INDEX IF NOT EXISTS idx_event_checkins_tenant_id ON event_checkins(tenant_id);

CREATE INDEX IF NOT EXISTS idx_event_meetings_event_id ON event_meetings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_meetings_tenant_id ON event_meetings(tenant_id);

CREATE INDEX IF NOT EXISTS idx_event_nudges_event_id ON event_nudges(event_id);
CREATE INDEX IF NOT EXISTS idx_event_nudges_status ON event_nudges(status);
CREATE INDEX IF NOT EXISTS idx_event_nudges_tenant_id ON event_nudges(tenant_id);
