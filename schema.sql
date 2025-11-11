CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_email text,
  api_key_hash text NOT NULL,
  is_revoked boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  url text,
  referrer text,
  device text,
  ip_address inet,
  user_id text,
  metadata jsonb,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_app_event_time ON events (app_id, event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at);
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin ON events USING gin (metadata);
