CREATE TABLE IF NOT EXISTS airport_overrides (
  id SERIAL PRIMARY KEY,
  airport TEXT NOT NULL,
  city TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('add', 'remove')),
  restricted_at TIMESTAMPTZ,
  note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_airport_overrides_airport ON airport_overrides(airport);
CREATE INDEX IF NOT EXISTS idx_airport_overrides_created ON airport_overrides(created_at DESC);