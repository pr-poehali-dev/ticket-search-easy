ALTER TABLE airport_overrides
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_airport_overrides_expires ON airport_overrides(expires_at);