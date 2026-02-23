-- ============================================================
-- Extended privacy-preserving analytics
-- Raw events kept max 24h; only aggregates persist
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Raw events table (24h TTL — deleted by aggregate_analytics)
CREATE TABLE page_events_raw (
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
  referrer       TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_per_created ON page_events_raw(created_at);
CREATE INDEX idx_per_visitor ON page_events_raw(visitor_hash, created_at);

ALTER TABLE page_events_raw ENABLE ROW LEVEL SECURITY;

-- 2. Aggregate tables (persistent, no personal data)

CREATE TABLE navigation_flows (
  date      DATE NOT NULL,
  from_page TEXT NOT NULL,
  to_page   TEXT NOT NULL,
  count     INTEGER DEFAULT 0,
  PRIMARY KEY (date, from_page, to_page)
);
ALTER TABLE navigation_flows ENABLE ROW LEVEL SECURITY;

CREATE TABLE time_on_page_daily (
  date     DATE NOT NULL,
  pathname TEXT NOT NULL,
  bucket   TEXT NOT NULL,  -- '0-10s','10-30s','30s-1m','1-3m','3m+'
  count    INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname, bucket)
);
ALTER TABLE time_on_page_daily ENABLE ROW LEVEL SECURITY;

CREATE TABLE click_targets_daily (
  date     DATE NOT NULL,
  pathname TEXT NOT NULL,
  target   TEXT NOT NULL,
  section  TEXT DEFAULT '',
  clicks   INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname, target, section)
);
ALTER TABLE click_targets_daily ENABLE ROW LEVEL SECURITY;

CREATE TABLE session_depth_daily (
  date         DATE NOT NULL,
  depth_bucket TEXT NOT NULL,  -- '1','2','3','4','5+'
  count        INTEGER DEFAULT 0,
  PRIMARY KEY (date, depth_bucket)
);
ALTER TABLE session_depth_daily ENABLE ROW LEVEL SECURITY;

CREATE TABLE entry_exit_daily (
  date       DATE NOT NULL,
  entry_page TEXT NOT NULL,
  exit_page  TEXT NOT NULL,
  count      INTEGER DEFAULT 0,
  PRIMARY KEY (date, entry_page, exit_page)
);
ALTER TABLE entry_exit_daily ENABLE ROW LEVEL SECURITY;

CREATE TABLE device_daily (
  date           DATE NOT NULL,
  device_type    TEXT NOT NULL,
  browser_family TEXT NOT NULL,
  count          INTEGER DEFAULT 0,
  PRIMARY KEY (date, device_type, browser_family)
);
ALTER TABLE device_daily ENABLE ROW LEVEL SECURITY;

CREATE TABLE funnel_daily (
  date        DATE NOT NULL,
  funnel_name TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  step_name   TEXT NOT NULL,
  visitors    INTEGER DEFAULT 0,
  PRIMARY KEY (date, funnel_name, step_number)
);
ALTER TABLE funnel_daily ENABLE ROW LEVEL SECURITY;

-- Ensure app_config exists (created in 20260223000000, but may be missing)
CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 3. Admin password hash — removed, now set via ADMIN_PASSWORD_HASH env var
-- (see privacy_fixes migration + updated admin-analytics edge function)

-- 4. Aggregation function
CREATE OR REPLACE FUNCTION aggregate_analytics() RETURNS void AS $$
DECLARE
  cutoff TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
BEGIN
  -- 4a. Navigation flows: consecutive page_views by same visitor
  INSERT INTO navigation_flows (date, from_page, to_page, count)
  SELECT
    e1.created_at::date,
    e1.pathname,
    e2.pathname,
    COUNT(*)
  FROM page_events_raw e1
  JOIN page_events_raw e2
    ON e1.visitor_hash = e2.visitor_hash
   AND e2.created_at > e1.created_at
   AND e2.event_type = 'page_view'
  WHERE e1.event_type = 'page_view'
    AND e1.created_at < cutoff
    AND NOT EXISTS (
      SELECT 1 FROM page_events_raw mid
      WHERE mid.visitor_hash = e1.visitor_hash
        AND mid.event_type = 'page_view'
        AND mid.created_at > e1.created_at
        AND mid.created_at < e2.created_at
    )
  GROUP BY e1.created_at::date, e1.pathname, e2.pathname
  ON CONFLICT (date, from_page, to_page)
  DO UPDATE SET count = navigation_flows.count + EXCLUDED.count;

  -- 4b. Time on page: bucket time_on_page_ms from page_exit events
  INSERT INTO time_on_page_daily (date, pathname, bucket, count)
  SELECT
    created_at::date,
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
  GROUP BY created_at::date, pathname,
    CASE
      WHEN time_on_page_ms < 10000  THEN '0-10s'
      WHEN time_on_page_ms < 30000  THEN '10-30s'
      WHEN time_on_page_ms < 60000  THEN '30s-1m'
      WHEN time_on_page_ms < 180000 THEN '1-3m'
      ELSE '3m+'
    END
  ON CONFLICT (date, pathname, bucket)
  DO UPDATE SET count = time_on_page_daily.count + EXCLUDED.count;

  -- 4c. Click targets
  INSERT INTO click_targets_daily (date, pathname, target, section, clicks)
  SELECT
    created_at::date,
    pathname,
    COALESCE(target, 'unknown'),
    COALESCE(section, ''),
    COUNT(*)
  FROM page_events_raw
  WHERE event_type = 'click'
    AND created_at < cutoff
  GROUP BY created_at::date, pathname, COALESCE(target, 'unknown'), COALESCE(section, '')
  ON CONFLICT (date, pathname, target, section)
  DO UPDATE SET clicks = click_targets_daily.clicks + EXCLUDED.clicks;

  -- 4d. Session depth: distinct pathnames per visitor
  INSERT INTO session_depth_daily (date, depth_bucket, count)
  SELECT
    d::date,
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
      visitor_hash,
      COUNT(DISTINCT pathname) AS depth
    FROM page_events_raw
    WHERE event_type = 'page_view'
      AND created_at < cutoff
    GROUP BY created_at::date, visitor_hash
  ) sub
  GROUP BY d, CASE
      WHEN depth = 1 THEN '1'
      WHEN depth = 2 THEN '2'
      WHEN depth = 3 THEN '3'
      WHEN depth = 4 THEN '4'
      ELSE '5+'
    END
  ON CONFLICT (date, depth_bucket)
  DO UPDATE SET count = session_depth_daily.count + EXCLUDED.count;

  -- 4e. Entry/exit pages: first and last page_view per visitor per day
  INSERT INTO entry_exit_daily (date, entry_page, exit_page, count)
  SELECT
    d,
    entry_page,
    exit_page,
    COUNT(*)
  FROM (
    SELECT
      created_at::date AS d,
      visitor_hash,
      FIRST_VALUE(pathname) OVER w AS entry_page,
      LAST_VALUE(pathname)  OVER (
        PARTITION BY created_at::date, visitor_hash
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
      ) AS exit_page
    FROM page_events_raw
    WHERE event_type = 'page_view'
      AND created_at < cutoff
    WINDOW w AS (PARTITION BY created_at::date, visitor_hash ORDER BY created_at)
  ) sub
  GROUP BY d, entry_page, exit_page
  ON CONFLICT (date, entry_page, exit_page)
  DO UPDATE SET count = entry_exit_daily.count + EXCLUDED.count;

  -- 4f. Device / browser: distinct visitors per type
  INSERT INTO device_daily (date, device_type, browser_family, count)
  SELECT
    created_at::date,
    COALESCE(device_type, 'desktop'),
    COALESCE(browser_family, 'unknown'),
    COUNT(DISTINCT visitor_hash)
  FROM page_events_raw
  WHERE event_type = 'page_view'
    AND created_at < cutoff
  GROUP BY created_at::date, COALESCE(device_type, 'desktop'), COALESCE(browser_family, 'unknown')
  ON CONFLICT (date, device_type, browser_family)
  DO UPDATE SET count = device_daily.count + EXCLUDED.count;

  -- 4g. Funnel: reports_purchase
  --   Step 1: page_view on reports page
  --   Step 2: preview_click
  --   Step 3: card_select (full or family)
  --   Step 4: purchase_submit
  INSERT INTO funnel_daily (date, funnel_name, step_number, step_name, visitors)
  SELECT d, 'reports_purchase', step_number, step_name, cnt
  FROM (
    SELECT created_at::date AS d, 1 AS step_number, 'Page View' AS step_name,
           COUNT(DISTINCT visitor_hash) AS cnt
    FROM page_events_raw
    WHERE event_type = 'page_view'
      AND pathname LIKE '%/reports%'
      AND created_at < cutoff
    GROUP BY created_at::date

    UNION ALL

    SELECT created_at::date, 2, 'Preview Click',
           COUNT(DISTINCT visitor_hash)
    FROM page_events_raw
    WHERE event_type = 'preview_click'
      AND created_at < cutoff
    GROUP BY created_at::date

    UNION ALL

    SELECT created_at::date, 3, 'Card Select',
           COUNT(DISTINCT visitor_hash)
    FROM page_events_raw
    WHERE event_type IN ('card_select_full', 'card_select_family')
      AND created_at < cutoff
    GROUP BY created_at::date

    UNION ALL

    SELECT created_at::date, 4, 'Purchase Submit',
           COUNT(DISTINCT visitor_hash)
    FROM page_events_raw
    WHERE event_type = 'purchase_submit'
      AND created_at < cutoff
    GROUP BY created_at::date
  ) funnel_steps
  ON CONFLICT (date, funnel_name, step_number)
  DO UPDATE SET visitors = funnel_daily.visitors + EXCLUDED.visitors;

  -- 4h. Delete processed raw events
  DELETE FROM page_events_raw WHERE created_at < cutoff;

  -- 4i. Clean up visitor hashes (existing function)
  PERFORM cleanup_visitor_hashes();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
