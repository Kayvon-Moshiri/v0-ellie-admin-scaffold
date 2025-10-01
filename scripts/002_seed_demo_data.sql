-- Seed demo data for Ellie Admin
-- Create a believable "Demo Tenant" with realistic networking data

-- Insert demo tenant
INSERT INTO tenants (id, name, slug, domain, theme_config, settings) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Elevate Demo Network',
  'demo',
  'demo.elevate.ai',
  '{"primaryColor": "#6366f1", "darkMode": true}',
  '{"allowFederation": true, "autoIntros": true}'
);

-- Insert demo profiles (these will be created after auth users exist)
-- For now, we'll create placeholder UUIDs that match what we'll use in auth

-- Demo startup companies
INSERT INTO startups (tenant_id, name, slug, description, industry, stage, funding_amount, employee_count, location, founded_year, tags, momentum_score) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'NeuralFlow AI',
  'neuralflow-ai',
  'Building the next generation of AI-powered workflow automation for enterprises.',
  'Artificial Intelligence',
  'series-a',
  5000000,
  25,
  'San Francisco, CA',
  2022,
  ARRAY['AI', 'Enterprise', 'Automation', 'SaaS'],
  85
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'GreenTech Solutions',
  'greentech-solutions',
  'Sustainable technology solutions for carbon footprint reduction.',
  'CleanTech',
  'seed',
  2000000,
  12,
  'Austin, TX',
  2023,
  ARRAY['CleanTech', 'Sustainability', 'IoT'],
  72
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'FinanceFlow',
  'financeflow',
  'Modern financial infrastructure for the next generation of fintech companies.',
  'FinTech',
  'series-b',
  15000000,
  45,
  'New York, NY',
  2021,
  ARRAY['FinTech', 'Infrastructure', 'API', 'Banking'],
  91
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'HealthTech Innovations',
  'healthtech-innovations',
  'AI-powered diagnostic tools for early disease detection.',
  'HealthTech',
  'pre-seed',
  500000,
  8,
  'Boston, MA',
  2024,
  ARRAY['HealthTech', 'AI', 'Diagnostics', 'Medical'],
  68
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'SpaceVenture',
  'spaceventure',
  'Commercial space technology and satellite deployment services.',
  'Aerospace',
  'series-a',
  8000000,
  35,
  'Los Angeles, CA',
  2020,
  ARRAY['Space', 'Satellites', 'Technology'],
  79
);

-- Demo events
INSERT INTO events (tenant_id, name, description, event_type, location, venue, start_time, end_time, max_attendees, tags) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'AI Founders Mixer',
  'Exclusive networking event for AI startup founders and investors.',
  'networking',
  'San Francisco, CA',
  'The Battery Club',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
  50,
  ARRAY['AI', 'Founders', 'Networking']
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'FinTech Innovation Summit',
  'Annual summit showcasing the latest in financial technology.',
  'conference',
  'New York, NY',
  'Javits Center',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '16 days',
  500,
  ARRAY['FinTech', 'Innovation', 'Conference']
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Day: Spring 2024',
  'Quarterly demo day featuring our portfolio companies.',
  'demo-day',
  'Austin, TX',
  'Capital Factory',
  NOW() + INTERVAL '21 days',
  NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
  200,
  ARRAY['Demo Day', 'Startups', 'Investors']
);

-- Function to create profile after auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user in demo tenant
  INSERT INTO public.profiles (
    id, 
    tenant_id, 
    email, 
    full_name, 
    role,
    membership_tier
  ) VALUES (
    NEW.id,
    '550e8400-e29b-41d4-a716-446655440000', -- Demo tenant
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    'member',
    'free'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create some sample activities
INSERT INTO activities (tenant_id, user_id, activity_type, entity_type, metadata) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  NULL, -- Will be populated when users are created
  'event',
  'event',
  '{"action": "created", "event_name": "AI Founders Mixer"}'
);
