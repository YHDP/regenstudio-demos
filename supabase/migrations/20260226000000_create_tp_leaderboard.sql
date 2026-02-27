-- Triangle Playground leaderboard
-- Stores high scores for constellation and cluster rush modes

CREATE TABLE tp_leaderboard (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nickname TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 20),
  score INTEGER NOT NULL CHECK (score >= 0),
  mode TEXT NOT NULL CHECK (mode IN ('constellation', 'rush')),
  level_reached INTEGER
);

-- Index for fast top-score queries
CREATE INDEX idx_tp_leaderboard_mode_score ON tp_leaderboard (mode, score DESC);

-- RLS: no direct access from anon — all access via edge function
ALTER TABLE tp_leaderboard ENABLE ROW LEVEL SECURITY;

-- Cleanup: delete entries older than 90 days (run via pg_cron)
-- SELECT cron.schedule('cleanup-tp-leaderboard', '0 3 * * *',
--   $$DELETE FROM tp_leaderboard WHERE created_at < now() - interval '90 days'$$
-- );
