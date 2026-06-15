import { motion } from 'framer-motion'
import { Bell, BellOff, Cloud, CloudOff, Compass, Loader2, Pencil, RefreshCw, Sparkles } from 'lucide-react'
import { getLevel } from '../data/game'
import { isSupabaseConfigured, SYNC_POLL_INTERVAL_MS } from '../lib/config'
import { ThemeToggle } from './ThemeToggle'
import type { Theme } from '../hooks/useTheme'
import type { Trip } from '../types'
import type { NotificationPermissionState } from '../lib/notifications'

interface HeaderProps {
  trip: Trip | null
  xp: number
  completed: number
  total: number
  theme: Theme
  onToggleTheme: () => void
  notificationPermission: NotificationPermissionState
  onEnableNotifications: () => void
  onEditTrip?: () => void
  // Sync props (previously SyncBanner)
  loading: boolean
  synced: boolean
  syncing: boolean
  useDb: boolean
  syncError: string | null
  onRefresh: () => void
  onDismissSyncError: () => void
}

export function Header({
  trip,
  xp,
  completed,
  total,
  theme,
  onToggleTheme,
  notificationPermission,
  onEnableNotifications,
  onEditTrip,
  loading,
  synced,
  syncing,
  useDb,
  syncError,
  onRefresh,
  onDismissSyncError,
}: HeaderProps) {
  const { level, progress } = getLevel(xp)
  const notificationsOn = notificationPermission === 'granted'
  const notificationsBlocked = notificationPermission === 'denied'
  const notificationLabel = notificationsOn
    ? 'Alerts on'
    : notificationsBlocked
      ? 'Alerts blocked'
      : 'Enable alerts'

  const pollSeconds = SYNC_POLL_INTERVAL_MS / 1000

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel relative overflow-hidden rounded-3xl p-6"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full ambient-purple blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full ambient-orange blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: title + sync status */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Compass className="h-7 w-7" />
          </div>
          <div>
            <p className="accent-label text-xs font-bold uppercase tracking-[0.2em]">Adventure Map</p>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                <span className="shimmer-text">{trip?.name ?? 'Banglore DLC'}</span>
              </h1>
              {trip && onEditTrip && (
                <button
                  onClick={onEditTrip}
                  className="rounded-lg p-1.5 text-fg-muted hover:bg-accent-soft hover:text-accent"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-fg-muted">Build quests · Roll together · Collect memories</p>

            {/* Sync status pill — sits right below the tagline */}
            <SyncPill
              loading={loading}
              synced={synced}
              syncing={syncing}
              useDb={useDb}
              error={syncError}
              pollSeconds={pollSeconds}
              onRefresh={onRefresh}
              onDismissError={onDismissSyncError}
            />
          </div>
        </div>

        {/* Right: notifications, theme, XP */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onEnableNotifications}
            disabled={notificationsOn || notificationsBlocked || notificationPermission === 'unsupported'}
            title={
              notificationsBlocked
                ? 'Notifications are blocked in your browser settings'
                : notificationPermission === 'unsupported'
                  ? 'This browser does not support notifications'
                  : notificationLabel
            }
            className="btn-ghost flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {notificationsOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            <span className="hidden sm:inline">{notificationLabel}</span>
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <div className="quest-card rounded-2xl px-5 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="font-display text-3xl font-bold text-amber-500 dark:text-amber-400">{xp}</span>
              <span className="text-xs font-medium text-fg-muted">XP</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="level-badge rounded-full px-2.5 py-0.5 text-[11px] font-bold">LVL {level}</span>
              <span className="text-[11px] text-fg-muted">{completed}/{total} quests</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 h-2.5 overflow-hidden rounded-full xp-bar">
        <motion.div
          className="xp-fill h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.header>
  )
}

// ─── Inline sync pill ────────────────────────────────────────────────────────

interface SyncPillProps {
  loading: boolean
  synced: boolean
  syncing: boolean
  useDb: boolean
  error: string | null
  pollSeconds: number
  onRefresh: () => void
  onDismissError: () => void
}

function SyncPill({ loading, synced, syncing, useDb, error, pollSeconds, onRefresh, onDismissError }: SyncPillProps) {
  if (!isSupabaseConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400"
      >
        <CloudOff className="h-3 w-3 shrink-0" />
        <span>Offline — add Supabase keys to sync</span>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400"
      >
        <span className="truncate max-w-[200px]">{error}</span>
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
        className="mt-2 flex items-center gap-1.5 text-[11px] text-fg-muted"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading from Supabase…</span>
      </motion.div>
    )
  }

  if (useDb && synced) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 flex items-center gap-2"
      >
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
          <Cloud className="h-3 w-3 shrink-0" />
          <span>Cloud sync · every {pollSeconds}s</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={syncing}
          className="flex items-center gap-1 rounded-md border border-emerald-500/30 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:opacity-50 dark:text-emerald-400"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${syncing ? 'animate-spin' : ''}`} />
          Sync now
        </button>
      </motion.div>
    )
  }

  return null
}