CREATE TABLE demo_magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  email TEXT NOT NULL,
  demo_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  session_ip TEXT
);

CREATE INDEX idx_magic_links_hash ON demo_magic_links (token_hash) WHERE used_at IS NULL;
CREATE INDEX idx_magic_links_email ON demo_magic_links (email);

ALTER TABLE demo_magic_links ENABLE ROW LEVEL SECURITY;
-- No anon policies — all access via service_role in edge functions
