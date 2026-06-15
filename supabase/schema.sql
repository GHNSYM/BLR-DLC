-- Banglore DLC — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

-- ─── Tables ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trips (
  id          TEXT PRIMARY KEY DEFAULT 'banglore-dlc-2026',
  name        TEXT NOT NULL DEFAULT 'Banglore DLC',
  xp          INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracks (
  id          TEXT PRIMARY KEY,
  trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  description TEXT NOT NULL,
  gradient    TEXT NOT NULL,
  accent      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS days (
  id          TEXT PRIMARY KEY,
  track_id    TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  label       TEXT NOT NULL,
  subtitle    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id          TEXT PRIMARY KEY,
  day_id      TEXT NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  time        TEXT,
  location    TEXT,
  category    TEXT NOT NULL DEFAULT 'sightseeing',
  tag         TEXT NOT NULL DEFAULT 'together',
  xp          INTEGER NOT NULL DEFAULT 25,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  custom      BOOLEAN NOT NULL DEFAULT FALSE,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE trips ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE days ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_trips_updated_at ON trips;
DROP TRIGGER IF EXISTS set_tracks_updated_at ON tracks;
DROP TRIGGER IF EXISTS set_days_updated_at ON days;
DROP TRIGGER IF EXISTS set_activities_updated_at ON activities;

CREATE TRIGGER set_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_tracks_updated_at BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_days_updated_at BEFORE UPDATE ON days
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_tracks_trip ON tracks(trip_id);
CREATE INDEX IF NOT EXISTS idx_days_trip ON days(trip_id);
CREATE INDEX IF NOT EXISTS idx_days_track ON days(track_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_day ON activities(day_id);

-- ─── Row Level Security (open for shared trip — tighten with auth later) ───

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_trips" ON trips;
DROP POLICY IF EXISTS "anon_all_tracks" ON tracks;
DROP POLICY IF EXISTS "anon_all_days" ON days;
DROP POLICY IF EXISTS "anon_all_activities" ON activities;

CREATE POLICY "anon_all_trips" ON trips FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_tracks" ON tracks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_days" ON days FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_activities" ON activities FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── Storage bucket for activity photos ───────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read activity images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload activity images" ON storage.objects;
DROP POLICY IF EXISTS "Anon update activity images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete activity images" ON storage.objects;

CREATE POLICY "Public read activity images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'activity-images');

CREATE POLICY "Anon upload activity images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'activity-images');

CREATE POLICY "Anon update activity images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'activity-images');

CREATE POLICY "Anon delete activity images"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'activity-images');

-- No Realtime required — the app polls Supabase every few seconds (works on free tier).
