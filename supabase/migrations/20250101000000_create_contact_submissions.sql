CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  email TEXT NOT NULL,
  organization TEXT,
  message TEXT,
  source TEXT NOT NULL,
  demo_id TEXT,
  page_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
-- No anon access needed — only Edge Function writes via service_role key
