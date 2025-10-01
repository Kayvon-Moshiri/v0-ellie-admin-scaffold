-- Run the comprehensive demo data script
-- This script will populate the database with realistic demo data for the Ellie Admin system

-- First, run the comprehensive demo data
\i scripts/comprehensive-demo-data.sql

-- Add some additional engagement events for the demo tour
INSERT INTO engagement_events (intro_id, actor, kind, payload, created_at) VALUES
-- Recent activity for Sarah Chen's intro
((SELECT id FROM intros WHERE requester = (SELECT id FROM profiles WHERE email = 'sarah.chen@techstartup.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'sarah.chen@techstartup.com'),
 'note',
 '{"action": "viewed_profile", "target": "alex.rivera@venture.com"}',
 NOW() - INTERVAL '2 hours'),

-- Activity for Michael Thompson's intro
((SELECT id FROM intros WHERE requester = (SELECT id FROM profiles WHERE email = 'michael.thompson@fintech.io') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'michael.thompson@fintech.io'),
 'email',
 '{"action": "sent_followup", "subject": "Following up on our introduction request"}',
 NOW() - INTERVAL '1 day'),

-- Activity for Emily Rodriguez's intro
((SELECT id FROM intros WHERE requester = (SELECT id FROM profiles WHERE email = 'emily.rodriguez@healthtech.co') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'emily.rodriguez@healthtech.co'),
 'meeting',
 '{"action": "scheduled_call", "date": "2024-01-20T15:00:00Z"}',
 NOW() - INTERVAL '3 hours');

-- Update some intro statuses for the demo
UPDATE intros SET 
  status = 'pre_consented',
  updated_at = NOW()
WHERE requester = (SELECT id FROM profiles WHERE email = 'sarah.chen@techstartup.com');

UPDATE intros SET 
  status = 'scheduled',
  scheduled_for = NOW() + INTERVAL '2 days',
  updated_at = NOW()
WHERE requester = (SELECT id FROM profiles WHERE email = 'emily.rodriguez@healthtech.co');

-- Add some recent scout submissions for the heatboard
INSERT INTO scout_submissions (company_id, scout_id, quality, status, notes, created_at) VALUES
((SELECT id FROM companies WHERE name = 'TechFlow AI' LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'david.kim@investor.com'),
 8.5,
 'reviewed',
 'Strong AI/ML team with proven traction in enterprise sales',
 NOW() - INTERVAL '1 day'),

((SELECT id FROM companies WHERE name = 'GreenEnergy Solutions' LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'lisa.wang@cleantech.vc'),
 7.2,
 'pending',
 'Interesting cleantech play, need to validate market size',
 NOW() - INTERVAL '6 hours');

-- Add member interests for the heatboard
INSERT INTO member_interests (member_id, company_id, interest_level, notes, created_at) VALUES
((SELECT id FROM profiles WHERE email = 'alex.rivera@venture.com'),
 (SELECT id FROM companies WHERE name = 'TechFlow AI' LIMIT 1),
 'high',
 'Perfect fit for our AI/ML thesis',
 NOW() - INTERVAL '4 hours'),

((SELECT id FROM profiles WHERE email = 'priya.patel@growth.fund'),
 (SELECT id FROM companies WHERE name = 'GreenEnergy Solutions' LIMIT 1),
 'medium',
 'Interesting but early stage',
 NOW() - INTERVAL '2 hours');

-- Update activity scores to create more realistic heat patterns
UPDATE profiles SET 
  activity_score = CASE 
    WHEN email = 'sarah.chen@techstartup.com' THEN 95
    WHEN email = 'alex.rivera@venture.com' THEN 88
    WHEN email = 'emily.rodriguez@healthtech.co' THEN 82
    WHEN email = 'david.kim@investor.com' THEN 76
    WHEN email = 'michael.thompson@fintech.io' THEN 71
    ELSE activity_score
  END,
  last_active = CASE
    WHEN email IN ('sarah.chen@techstartup.com', 'alex.rivera@venture.com') THEN NOW() - INTERVAL '1 hour'
    WHEN email IN ('emily.rodriguez@healthtech.co', 'david.kim@investor.com') THEN NOW() - INTERVAL '3 hours'
    ELSE last_active
  END;

-- Create some cross-tenant federated connections for the network graph
INSERT INTO federated_connections (local_profile_id, remote_profile_id, remote_tenant_id, connection_type, strength, created_at) VALUES
((SELECT id FROM profiles WHERE email = 'alex.rivera@venture.com'),
 'fed_profile_1',
 'tenant_silicon_valley',
 'professional',
 0.8,
 NOW() - INTERVAL '1 week'),

((SELECT id FROM profiles WHERE email = 'david.kim@investor.com'),
 'fed_profile_2', 
 'tenant_new_york',
 'investment',
 0.9,
 NOW() - INTERVAL '3 days'),

((SELECT id FROM profiles WHERE email = 'lisa.wang@cleantech.vc'),
 'fed_profile_3',
 'tenant_london',
 'advisory',
 0.7,
 NOW() - INTERVAL '5 days');

-- Add some tags for better categorization
UPDATE profiles SET tags = ARRAY['founder', 'ai-ml', 'enterprise'] WHERE email = 'sarah.chen@techstartup.com';
UPDATE profiles SET tags = ARRAY['investor', 'vip', 'series-a'] WHERE email = 'alex.rivera@venture.com';
UPDATE profiles SET tags = ARRAY['founder', 'healthtech', 'b2b'] WHERE email = 'emily.rodriguez@healthtech.co';
UPDATE profiles SET tags = ARRAY['investor', 'fintech', 'growth'] WHERE email = 'david.kim@investor.com';
UPDATE profiles SET tags = ARRAY['founder', 'fintech', 'payments'] WHERE email = 'michael.thompson@fintech.io';

-- Update company tags and stages
UPDATE companies SET 
  tags = ARRAY['ai', 'enterprise', 'saas'],
  stage = 'series-a'
WHERE name = 'TechFlow AI';

UPDATE companies SET 
  tags = ARRAY['cleantech', 'energy', 'b2b'],
  stage = 'seed'
WHERE name = 'GreenEnergy Solutions';

UPDATE companies SET 
  tags = ARRAY['healthtech', 'digital-health', 'b2c'],
  stage = 'pre-seed'
WHERE name = 'HealthTech Innovations';

-- Final verification
SELECT 'Demo data setup complete!' as status;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_intros FROM intros;
SELECT COUNT(*) as total_companies FROM companies;
SELECT COUNT(*) as total_connections FROM connections;
SELECT COUNT(*) as total_engagement_events FROM engagement_events;
