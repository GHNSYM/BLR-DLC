export const TRIP_ID = import.meta.env.VITE_TRIP_ID ?? 'banglore-dlc-2026'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const STORAGE_BUCKET = 'activity-images'

/** How often to poll Supabase for your friend's changes (free tier — no Realtime needed) */
export const SYNC_POLL_INTERVAL_MS = 5_000
