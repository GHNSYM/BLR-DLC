import { motion } from 'framer-motion'
import { AlertCircle, Cloud, CloudOff, Loader2, RefreshCw } from 'lucide-react'
import { isSupabaseConfigured, SYNC_POLL_INTERVAL_MS } from '../lib/config'

interface SyncBannerProps {
  loading: boolean
  synced: boolean
  syncing: boolean
  useDb: boolean
  error: string | null
  onRefresh: () => void
  onDismissError: () => void
}

export function SyncBanner({
  loading,
  synced,
  syncing,
  useDb,
  error,
  onRefresh,
  onDismissError,
}: SyncBannerProps) {
  const pollSeconds = SYNC_POLL_INTERVAL_MS / 1000

  if (!isSupabaseConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300"
      >
        <CloudOff className="h-4 w-4 shrink-0" />
        <span>
          Offline mode — copy <code className="rounded bg-black/10 px-1 dark:bg-white/10">.env.example</code> to{' '}
          <code className="rounded bg-black/10 px-1 dark:bg-white/10">.env</code> and add your Supabase keys to sync with your friend.
        </span>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-600 dark:text-red-300"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
        <button onClick={onDismissError} className="shrink-0 underline hover:no-underline">
          Dismiss
        </button>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs text-fg-muted"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading trip from Supabase…</span>
      </motion.div>
    )
  }

  if (useDb && synced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-300"
      >
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 shrink-0" />
          <span>
            Cloud sync on — auto-refreshes every {pollSeconds}s (no Realtime needed on free tier).
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={syncing}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/30 px-2 py-1 font-medium transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
          Sync now
        </button>
      </motion.div>
    )
  }

  return null
}
