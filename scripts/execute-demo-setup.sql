-- Execute the comprehensive demo data setup
-- This will run both the main demo data script and additional enhancements

-- Run the comprehensive demo data first
\i scripts/015_comprehensive_demo_data.sql

-- Then run the additional demo enhancements
\i scripts/run-demo-data.sql

-- Final status check
SELECT 'All demo data setup completed successfully!' as status;
