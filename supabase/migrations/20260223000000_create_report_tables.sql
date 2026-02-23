-- Report discount codes
CREATE TABLE report_discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO report_discount_codes (code, discount_percent, max_uses)
VALUES ('REGENFREE', 100, NULL);

INSERT INTO report_discount_codes (code, discount_percent, max_uses)
VALUES ('EARLYADOPTER', 80, NULL);

-- Report orders
CREATE TABLE report_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('full_overview', 'product_family')),
  family_letter TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  discount_code TEXT,
  discount_percent INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
  mollie_payment_id TEXT,
  download_token TEXT UNIQUE,
  download_token_expires TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  invoice_number INTEGER,
  buyer_company TEXT,
  buyer_vat_id TEXT,
  buyer_street TEXT,
  buyer_number TEXT,
  buyer_extra TEXT,
  buyer_postal TEXT,
  buyer_city TEXT,
  buyer_country TEXT,
  email_sent BOOLEAN DEFAULT FALSE
);

CREATE SEQUENCE report_invoice_seq START 1;

-- RPC wrapper so edge functions can call nextval via supabase.rpc()
CREATE OR REPLACE FUNCTION nextval_invoice_seq()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$ SELECT nextval('report_invoice_seq')::INTEGER; $$;

CREATE INDEX idx_report_orders_mollie ON report_orders (mollie_payment_id);
CREATE INDEX idx_report_orders_token ON report_orders (download_token);

ALTER TABLE report_discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_orders ENABLE ROW LEVEL SECURITY;

-- Privacy-preserving analytics: aggregate counters (no personal data)
CREATE TABLE page_views_daily (
  date         DATE NOT NULL,
  pathname     TEXT NOT NULL,
  event_type   TEXT NOT NULL DEFAULT 'page_view',
  country      TEXT DEFAULT 'XX',
  referrer     TEXT,
  views        INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname, event_type, country, referrer)
);

CREATE INDEX idx_pvd_date ON page_views_daily(date);

-- Increment-only counter function (called by edge function)
CREATE OR REPLACE FUNCTION increment_page_view(
  p_date DATE,
  p_pathname TEXT,
  p_event_type TEXT,
  p_country TEXT,
  p_referrer TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO page_views_daily (date, pathname, event_type, country, referrer, views)
  VALUES (p_date, p_pathname, p_event_type, COALESCE(p_country, 'XX'), COALESCE(p_referrer, 'direct'), 1)
  ON CONFLICT (date, pathname, event_type, country, referrer)
  DO UPDATE SET views = page_views_daily.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Temporary visitor hashes for unique counting (deleted daily)
CREATE TABLE visitor_hashes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_hash TEXT NOT NULL,
  pathname     TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vh_created ON visitor_hashes(created_at);

-- Daily unique visitor aggregates (persists after raw hashes are deleted)
CREATE TABLE unique_visitors_daily (
  date         DATE NOT NULL,
  pathname     TEXT NOT NULL,
  uniques      INTEGER DEFAULT 0,
  PRIMARY KEY (date, pathname)
);

-- Cleanup function: aggregate uniques then delete raw hashes (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_visitor_hashes() RETURNS void AS $$
BEGIN
  INSERT INTO unique_visitors_daily (date, pathname, uniques)
  SELECT
    created_at::date,
    pathname,
    COUNT(DISTINCT visitor_hash)
  FROM visitor_hashes
  WHERE created_at < NOW() - INTERVAL '24 hours'
  GROUP BY created_at::date, pathname
  ON CONFLICT (date, pathname)
  DO UPDATE SET uniques = EXCLUDED.uniques;

  DELETE FROM visitor_hashes WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily salt for visitor hashing (rotated by cron)
CREATE TABLE app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_config (key, value)
VALUES ('analytics_daily_salt', encode(gen_random_bytes(32), 'hex'));

ALTER TABLE page_views_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE unique_visitors_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
