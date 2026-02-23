-- Privacy fixes: salt rotation, data retention, admin password removal
-- Date: 2026-02-24

-- 1. Salt rotation function (call daily to prevent persistent visitor fingerprinting)
CREATE OR REPLACE FUNCTION rotate_analytics_salt() RETURNS void AS $$
BEGIN
  UPDATE app_config
  SET value = encode(gen_random_bytes(32), 'hex')
  WHERE key = 'analytics_daily_salt';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Magic links cleanup (delete expired/used links older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_magic_links() RETURNS void AS $$
BEGIN
  DELETE FROM demo_magic_links
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Contact submissions cleanup (delete older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_contact_submissions() RETURNS void AS $$
BEGIN
  DELETE FROM contact_submissions
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Remove hardcoded admin password hash from app_config
-- Password hash is now read from ADMIN_PASSWORD_HASH env var in the edge function
DELETE FROM app_config WHERE key = 'admin_password_hash';

-- Cron job schedule (must be configured in Supabase dashboard > Database > Extensions > pg_cron):
--   DAILY 00:05 UTC: SELECT rotate_analytics_salt();
--   DAILY 00:10 UTC: SELECT aggregate_analytics();
--   DAILY 00:15 UTC: SELECT cleanup_magic_links();
--   WEEKLY Sunday 01:00 UTC: SELECT cleanup_contact_submissions();
