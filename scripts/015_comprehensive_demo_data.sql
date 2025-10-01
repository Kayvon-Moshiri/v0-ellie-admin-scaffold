-- Comprehensive Demo Data & Realistic Activity Patterns
-- Creates believable networking scenarios with bursty weeks, quiet periods, and mixed tiers

-- Clear existing demo data first
DELETE FROM engagement_events WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM edges WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM intros WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM scout_submissions WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM member_interests WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM event_attendees WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM profiles WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM companies WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM events WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert realistic demo profiles with mixed tiers and diverse backgrounds
INSERT INTO profiles (id, tenant_id, full_name, email, role, tier, offers, asks, tags, scarcity_score, visibility) VALUES
-- VIP Tier (High-value connectors)
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'Sarah Chen', 'sarah@elevate.demo', 'member', 'vip', 
 '{"expertise": ["AI/ML Strategy", "Product Leadership", "Series A-B Fundraising"], "connections": ["Top-tier VCs", "AI Founders", "Enterprise CTOs"]}',
 '{"seeking": ["Technical Co-founders", "AI Talent", "Strategic Partnerships"], "interests": ["Computer Vision", "NLP", "Enterprise AI"]}',
 ARRAY['AI', 'Product', 'Leadership', 'Fundraising'], 9.2, 'members'),

('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'Marcus Rodriguez', 'marcus@elevate.demo', 'member', 'vip',
 '{"expertise": ["FinTech Innovation", "Regulatory Strategy", "Growth Marketing"], "connections": ["Banking Executives", "Regulatory Bodies", "FinTech Investors"]}',
 '{"seeking": ["Compliance Experts", "Banking Partnerships", "International Expansion"], "interests": ["DeFi", "RegTech", "Payment Infrastructure"]}',
 ARRAY['FinTech', 'Compliance', 'Growth', 'Banking'], 8.7, 'members'),

-- Member Tier (Active networkers)
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'Emily Watson', 'emily@elevate.demo', 'member', 'member',
 '{"expertise": ["UX Design", "Design Systems", "User Research"], "connections": ["Design Leaders", "Product Teams", "Creative Agencies"]}',
 '{"seeking": ["Design Mentorship", "Product Opportunities", "Design Tools"], "interests": ["Design Systems", "Accessibility", "Design Ops"]}',
 ARRAY['Design', 'UX', 'Product', 'Research'], 7.3, 'members'),

('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', 'David Kim', 'david@elevate.demo', 'member', 'member',
 '{"expertise": ["Backend Engineering", "Cloud Architecture", "DevOps"], "connections": ["Engineering Teams", "Cloud Providers", "DevOps Communities"]}',
 '{"seeking": ["Technical Leadership", "Architecture Reviews", "Scaling Challenges"], "interests": ["Kubernetes", "Microservices", "Observability"]}',
 ARRAY['Engineering', 'Cloud', 'DevOps', 'Architecture'], 6.8, 'members'),

('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440000', 'Lisa Park', 'lisa@elevate.demo', 'member', 'member',
 '{"expertise": ["Sales Strategy", "Customer Success", "Go-to-Market"], "connections": ["Sales Leaders", "Customer Success Teams", "Revenue Operations"]}',
 '{"seeking": ["Sales Talent", "Customer Insights", "Market Expansion"], "interests": ["SaaS Sales", "Customer Experience", "Revenue Growth"]}',
 ARRAY['Sales', 'Customer Success', 'GTM', 'Revenue'], 7.1, 'members'),

-- Startup Tier (Founders seeking connections)
('66666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440000', 'Alex Thompson', 'alex@elevate.demo', 'member', 'startup',
 '{"expertise": ["Climate Tech", "Hardware Development", "Sustainability"], "connections": ["Climate Investors", "Hardware Engineers", "Sustainability Experts"]}',
 '{"seeking": ["Climate Investors", "Technical Advisors", "Pilot Customers"], "interests": ["Carbon Capture", "Renewable Energy", "Circular Economy"]}',
 ARRAY['ClimaTech', 'Hardware', 'Sustainability', 'Founder'], 5.9, 'members'),

('77777777-7777-7777-7777-777777777777', '550e8400-e29b-41d4-a716-446655440000', 'Maya Patel', 'maya@elevate.demo', 'member', 'startup',
 '{"expertise": ["HealthTech", "Medical Devices", "Regulatory Affairs"], "connections": ["Healthcare Professionals", "Medical Device Companies", "Health Investors"]}',
 '{"seeking": ["Healthcare Partnerships", "Regulatory Guidance", "Clinical Validation"], "interests": ["Digital Health", "Medical AI", "Patient Care"]}',
 ARRAY['HealthTech', 'Medical', 'Regulatory', 'Founder'], 6.2, 'members'),

-- Guest Tier (New members, limited access)
('88888888-8888-8888-8888-888888888888', '550e8400-e29b-41d4-a716-446655440000', 'Jordan Lee', 'jordan@elevate.demo', 'member', 'guest',
 '{"expertise": ["Marketing", "Content Strategy", "Brand Building"], "connections": ["Marketing Teams", "Content Creators", "Brand Agencies"]}',
 '{"seeking": ["Marketing Opportunities", "Brand Partnerships", "Content Collaboration"], "interests": ["Digital Marketing", "Brand Strategy", "Content Marketing"]}',
 ARRAY['Marketing', 'Content', 'Brand', 'Strategy'], 4.1, 'members'),

('99999999-9999-9999-9999-999999999999', '550e8400-e29b-41d4-a716-446655440000', 'Sam Wilson', 'sam@elevate.demo', 'member', 'guest',
 '{"expertise": ["Data Science", "Analytics", "Machine Learning"], "connections": ["Data Teams", "Analytics Platforms", "ML Engineers"]}',
 '{"seeking": ["Data Science Roles", "ML Projects", "Analytics Tools"], "interests": ["Deep Learning", "Data Visualization", "Predictive Analytics"]}',
 ARRAY['Data Science', 'Analytics', 'ML', 'Engineering'], 3.8, 'members'),

-- Scout
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440000', 'Rachel Green', 'rachel@elevate.demo', 'scout', 'member',
 '{"expertise": ["Deal Sourcing", "Due Diligence", "Market Research"], "connections": ["Startup Ecosystem", "Investors", "Industry Experts"]}',
 '{"seeking": ["Quality Startups", "Market Intelligence", "Investment Opportunities"], "interests": ["Early Stage", "B2B SaaS", "Deep Tech"]}',
 ARRAY['Scout', 'Sourcing', 'Research', 'Investments'], 7.8, 'members');

-- Insert hot startups with realistic traction data
INSERT INTO companies (id, tenant_id, name, sector, stage, traction, asks, tags) VALUES
('c1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'NeuralFlow AI', 'Artificial Intelligence', 'series-a',
 '{"revenue": "$2.5M ARR", "growth": "15% MoM", "customers": 45, "team_size": 28, "funding_raised": "$5M", "runway": "18 months"}',
 '{"seeking": ["Enterprise Sales", "Technical Talent", "Strategic Partnerships"], "priorities": ["Product-Market Fit", "Team Scaling", "International Expansion"]}',
 ARRAY['AI', 'Enterprise', 'SaaS', 'Hot']),

('c2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'GreenTech Solutions', 'CleanTech', 'seed',
 '{"revenue": "$500K ARR", "growth": "25% MoM", "customers": 12, "team_size": 15, "funding_raised": "$2M", "runway": "24 months"}',
 '{"seeking": ["Climate Investors", "Pilot Customers", "Technical Advisors"], "priorities": ["Product Development", "Market Validation", "Team Building"]}',
 ARRAY['CleanTech', 'Sustainability', 'B2B', 'Hot']),

('c3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'FinanceFlow', 'FinTech', 'series-b',
 '{"revenue": "$8M ARR", "growth": "8% MoM", "customers": 150, "team_size": 65, "funding_raised": "$15M", "runway": "30 months"}',
 '{"seeking": ["Banking Partnerships", "Regulatory Expertise", "International Markets"], "priorities": ["Compliance", "Scale Operations", "Market Expansion"]}',
 ARRAY['FinTech', 'B2B', 'Infrastructure', 'Scaling']);

-- Insert realistic events with mixed attendance
INSERT INTO events (id, tenant_id, name, starts_at, ends_at, location, roster) VALUES
('e1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'AI Founders Mixer', 
 NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'San Francisco, CA',
 '{"max_attendees": 50, "current_attendees": 32, "waitlist": 8, "vip_attendees": 12}'),

('e2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'FinTech Innovation Summit',
 NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days', 'New York, NY',
 '{"max_attendees": 500, "current_attendees": 387, "waitlist": 45, "vip_attendees": 28}'),

('e3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'Demo Day: Spring 2024',
 NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '4 hours', 'Austin, TX',
 '{"max_attendees": 200, "current_attendees": 156, "waitlist": 23, "vip_attendees": 18}');

-- Create realistic network edges with varying weights (bursty activity patterns)
INSERT INTO edges (tenant_id, source, target, weight, kind, last_event_at) VALUES
-- High-activity connections (recent burst)
('550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 8.5, 'intro', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 7.2, 'meeting', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 6.8, 'intro', NOW() - INTERVAL '3 days'),

-- Medium-activity connections (steady engagement)
('550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 5.4, 'message', NOW() - INTERVAL '1 week'),
('550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 4.9, 'meeting', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440000', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 4.2, 'intro', NOW() - INTERVAL '10 days'),

-- Low-activity connections (quiet periods)
('550e8400-e29b-41d4-a716-446655440000', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 2.1, 'message', NOW() - INTERVAL '3 weeks'),
('550e8400-e29b-41d4-a716-446655440000', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 1.8, 'followup', NOW() - INTERVAL '1 month'),
('550e8400-e29b-41d4-a716-446655440000', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', 1.2, 'message', NOW() - INTERVAL '6 weeks');

-- Insert sample introductions in various pipeline stages
INSERT INTO intros (id, tenant_id, requester, target, context, status, fit_score, fatigue_penalty, priority_score, computed_priority, priority_factors, routing_decision, scheduled_for) VALUES
-- High-priority direct introductions
('i1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
 'Sarah would love to connect with Marcus about AI applications in FinTech. Both are working on enterprise solutions and could benefit from sharing insights on regulatory challenges in AI deployment.',
 'scheduled', 9.2, 0.1, 8.8, 8.8, '{"tier_bonus": 2.0, "fit_score": 9.2, "scarcity_bonus": 1.5, "fatigue_penalty": -0.1}', 'direct', NOW() + INTERVAL '3 days'),

('i2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000',
 '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
 'Emily is looking for product leadership mentorship and Sarah has extensive experience scaling AI products. This could be a valuable connection for both.',
 'pre_consented', 8.1, 0.0, 8.1, 8.1, '{"tier_bonus": 1.5, "fit_score": 8.1, "scarcity_bonus": 1.0, "fatigue_penalty": 0.0}', 'direct'),

-- Medium-priority introductions
('i3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000',
 '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555',
 'David is building cloud infrastructure for a new SaaS product and Lisa has experience with go-to-market strategies for technical products.',
 'requested', 6.8, 0.2, 6.4, 6.4, '{"tier_bonus": 0.5, "fit_score": 6.8, "scarcity_bonus": 0.3, "fatigue_penalty": -0.2}', 'direct'),

-- Lower-priority digest introductions
('i4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000',
 '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999',
 'Jordan and Sam are both interested in data-driven marketing and could share insights on analytics tools and strategies.',
 'requested', 4.2, 0.3, 3.7, 3.7, '{"tier_bonus": 0.0, "fit_score": 4.2, "scarcity_bonus": 0.0, "fatigue_penalty": -0.3}', 'digest'),

-- Completed introductions for success metrics
('i5555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440000',
 '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666',
 'Marcus connected Alex with FinTech regulatory experts to help navigate compliance for climate finance products.',
 'completed', 7.5, 0.1, 7.2, 7.2, '{"tier_bonus": 1.0, "fit_score": 7.5, "scarcity_bonus": 0.8, "fatigue_penalty": -0.1}', 'direct');

-- Insert scout submissions with quality ratings
INSERT INTO scout_submissions (tenant_id, scout_id, company_id, quality, notes, status, created_at, rated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM scouts WHERE profile_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1),
 'c1111111-1111-1111-1111-111111111111', 9.2, 
 'Exceptional AI startup with strong product-market fit. Revenue growing 15% MoM with enterprise customers. Team has deep ML expertise.',
 'approved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM scouts WHERE profile_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1),
 'c2222222-2222-2222-2222-222222222222', 8.1,
 'Promising CleanTech startup with innovative approach to carbon capture. Early traction with pilot customers.',
 'approved', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days');

-- Insert member interests for startup heat calculation
INSERT INTO member_interests (tenant_id, member_id, company_id, interest_level, notes) VALUES
('550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'high', 'Interested in AI partnership opportunities'),
('550e8400-e29b-41d4-a716-446655440000', '22222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'high', 'Potential FinTech collaboration'),
('550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'medium', 'UX design consultation opportunity'),
('550e8400-e29b-41d4-a716-446655440000', '66666666-6666-6666-6666-666666666666', 'c2222222-2222-2222-2222-222222222222', 'high', 'Climate tech synergies');

-- Create realistic engagement events with bursty patterns
INSERT INTO engagement_events (tenant_id, intro_id, actor, kind, payload) VALUES
-- Recent burst of activity (last week)
('550e8400-e29b-41d4-a716-446655440000', 'i1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'view', '{"action": "viewed_intro", "timestamp": "recent"}'),
('550e8400-e29b-41d4-a716-446655440000', 'i1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accept', '{"action": "accepted_intro", "response_time": "2h"}'),
('550e8400-e29b-41d4-a716-446655440000', 'i1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'meet', '{"action": "scheduled_meeting", "platform": "zoom"}'),

-- Steady activity (past 2 weeks)
('550e8400-e29b-41d4-a716-446655440000', 'i2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'view', '{"action": "viewed_intro"}'),
('550e8400-e29b-41d4-a716-446655440000', 'i2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'reply', '{"action": "replied_to_intro"}'),

-- Quiet period activity (older)
('550e8400-e29b-41d4-a716-446655440000', 'i5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'meet', '{"action": "completed_intro", "outcome": "successful"}');

-- Create scouts table entry for the scout profile
INSERT INTO scouts (tenant_id, profile_id) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Refresh materialized views to populate heat data
REFRESH MATERIALIZED VIEW vw_people_heat;
REFRESH MATERIALIZED VIEW vw_startup_heat;
