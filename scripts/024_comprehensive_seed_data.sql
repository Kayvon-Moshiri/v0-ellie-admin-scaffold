-- Comprehensive seed data for Ellie Admin
-- This script populates all tables with realistic demo data

-- Set the demo tenant ID
DO $$
DECLARE
  demo_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM engagement_events WHERE tenant_id = demo_tenant_id;
DELETE FROM activities WHERE tenant_id = demo_tenant_id;
DELETE FROM event_attendees;
DELETE FROM member_interests WHERE tenant_id = demo_tenant_id;
DELETE FROM scout_submissions WHERE tenant_id = demo_tenant_id;
DELETE FROM introductions WHERE tenant_id = demo_tenant_id;
DELETE FROM connections WHERE tenant_id = demo_tenant_id;
DELETE FROM invitations WHERE tenant_id = demo_tenant_id;
DELETE FROM events WHERE tenant_id = demo_tenant_id;
DELETE FROM startups WHERE tenant_id = demo_tenant_id;
DELETE FROM profiles WHERE tenant_id = demo_tenant_id;
DELETE FROM tenants WHERE id = demo_tenant_id;

-- Insert demo tenant
INSERT INTO tenants (id, name, slug, domain, is_federated, settings, theme_config, created_at, updated_at)
VALUES (
  demo_tenant_id,
  'Demo Community',
  'demo',
  'demo.ellie.app',
  false,
  '{"features": ["introductions", "events", "heatboard", "scout_program"]}'::jsonb,
  '{"primaryColor": "#6366f1", "accentColor": "#8b5cf6"}'::jsonb,
  NOW() - INTERVAL '6 months',
  NOW()
);

-- Insert diverse profiles with various statuses and tiers
INSERT INTO profiles (id, tenant_id, user_id, email, full_name, display_name, job_title, company, bio, location, timezone, membership_tier, status, role, activity_score, last_active_at, skills, interests, linkedin_url, twitter_url, avatar_url, ai_recommendation, ai_insights, admin_notes, created_at, updated_at)
VALUES
  -- Active Core Members (High Activity)
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'sarah.chen@techcorp.com', 'Sarah Chen', 'Sarah', 'VP of Engineering', 'TechCorp', 'Building the future of AI infrastructure. Former Google, passionate about developer tools and open source.', 'San Francisco, CA', 'America/Los_Angeles', 'core', 'active', 'member', 95, NOW() - INTERVAL '2 hours', ARRAY['AI/ML', 'Infrastructure', 'Leadership'], ARRAY['Developer Tools', 'Open Source', 'AI Infrastructure'], 'https://linkedin.com/in/sarahchen', 'https://twitter.com/sarahchen', '/avatars/sarah.jpg', 'Strong technical leader with extensive network', 'Highly engaged, frequently introduces others, attends all events', 'Top contributor, consider for advisory board', NOW() - INTERVAL '8 months', NOW() - INTERVAL '2 hours'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'marcus.williams@venturefund.com', 'Marcus Williams', 'Marcus', 'Partner', 'Venture Fund', 'Early-stage investor focused on B2B SaaS and infrastructure. 15+ years in venture, 30+ investments.', 'New York, NY', 'America/New_York', 'core', 'active', 'member', 92, NOW() - INTERVAL '5 hours', ARRAY['Venture Capital', 'B2B SaaS', 'Go-to-Market'], ARRAY['Enterprise Software', 'Fintech', 'Developer Tools'], 'https://linkedin.com/in/marcuswilliams', 'https://twitter.com/marcusvc', '/avatars/marcus.jpg', 'Excellent connector, high-value introductions', 'Active investor, great at pattern matching', 'Key community pillar', NOW() - INTERVAL '10 months', NOW() - INTERVAL '5 hours'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'priya.patel@startup.io', 'Priya Patel', 'Priya', 'Co-Founder & CEO', 'DataFlow AI', 'Building real-time data infrastructure for AI applications. Previously led data platform at Stripe.', 'Austin, TX', 'America/Chicago', 'core', 'active', 'member', 88, NOW() - INTERVAL '1 day', ARRAY['Entrepreneurship', 'Data Engineering', 'Product'], ARRAY['AI/ML', 'Data Infrastructure', 'B2B SaaS'], 'https://linkedin.com/in/priyapatel', 'https://twitter.com/priyabuilds', '/avatars/priya.jpg', 'Rising star founder, great community advocate', 'Regularly shares insights, helps other founders', 'Featured in last newsletter', NOW() - INTERVAL '7 months', NOW() - INTERVAL '1 day'),
  
  -- Active Plus Members (Medium-High Activity)
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'james.rodriguez@cloudscale.com', 'James Rodriguez', 'James', 'Head of Product', 'CloudScale', 'Product leader specializing in developer platforms. Love helping early-stage founders with product strategy.', 'Seattle, WA', 'America/Los_Angeles', 'plus', 'active', 'member', 78, NOW() - INTERVAL '3 days', ARRAY['Product Management', 'Developer Tools', 'Strategy'], ARRAY['Cloud Infrastructure', 'DevOps', 'Product-Led Growth'], 'https://linkedin.com/in/jamesrodriguez', NULL, '/avatars/james.jpg', 'Strong product sense, helpful mentor', 'Participates in office hours, good feedback', NULL, NOW() - INTERVAL '5 months', NOW() - INTERVAL '3 days'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'emily.zhang@designstudio.com', 'Emily Zhang', 'Emily', 'Design Director', 'Design Studio', 'Leading design for enterprise products. Passionate about design systems and accessibility.', 'Los Angeles, CA', 'America/Los_Angeles', 'plus', 'active', 'member', 72, NOW() - INTERVAL '2 days', ARRAY['Product Design', 'Design Systems', 'UX Research'], ARRAY['Enterprise UX', 'Accessibility', 'Design Tools'], 'https://linkedin.com/in/emilyzhang', 'https://twitter.com/emilydesigns', '/avatars/emily.jpg', 'Excellent design perspective, growing network', 'Attended 3 events this quarter', NULL, NOW() - INTERVAL '4 months', NOW() - INTERVAL '2 days'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'alex.kim@securityco.com', 'Alex Kim', 'Alex', 'Security Architect', 'SecurityCo', 'Cybersecurity expert focused on cloud security and compliance. Speaker at major security conferences.', 'Boston, MA', 'America/New_York', 'plus', 'active', 'member', 65, NOW() - INTERVAL '4 days', ARRAY['Cybersecurity', 'Cloud Security', 'Compliance'], ARRAY['Zero Trust', 'Security Tools', 'Enterprise Security'], 'https://linkedin.com/in/alexkim', NULL, '/avatars/alex.jpg', 'Niche expertise, valuable for security-focused startups', 'Responsive to introduction requests', NULL, NOW() - INTERVAL '6 months', NOW() - INTERVAL '4 days'),
  
  -- Active Standard Members (Medium Activity)
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'olivia.brown@marketingpro.com', 'Olivia Brown', 'Olivia', 'VP Marketing', 'MarketingPro', 'B2B marketing leader with expertise in demand gen and content strategy. Former HubSpot.', 'Chicago, IL', 'America/Chicago', 'standard', 'active', 'member', 58, NOW() - INTERVAL '5 days', ARRAY['B2B Marketing', 'Demand Generation', 'Content Strategy'], ARRAY['Marketing Tech', 'Growth', 'Brand'], 'https://linkedin.com/in/oliviabrown', 'https://twitter.com/oliviamarketing', '/avatars/olivia.jpg', 'Strong marketing background, good for GTM advice', 'Occasional event attendance', NULL, NOW() - INTERVAL '3 months', NOW() - INTERVAL '5 days'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'david.lee@fintech.io', 'David Lee', 'David', 'Engineering Manager', 'FinTech Solutions', 'Building payment infrastructure. Interested in connecting with other fintech builders.', 'Miami, FL', 'America/New_York', 'standard', 'active', 'member', 52, NOW() - INTERVAL '1 week', ARRAY['Backend Engineering', 'Payments', 'Distributed Systems'], ARRAY['Fintech', 'Payments', 'Blockchain'], 'https://linkedin.com/in/davidlee', NULL, '/avatars/david.jpg', 'Solid technical background', 'New member, still ramping up', NULL, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 week'),
  
  -- Pending Approvals (Waitlist)
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'sophia.martinez@airesearch.edu', 'Sophia Martinez', 'Sophia', 'Research Scientist', 'AI Research Lab', 'PhD in Machine Learning, researching multimodal AI systems. Looking to connect with AI founders.', 'Cambridge, MA', 'America/New_York', NULL, 'pending_approval', 'member', NULL, NULL, ARRAY['Machine Learning', 'Research', 'Computer Vision'], ARRAY['AI Research', 'Multimodal AI', 'Academic-Industry Bridge'], 'https://linkedin.com/in/sophiamartinez', 'https://twitter.com/sophiaml', '/avatars/sophia.jpg', 'Strong academic background, could add research perspective', 'PhD from MIT, published in top conferences', 'Review for core tier', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'ryan.thompson@growth.co', 'Ryan Thompson', 'Ryan', 'Growth Lead', 'GrowthCo', 'Scaled 3 startups from 0 to $10M ARR. Expert in PLG and viral growth strategies.', 'Denver, CO', 'America/Denver', NULL, 'pending_approval', 'member', NULL, NULL, ARRAY['Growth Marketing', 'Product-Led Growth', 'Analytics'], ARRAY['SaaS Growth', 'PLG', 'Experimentation'], 'https://linkedin.com/in/ryanthompson', NULL, '/avatars/ryan.jpg', 'Impressive growth track record', 'Strong referral from Marcus Williams', 'Fast-track approval', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'maya.johnson@designops.com', 'Maya Johnson', 'Maya', 'DesignOps Manager', 'DesignOps Inc', 'Building design systems and operations at scale. Previously at Airbnb and Figma.', 'Portland, OR', 'America/Los_Angeles', NULL, 'pending_approval', 'member', NULL, NULL, ARRAY['DesignOps', 'Design Systems', 'Process'], ARRAY['Design Tools', 'Team Scaling', 'Operations'], 'https://linkedin.com/in/mayajohnson', 'https://twitter.com/mayadesignops', '/avatars/maya.jpg', 'Unique DesignOps expertise', 'Good fit for design-focused community members', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'chris.anderson@sales.pro', 'Chris Anderson', 'Chris', 'VP Sales', 'SalesPro', 'Enterprise sales leader, 10+ years closing 7-figure deals. Love helping founders with sales strategy.', 'Atlanta, GA', 'America/New_York', NULL, 'pending_approval', 'member', NULL, NULL, ARRAY['Enterprise Sales', 'Sales Strategy', 'Team Building'], ARRAY['B2B Sales', 'Sales Enablement', 'Revenue Operations'], 'https://linkedin.com/in/chrisanderson', NULL, '/avatars/chris.jpg', 'Strong sales background, could help founders', 'Need to verify referral source', 'Schedule intro call', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  -- Scheduled Calls
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'nina.patel@blockchain.io', 'Nina Patel', 'Nina', 'Blockchain Engineer', 'BlockChain Solutions', 'Building decentralized applications. Interested in web3 and crypto infrastructure.', 'San Francisco, CA', 'America/Los_Angeles', NULL, 'scheduled_call', 'member', NULL, NULL, ARRAY['Blockchain', 'Smart Contracts', 'Solidity'], ARRAY['Web3', 'DeFi', 'Crypto Infrastructure'], 'https://linkedin.com/in/ninapatel', 'https://twitter.com/ninabuilds', '/avatars/nina.jpg', 'Interesting web3 angle', 'Call scheduled for next Tuesday', 'Assess community fit', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),
  
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'tom.wilson@analytics.com', 'Tom Wilson', 'Tom', 'Data Scientist', 'Analytics Corp', 'Building predictive models for business intelligence. Former data lead at Uber.', 'San Diego, CA', 'America/Los_Angeles', NULL, 'scheduled_call', 'member', NULL, NULL, ARRAY['Data Science', 'Machine Learning', 'Analytics'], ARRAY['Business Intelligence', 'Predictive Analytics', 'Data Visualization'], 'https://linkedin.com/in/tomwilson', NULL, '/avatars/tom.jpg', 'Strong data background', 'Call scheduled for Friday', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  
  -- Approved (Not yet onboarded)
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'lisa.garcia@mobile.dev', 'Lisa Garcia', 'Lisa', 'Mobile Engineering Lead', 'MobileDev', 'iOS and Android expert. Built mobile apps used by millions. Passionate about mobile-first design.', 'Phoenix, AZ', 'America/Phoenix', 'plus', 'approved', 'member', NULL, NULL, ARRAY['Mobile Development', 'iOS', 'Android'], ARRAY['Mobile Apps', 'Cross-Platform', 'Mobile UX'], 'https://linkedin.com/in/lisagarcia', NULL, '/avatars/lisa.jpg', 'Excellent mobile expertise', 'Approved, waiting for onboarding', 'Send welcome email', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  -- Rejected
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'john.smith@generic.com', 'John Smith', 'John', 'Consultant', 'Consulting Firm', 'General business consultant looking to expand network.', 'Dallas, TX', 'America/Chicago', NULL, 'rejected', 'member', NULL, NULL, ARRAY['Consulting', 'Strategy'], ARRAY['Business', 'Networking'], NULL, NULL, '/avatars/john.jpg', 'Too generic, unclear value add', 'Doesn''t fit community criteria', 'Sent rejection email', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),
  
  -- Inactive Members (Low Activity)
  (gen_random_uuid(), demo_tenant_id, gen_random_uuid(), 'rachel.white@oldstartup.com', 'Rachel White', 'Rachel', 'CTO', 'OldStartup', 'Technical co-founder. Been heads down building product.', 'Nashville, TN', 'America/Chicago', 'standard', 'active', 'member', 15, NOW() - INTERVAL '3 months', ARRAY['Full-Stack', 'Architecture'], ARRAY['Startups', 'Technology'], 'https://linkedin.com/in/rachelwhite', NULL, '/avatars/rachel.jpg', 'Low engagement, may need re-activation', 'Last active 3 months ago', 'Send re-engagement email', NOW() - INTERVAL '11 months', NOW() - INTERVAL '3 months');

-- Insert Startups
INSERT INTO startups (id, tenant_id, name, slug, description, website_url, logo_url, industry, stage, founded_year, employee_count, funding_amount, location, tags, momentum_score, created_at, updated_at)
VALUES
  (gen_random_uuid(), demo_tenant_id, 'DataFlow AI', 'dataflow-ai', 'Real-time data infrastructure for AI applications. Process billions of events per second with sub-millisecond latency.', 'https://dataflow.ai', '/logos/dataflow.png', 'AI Infrastructure', 'Series A', 2023, 25, 15000000, 'Austin, TX', ARRAY['AI/ML', 'Infrastructure', 'Data'], 92, NOW() - INTERVAL '7 months', NOW() - INTERVAL '1 day'),
  
  (gen_random_uuid(), demo_tenant_id, 'SecureAuth', 'secureauth', 'Next-generation authentication platform with built-in fraud detection and compliance.', 'https://secureauth.io', '/logos/secureauth.png', 'Security', 'Seed', 2024, 12, 3000000, 'San Francisco, CA', ARRAY['Security', 'Identity', 'B2B SaaS'], 85, NOW() - INTERVAL '4 months', NOW() - INTERVAL '2 days'),
  
  (gen_random_uuid(), demo_tenant_id, 'CloudScale', 'cloudscale', 'Developer platform for building and scaling cloud-native applications.', 'https://cloudscale.com', '/logos/cloudscale.png', 'Developer Tools', 'Series B', 2021, 85, 45000000, 'Seattle, WA', ARRAY['DevOps', 'Cloud', 'Platform'], 88, NOW() - INTERVAL '2 years', NOW() - INTERVAL '3 days'),
  
  (gen_random_uuid(), demo_tenant_id, 'DesignFlow', 'designflow', 'Collaborative design platform for product teams. Figma meets Notion.', 'https://designflow.com', '/logos/designflow.png', 'Design Tools', 'Series A', 2022, 35, 20000000, 'Los Angeles, CA', ARRAY['Design', 'Collaboration', 'Productivity'], 78, NOW() - INTERVAL '1 year', NOW() - INTERVAL '5 days'),
  
  (gen_random_uuid(), demo_tenant_id, 'PaymentFlow', 'paymentflow', 'Modern payment infrastructure for global businesses. Stripe for the next generation.', 'https://paymentflow.io', '/logos/paymentflow.png', 'Fintech', 'Series A', 2023, 42, 25000000, 'Miami, FL', ARRAY['Payments', 'Fintech', 'Infrastructure'], 90, NOW() - INTERVAL '8 months', NOW() - INTERVAL '1 week'),
  
  (gen_random_uuid(), demo_tenant_id, 'GrowthEngine', 'growthengine', 'AI-powered growth platform for B2B SaaS companies. Automate your entire growth funnel.', 'https://growthengine.co', '/logos/growthengine.png', 'Marketing Tech', 'Seed', 2024, 15, 5000000, 'Denver, CO', ARRAY['Marketing', 'AI', 'B2B SaaS'], 82, NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 days'),
  
  (gen_random_uuid(), demo_tenant_id, 'AnalyticsPro', 'analyticspro', 'Business intelligence platform that turns data into actionable insights.', 'https://analyticspro.com', '/logos/analyticspro.png', 'Analytics', 'Series A', 2022, 38, 18000000, 'San Diego, CA', ARRAY['Analytics', 'BI', 'Data'], 75, NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 week'),
  
  (gen_random_uuid(), demo_tenant_id, 'MobileFirst', 'mobilefirst', 'Cross-platform mobile development framework. Build once, deploy everywhere.', 'https://mobilefirst.dev', '/logos/mobilefirst.png', 'Developer Tools', 'Seed', 2024, 18, 4000000, 'Phoenix, AZ', ARRAY['Mobile', 'Developer Tools', 'Cross-Platform'], 80, NOW() - INTERVAL '5 months', NOW() - INTERVAL '3 days');

-- Insert Events
INSERT INTO events (id, tenant_id, name, description, event_type, location, venue, start_time, end_time, max_attendees, registration_url, tags, created_by, created_at, updated_at)
VALUES
  -- Upcoming Events
  (gen_random_uuid(), demo_tenant_id, 'AI Infrastructure Roundtable', 'Deep dive into building scalable AI infrastructure. Featuring founders from DataFlow AI and CloudScale.', 'roundtable', 'San Francisco, CA', 'The Battery', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '2 hours', 25, 'https://events.ellie.app/ai-roundtable', ARRAY['AI', 'Infrastructure', 'Technical'], (SELECT id FROM profiles WHERE email = 'sarah.chen@techcorp.com' LIMIT 1), NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 day'),
  
  (gen_random_uuid(), demo_tenant_id, 'Founder Office Hours', 'Monthly office hours with experienced founders and investors. Bring your toughest questions.', 'office_hours', 'Virtual', 'Zoom', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 50, 'https://events.ellie.app/office-hours', ARRAY['Founders', 'Mentorship', 'Q&A'], (SELECT id FROM profiles WHERE email = 'marcus.williams@venturefund.com' LIMIT 1), NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 days'),
  
  (gen_random_uuid(), demo_tenant_id, 'Product Design Workshop', 'Hands-on workshop on building design systems for enterprise products.', 'workshop', 'Los Angeles, CA', 'WeWork Arts District', NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '2 weeks' + INTERVAL '3 hours', 30, 'https://events.ellie.app/design-workshop', ARRAY['Design', 'Workshop', 'Hands-on'], (SELECT id FROM profiles WHERE email = 'emily.zhang@designstudio.com' LIMIT 1), NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 days'),
  
  (gen_random_uuid(), demo_tenant_id, 'Community Happy Hour', 'Casual networking over drinks. Meet other community members in NYC.', 'social', 'New York, NY', 'The Dead Rabbit', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 40, 'https://events.ellie.app/nyc-happy-hour', ARRAY['Networking', 'Social', 'NYC'], (SELECT id FROM profiles WHERE email = 'marcus.williams@venturefund.com' LIMIT 1), NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),
  
  -- Past Events
  (gen_random_uuid(), demo_tenant_id, 'Security Best Practices Panel', 'Panel discussion on cloud security and compliance with industry experts.', 'panel', 'Boston, MA', 'Microsoft NERD Center', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks' + INTERVAL '90 minutes', 60, 'https://events.ellie.app/security-panel', ARRAY['Security', 'Panel', 'Enterprise'], (SELECT id FROM profiles WHERE email = 'alex.kim@securityco.com' LIMIT 1), NOW() - INTERVAL '1 month', NOW() - INTERVAL '2 weeks'),
  
  (gen_random_uuid(), demo_tenant_id, 'Growth Marketing Masterclass', 'Learn proven strategies for scaling B2B SaaS from 0 to $10M ARR.', 'workshop', 'Virtual', 'Zoom', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '2 hours', 100, 'https://events.ellie.app/growth-masterclass', ARRAY['Marketing', 'Growth', 'B2B'], (SELECT id FROM profiles WHERE email = 'olivia.brown@marketingpro.com' LIMIT 1), NOW() - INTERVAL '6 weeks', NOW() - INTERVAL '1 month'),
  
  (gen_random_uuid(), demo_tenant_id, 'SF Community Dinner', 'Intimate dinner with 20 community members in San Francisco.', 'dinner', 'San Francisco, CA', 'Quince', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks' + INTERVAL '3 hours', 20, 'https://events.ellie.app/sf-dinner', ARRAY['Networking', 'Dinner', 'SF'], (SELECT id FROM profiles WHERE email = 'sarah.chen@techcorp.com' LIMIT 1), NOW() - INTERVAL '2 months', NOW() - INTERVAL '3 weeks');

-- Insert Event Attendees
INSERT INTO event_attendees (id, event_id, user_id, status, registered_at, attended_at)
SELECT 
  gen_random_uuid(),
  e.id,
  p.id,
  CASE 
    WHEN e.start_time > NOW() THEN 'registered'
    WHEN random() > 0.2 THEN 'attended'
    ELSE 'no_show'
  END,
  e.created_at + INTERVAL '1 day',
  CASE 
    WHEN e.start_time < NOW() AND random() > 0.2 THEN e.start_time + INTERVAL '10 minutes'
    ELSE NULL
  END
FROM events e
CROSS JOIN LATERAL (
  SELECT id FROM profiles 
  WHERE tenant_id = demo_tenant_id 
  AND status = 'active'
  ORDER BY random()
  LIMIT CASE 
    WHEN e.event_type = 'dinner' THEN 15
    WHEN e.event_type = 'roundtable' THEN 20
    ELSE 30
  END
) p;

-- Insert Connections
INSERT INTO connections (id, tenant_id, from_user_id, to_user_id, connection_type, strength, context, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_tenant_id,
  p1.id,
  p2.id,
  CASE (random() * 3)::int
    WHEN 0 THEN 'colleague'
    WHEN 1 THEN 'friend'
    WHEN 2 THEN 'mentor'
    ELSE 'professional'
  END,
  (50 + random() * 50)::int,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Met at community event'
    WHEN 1 THEN 'Worked together previously'
    WHEN 2 THEN 'Introduced through community'
    ELSE 'Connected on LinkedIn'
  END,
  NOW() - (random() * INTERVAL '6 months'),
  NOW() - (random() * INTERVAL '1 month')
FROM profiles p1
CROSS JOIN LATERAL (
  SELECT id FROM profiles p2
  WHERE p2.tenant_id = demo_tenant_id
  AND p2.id != p1.id
  AND p2.status = 'active'
  ORDER BY random()
  LIMIT 3
) p2
WHERE p1.tenant_id = demo_tenant_id
AND p1.status = 'active'
LIMIT 50;

-- Insert Introductions
INSERT INTO introductions (id, tenant_id, requester_id, person_a_id, person_b_id, status, priority, reason, context, ellie_notes, scheduled_for, completed_at, created_at, updated_at)
VALUES
  -- Pending introductions
  (gen_random_uuid(), demo_tenant_id, 
   (SELECT id FROM profiles WHERE email = 'priya.patel@startup.io' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'priya.patel@startup.io' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'marcus.williams@venturefund.com' LIMIT 1),
   'pending', 3, 'Looking for Series A funding', 'Priya is raising Series A and Marcus invests in data infrastructure', 'Strong fit, Marcus has expressed interest in data infra', NOW() + INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  (gen_random_uuid(), demo_tenant_id,
   (SELECT id FROM profiles WHERE email = 'james.rodriguez@cloudscale.com' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'james.rodriguez@cloudscale.com' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'sarah.chen@techcorp.com' LIMIT 1),
   'pending', 2, 'Product strategy advice', 'James wants feedback on developer platform roadmap', 'Sarah has relevant experience from Google', NOW() + INTERVAL '1 week', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  -- Completed introductions
  (gen_random_uuid(), demo_tenant_id,
   (SELECT id FROM profiles WHERE email = 'emily.zhang@designstudio.com' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'emily.zhang@designstudio.com' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'olivia.brown@marketingpro.com' LIMIT 1),
   'completed', 2, 'Design-marketing collaboration', 'Exploring design system for marketing site', 'Great conversation, planning follow-up', NOW() - INTERVAL '1 week', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '5 days'),
  
  (gen_random_uuid(), demo_tenant_id,
   (SELECT id FROM profiles WHERE email = 'alex.kim@securityco.com' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'alex.kim@securityco.com' LIMIT 1),
   (SELECT id FROM profiles WHERE email = 'david.lee@fintech.io' LIMIT 1),
   'completed', 3, 'Security consultation for payments', 'David needs security review for payment system', 'Productive discussion, Alex providing ongoing advice', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 month', NOW() - INTERVAL '2 weeks');

-- Insert Member Interests (linking members to startups)
INSERT INTO member_interests (id, tenant_id, member_id, company_id, interest_level, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_tenant_id,
  p.id,
  s.id,
  CASE (random() * 3)::int
    WHEN 0 THEN 'high'
    WHEN 1 THEN 'medium'
    ELSE 'low'
  END,
  NOW() - (random() * INTERVAL '3 months'),
  NOW() - (random() * INTERVAL '1 week')
FROM profiles p
CROSS JOIN LATERAL (
  SELECT id FROM startups
  WHERE tenant_id = demo_tenant_id
  ORDER BY random()
  LIMIT 2
) s
WHERE p.tenant_id = demo_tenant_id
AND p.status = 'active'
AND p.membership_tier IN ('core', 'plus')
LIMIT 30;

-- Insert Activities
INSERT INTO activities (id, tenant_id, user_id, activity_type, entity_type, entity_id, metadata, created_at)
SELECT 
  gen_random_uuid(),
  demo_tenant_id,
  p.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'event_attended'
    WHEN 1 THEN 'introduction_made'
    WHEN 2 THEN 'profile_updated'
    WHEN 3 THEN 'connection_added'
    ELSE 'content_shared'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'event'
    WHEN 1 THEN 'profile'
    ELSE 'startup'
  END,
  gen_random_uuid(),
  jsonb_build_object(
    'title', 'Activity ' || (random() * 100)::int,
    'description', 'Sample activity description'
  ),
  NOW() - (random() * INTERVAL '2 months')
FROM profiles p
WHERE p.tenant_id = demo_tenant_id
AND p.status = 'active'
LIMIT 100;

-- Insert Engagement Events
INSERT INTO engagement_events (id, tenant_id, actor, event_type, payload, created_at)
SELECT 
  gen_random_uuid(),
  demo_tenant_id,
  p.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'page_view'
    WHEN 1 THEN 'button_click'
    WHEN 2 THEN 'form_submit'
    ELSE 'search'
  END,
  jsonb_build_object(
    'page', CASE (random() * 4)::int
      WHEN 0 THEN '/dashboard'
      WHEN 1 THEN '/heatboard'
      WHEN 2 THEN '/pipeline'
      ELSE '/events'
    END,
    'timestamp', NOW() - (random() * INTERVAL '1 month')
  ),
  NOW() - (random() * INTERVAL '1 month')
FROM profiles p
WHERE p.tenant_id = demo_tenant_id
AND p.status = 'active'
LIMIT 200;

-- Insert Invitations
INSERT INTO invitations (id, tenant_id, email, invited_by, role, status, token, expires_at, created_at, accepted_at)
VALUES
  (gen_random_uuid(), demo_tenant_id, 'potential.member1@example.com', 
   (SELECT id FROM profiles WHERE email = 'sarah.chen@techcorp.com' LIMIT 1),
   'member', 'pending', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days', NULL),
  
  (gen_random_uuid(), demo_tenant_id, 'potential.member2@example.com',
   (SELECT id FROM profiles WHERE email = 'marcus.williams@venturefund.com' LIMIT 1),
   'member', 'pending', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '5 days', NOW() - INTERVAL '1 day', NULL),
  
  (gen_random_uuid(), demo_tenant_id, 'accepted.member@example.com',
   (SELECT id FROM profiles WHERE email = 'priya.patel@startup.io' LIMIT 1),
   'member', 'accepted', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 days');

-- Insert Scout Submissions
INSERT INTO scout_submissions (id, tenant_id, scout_id, company_id, status, quality, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_tenant_id,
  p.id,
  s.id,
  CASE (random() * 3)::int
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    ELSE 'rejected'
  END,
  (60 + random() * 40)::int,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Strong technical team, interesting market'
    WHEN 1 THEN 'Early but promising traction'
    ELSE 'Great founder, needs more validation'
  END,
  NOW() - (random() * INTERVAL '2 months'),
  NOW() - (random() * INTERVAL '1 week')
FROM profiles p
CROSS JOIN LATERAL (
  SELECT id FROM startups
  WHERE tenant_id = demo_tenant_id
  ORDER BY random()
  LIMIT 1
) s
WHERE p.tenant_id = demo_tenant_id
AND p.status = 'active'
AND p.membership_tier = 'core'
LIMIT 15;

END $$;
