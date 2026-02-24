-- Add site column to distinguish www vs demos analytics data
-- Existing data defaults to 'demos' (only demos has been tracked so far)

-- 0. Ensure all tables exist (idempotent — handles missing tables from remote-only migrations)
CREATE TABLE IF NOT EXISTS page_views_daily (
  date         DATE NOT NULL,
  pathname     TEXT NOT NULL,
  event_type   TEXT NOT NULL DEFAULT 'page_view',
  country      TEXT DEFAULT 'XX',
  referrer     TEXT,
  views        INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname, event_type, country, referrer)
);
CREATE INDEX IF NOT EXISTS idx_pvd_date ON page_views_daily(date);

CREATE TABLE IF NOT EXISTS visitor_hashes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_hash TEXT NOT NULL,
  pathname     TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vh_created ON visitor_hashes(created_at);

CREATE TABLE IF NOT EXISTS unique_visitors_daily (
  date         DATE NOT NULL,
  pathname     TEXT NOT NULL,
  uniques      INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname)
);

CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO app_config (key, value)
VALUES ('analytics_daily_salt', md5(random()::text || clock_timestamp()::text))
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS page_events_raw (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_hash   TEXT NOT NULL,
  event_type     TEXT NOT NULL,
  pathname       TEXT NOT NULL DEFAULT '/',
  from_page      TEXT,
  target         TEXT,
  section        TEXT,
  time_on_page_ms INTEGER,
  device_type    TEXT DEFAULT 'desktop',
  browser_family TEXT DEFAULT 'unknown',
  country        TEXT DEFAULT 'XX',
  referrer       TEXT DEFAULT 'direct',
  created_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_per_created ON page_events_raw(created_at);
CREATE INDEX IF NOT EXISTS idx_per_visitor ON page_events_raw(visitor_hash, created_at);

CREATE TABLE IF NOT EXISTS navigation_flows (
  date       DATE NOT NULL,
  from_page  TEXT NOT NULL,
  to_page    TEXT NOT NULL,
  count      INTEGER DEFAULT 0,
  PRIMARY KEY (date, from_page, to_page)
);

CREATE TABLE IF NOT EXISTS time_on_page_daily (
  date     DATE NOT NULL,
  pathname TEXT NOT NULL,
  bucket   TEXT NOT NULL,
  count    INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname, bucket)
);

CREATE TABLE IF NOT EXISTS click_targets_daily (
  date     DATE NOT NULL,
  pathname TEXT NOT NULL,
  target   TEXT NOT NULL,
  section  TEXT NOT NULL DEFAULT '',
  clicks   INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname, target, section)
);

CREATE TABLE IF NOT EXISTS session_depth_daily (
  date         DATE NOT NULL,
  depth_bucket TEXT NOT NULL,
  count        INTEGER DEFAULT 0,
  PRIMARY KEY (date, depth_bucket)
);

CREATE TABLE IF NOT EXISTS entry_exit_daily (
  date       DATE NOT NULL,
  entry_page TEXT NOT NULL,
  exit_page  TEXT NOT NULL,
  count      INTEGER DEFAULT 0,
  PRIMARY KEY (date, entry_page, exit_page)
);

CREATE TABLE IF NOT EXISTS device_daily (
  date           DATE NOT NULL,
  device_type    TEXT NOT NULL,
  browser_family TEXT NOT NULL,
  count          INTEGER DEFAULT 0,
  PRIMARY KEY (date, device_type, browser_family)
);

CREATE TABLE IF NOT EXISTS funnel_daily (
  date         DATE NOT NULL,
  funnel_name  TEXT NOT NULL,
  step_number  INTEGER NOT NULL,
  step_name    TEXT NOT NULL,
  visitors     INTEGER DEFAULT 0,
  PRIMARY KEY (date, funnel_name, step_number)
);

-- Enable RLS on all tables (idempotent)
ALTER TABLE page_views_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE unique_visitors_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_events_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_on_page_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_targets_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_depth_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_exit_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_daily ENABLE ROW LEVEL SECURITY;

-- 1. Add site column to raw events
ALTER TABLE page_events_raw ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';

-- 2. Add site column to all aggregate tables
ALTER TABLE page_views_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE unique_visitors_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE navigation_flows ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE time_on_page_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE click_targets_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE session_depth_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE entry_exit_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE device_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';
ALTER TABLE funnel_daily ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'demos';

-- 3. Drop old primary keys and recreate with site included
-- page_views_daily: (date, pathname, event_type, country, referrer) → add site
ALTER TABLE page_views_daily DROP CONSTRAINT IF EXISTS page_views_daily_pkey;
ALTER TABLE page_views_daily ADD PRIMARY KEY (date, site, pathname, event_type, country, referrer);

-- unique_visitors_daily: (date, pathname) → add site
ALTER TABLE unique_visitors_daily DROP CONSTRAINT IF EXISTS unique_visitors_daily_pkey;
ALTER TABLE unique_visitors_daily ADD PRIMARY KEY (date, site, pathname);

-- navigation_flows: (date, from_page, to_page) → add site
ALTER TABLE navigation_flows DROP CONSTRAINT IF EXISTS navigation_flows_pkey;
ALTER TABLE navigation_flows ADD PRIMARY KEY (date, site, from_page, to_page);

-- time_on_page_daily: (date, pathname, bucket) → add site
ALTER TABLE time_on_page_daily DROP CONSTRAINT IF EXISTS time_on_page_daily_pkey;
ALTER TABLE time_on_page_daily ADD PRIMARY KEY (date, site, pathname, bucket);

-- click_targets_daily: (date, pathname, target, section) → add site
ALTER TABLE click_targets_daily DROP CONSTRAINT IF EXISTS click_targets_daily_pkey;
ALTER TABLE click_targets_daily ADD PRIMARY KEY (date, site, pathname, target, section);

-- session_depth_daily: (date, depth_bucket) → add site
ALTER TABLE session_depth_daily DROP CONSTRAINT IF EXISTS session_depth_daily_pkey;
ALTER TABLE session_depth_daily ADD PRIMARY KEY (date, site, depth_bucket);

-- entry_exit_daily: (date, entry_page, exit_page) → add site
ALTER TABLE entry_exit_daily DROP CONSTRAINT IF EXISTS entry_exit_daily_pkey;
ALTER TABLE entry_exit_daily ADD PRIMARY KEY (date, site, entry_page, exit_page);

-- device_daily: (date, device_type, browser_family) → add site
ALTER TABLE device_daily DROP CONSTRAINT IF EXISTS device_daily_pkey;
ALTER TABLE device_daily ADD PRIMARY KEY (date, site, device_type, browser_family);

-- funnel_daily: (date, funnel_name, step_number) → add site
ALTER TABLE funnel_daily DROP CONSTRAINT IF EXISTS funnel_daily_pkey;
ALTER TABLE funnel_daily ADD PRIMARY KEY (date, site, funnel_name, step_number);

-- 4. Update increment_page_view to accept site parameter
CREATE OR REPLACE FUNCTION increment_page_view(
  p_date DATE,
  p_pathname TEXT,
  p_event_type TEXT,
  p_country TEXT,
  p_referrer TEXT,
  p_site TEXT DEFAULT 'demos'
) RETURNS void AS $$
BEGIN
  INSERT INTO page_views_daily (date, site, pathname, event_type, country, referrer, views)
  VALUES (p_date, p_site, p_pathname, p_event_type, p_country, p_referrer, 1)
  ON CONFLICT (date, site, pathname, event_type, country, referrer)
  DO UPDATE SET views = page_views_daily.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update aggregate_analytics to include site dimension
CREATE OR REPLACE FUNCTION aggregate_analytics() RETURNS void AS $$
DECLARE
  cutoff TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
BEGIN
  -- 4a. Navigation flows: consecutive page_views by same visitor
  INSERT INTO navigation_flows (date, site, from_page, to_page, count)
  SELECT
    e1.created_at::date,
    e1.site,
    e1.pathname,
    e2.pathname,
    COUNT(*)
  FROM page_events_raw e1
  JOIN page_events_raw e2
    ON e1.visitor_hash = e2.visitor_hash
   AND e1.site = e2.site
   AND e2.created_at > e1.created_at
   AND e2.event_type = 'page_view'
  WHERE e1.event_type = 'page_view'
    AND e1.created_at < cutoff
    AND NOT EXISTS (
      SELECT 1 FROM page_events_raw mid
      WHERE mid.visitor_hash = e1.visitor_hash
        AND mid.site = e1.site
        AND mid.event_type = 'page_view'
        AND mid.created_at > e1.created_at
        AND mid.created_at < e2.created_at
    )
  GROUP BY e1.created_at::date, e1.site, e1.pathname, e2.pathname
  ON CONFLICT (date, site, from_page, to_page)
  DO UPDATE SET count = navigation_flows.count + EXCLUDED.count;

  -- 4b. Time on page: bucket time_on_page_ms from page_exit events
  INSERT INTO time_on_page_daily (date, site, pathname, bucket, count)
  SELECT
    created_at::date,
    site,
    pathname,
    CASE
      WHEN time_on_page_ms < 10000  THEN '0-10s'
      WHEN time_on_page_ms < 30000  THEN '10-30s'
      WHEN time_on_page_ms < 60000  THEN '30s-1m'
      WHEN time_on_page_ms < 180000 THEN '1-3m'
      ELSE '3m+'
    END,
    COUNT(*)
  FROM page_events_raw
  WHERE event_type = 'page_exit'
    AND time_on_page_ms IS NOT NULL
    AND created_at < cutoff
  GROUP BY created_at::date, site, pathname,
    CASE
      WHEN time_on_page_ms < 10000  THEN '0-10s'
      WHEN time_on_page_ms < 30000  THEN '10-30s'
      WHEN time_on_page_ms < 60000  THEN '30s-1m'
      WHEN time_on_page_ms < 180000 THEN '1-3m'
      ELSE '3m+'
    END
  ON CONFLICT (date, site, pathname, bucket)
  DO UPDATE SET count = time_on_page_daily.count + EXCLUDED.count;

  -- 4c. Click targets
  INSERT INTO click_targets_daily (date, site, pathname, target, section, clicks)
  SELECT
    created_at::date,
    site,
    pathname,
    COALESCE(target, 'unknown'),
    COALESCE(section, ''),
    COUNT(*)
  FROM page_events_raw
  WHERE event_type = 'click'
    AND created_at < cutoff
  GROUP BY created_at::date, site, pathname, COALESCE(target, 'unknown'), COALESCE(section, '')
  ON CONFLICT (date, site, pathname, target, section)
  DO UPDATE SET clicks = click_targets_daily.clicks + EXCLUDED.clicks;

  -- 4d. Session depth: distinct pathnames per visitor per site
  INSERT INTO session_depth_daily (date, site, depth_bucket, count)
  SELECT
    d::date,
    s,
    CASE
      WHEN depth = 1 THEN '1'
      WHEN depth = 2 THEN '2'
      WHEN depth = 3 THEN '3'
      WHEN depth = 4 THEN '4'
      ELSE '5+'
    END,
    COUNT(*)
  FROM (
    SELECT
      created_at::date AS d,
      site AS s,
      visitor_hash,
      COUNT(DISTINCT pathname) AS depth
    FROM page_events_raw
    WHERE event_type = 'page_view'
      AND created_at < cutoff
    GROUP BY created_at::date, site, visitor_hash
  ) sub
  GROUP BY d, s, CASE
      WHEN depth = 1 THEN '1'
      WHEN depth = 2 THEN '2'
      WHEN depth = 3 THEN '3'
      WHEN depth = 4 THEN '4'
      ELSE '5+'
    END
  ON CONFLICT (date, site, depth_bucket)
  DO UPDATE SET count = session_depth_daily.count + EXCLUDED.count;

  -- 4e. Entry/exit pages: first and last page_view per visitor per day per site
  INSERT INTO entry_exit_daily (date, site, entry_page, exit_page, count)
  SELECT
    d,
    s,
    entry_page,
    exit_page,
    COUNT(*)
  FROM (
    SELECT
      created_at::date AS d,
      site AS s,
      visitor_hash,
      FIRST_VALUE(pathname) OVER w AS entry_page,
      LAST_VALUE(pathname)  OVER (
        PARTITION BY created_at::date, site, visitor_hash
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
      ) AS exit_page
    FROM page_events_raw
    WHERE event_type = 'page_view'
      AND created_at < cutoff
    WINDOW w AS (PARTITION BY created_at::date, site, visitor_hash ORDER BY created_at)
  ) sub
  GROUP BY d, s, entry_page, exit_page
  ON CONFLICT (date, site, entry_page, exit_page)
  DO UPDATE SET count = entry_exit_daily.count + EXCLUDED.count;

  -- 4f. Device / browser: distinct visitors per type per site
  INSERT INTO device_daily (date, site, device_type, browser_family, count)
  SELECT
    created_at::date,
    site,
    COALESCE(device_type, 'desktop'),
    COALESCE(browser_family, 'unknown'),
    COUNT(DISTINCT visitor_hash)
  FROM page_events_raw
  WHERE event_type = 'page_view'
    AND created_at < cutoff
  GROUP BY created_at::date, site, COALESCE(device_type, 'desktop'), COALESCE(browser_family, 'unknown')
  ON CONFLICT (date, site, device_type, browser_family)
  DO UPDATE SET count = device_daily.count + EXCLUDED.count;

  -- 4g. Funnel: reports_purchase (demos-only funnel, but site column still included)
  INSERT INTO funnel_daily (date, site, funnel_name, step_number, step_name, visitors)
  SELECT d, s, 'reports_purchase', step_number, step_name, cnt
  FROM (
    SELECT created_at::date AS d, site AS s, 1 AS step_number, 'Page View' AS step_name,
           COUNT(DISTINCT visitor_hash) AS cnt
    FROM page_events_raw
    WHERE event_type = 'page_view'
      AND pathname LIKE '%/reports%'
      AND created_at < cutoff
    GROUP BY created_at::date, site

    UNION ALL

    SELECT created_at::date, site, 2, 'Preview Click',
           COUNT(DISTINCT visitor_hash)
    FROM page_events_raw
    WHERE event_type = 'preview_click'
      AND created_at < cutoff
    GROUP BY created_at::date, site

    UNION ALL

    SELECT created_at::date, site, 3, 'Card Select',
           COUNT(DISTINCT visitor_hash)
    FROM page_events_raw
    WHERE event_type IN ('card_select_full', 'card_select_family')
      AND created_at < cutoff
    GROUP BY created_at::date, site

    UNION ALL

    SELECT created_at::date, site, 4, 'Purchase Submit',
           COUNT(DISTINCT visitor_hash)
    FROM page_events_raw
    WHERE event_type = 'purchase_submit'
      AND created_at < cutoff
    GROUP BY created_at::date, site
  ) funnel_steps
  ON CONFLICT (date, site, funnel_name, step_number)
  DO UPDATE SET visitors = funnel_daily.visitors + EXCLUDED.visitors;

  -- 4h. Delete processed raw events
  DELETE FROM page_events_raw WHERE created_at < cutoff;

  -- 4i. Clean up visitor hashes (existing function)
  PERFORM cleanup_visitor_hashes();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
