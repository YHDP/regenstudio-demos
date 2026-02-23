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
  buyer_address TEXT
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
