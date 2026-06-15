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
  loading: boolean
  synced: boolean
  syncing: boolean
  useDb: boolean
  syncError: string | null
  onRefresh: () => void
  onDismissSyncError: () => void
}

export function Header({
  trip, xp, completed, total, theme, onToggleTheme,
  notificationPermission, onEnableNotifications, onEditTrip,
  loading, synced, syncing, useDb, syncError, onRefresh, onDismissSyncError,
}: HeaderProps) {
  const { level, progress } = getLevel(xp)
  const notificationsOn = notificationPermission === 'granted'
  const notificationsBlocked = notificationPermission === 'denied'
  const notificationLabel = notificationsOn ? 'Alerts on' : notificationsBlocked ? 'Alerts blocked' : 'Enable alerts'
  const pollSeconds = SYNC_POLL_INTERVAL_MS / 1000

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel relative overflow-hidden rounded-2xl p-4 md:p-6"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full ambient-purple blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full ambient-orange blur-3xl" />

      <div className="relative space-y-3">

        {/* ── Row 1: icon + title + XP card ── */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-13 md:w-13 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Compass className="h-5 w-5 md:h-6 md:w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="accent-label hidden md:block text-[10px] font-bold uppercase tracking-[0.2em]">
              Adventure Map
            </p>
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-display text-xl md:text-3xl font-extrabold tracking-tight truncate">
                <span className="shimmer-text">{trip?.name ?? 'Banglore DLC'}</span>
              </h1>
              {trip && onEditTrip && (
                <button
                  onClick={onEditTrip}
                  className="shrink-0 rounded-lg p-1 text-fg-muted hover:bg-accent-soft hover:text-accent"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="hidden md:block mt-0.5 text-xs text-fg-muted">
              Build quests · Roll together · Collect memories
            </p>
          </div>

          {/* XP card — always visible, right-anchored */}
          <div className="quest-card shrink-0 rounded-xl px-3 md:px-5 py-2 md:py-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />
              <span className="font-display text-xl md:text-3xl font-bold text-amber-500 dark:text-amber-400">
                {xp}
              </span>
              <span className="text-[9px] md:text-xs font-medium text-fg-muted">XP</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="level-badge rounded-full px-2 py-0.5 text-[9px] md:text-[11px] font-bold">
                LVL {level}
              </span>
              <span className="text-[9px] md:text-[11px] text-fg-muted">{completed}/{total}</span>
            </div>
          </div>
        </div>

        {/* ── Row 2: sync pill (left) + bell + theme toggle (right) ── */}
        <div className="flex items-center justify-between gap-2">
          <SyncPill
            loading={loading} synced={synced} syncing={syncing}
            useDb={useDb} error={syncError} pollSeconds={pollSeconds}
            onRefresh={onRefresh} onDismissError={onDismissSyncError}
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEnableNotifications}
              disabled={notificationsOn || notificationsBlocked || notificationPermission === 'unsupported'}
              title={
                notificationsBlocked ? 'Notifications are blocked in your browser settings'
                : notificationPermission === 'unsupported' ? 'This browser does not support notifications'
                : notificationLabel
              }
              className="btn-ghost flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {notificationsOn ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{notificationLabel}</span>
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </div>

      {/* ── XP bar ── */}
      <div className="relative mt-3 h-2 overflow-hidden rounded-full xp-bar">
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

// ─── Sync pill ───────────────────────────────────────────────────────────────

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
      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
        <CloudOff className="h-3 w-3 shrink-0" />
        <span className="hidden sm:inline">Offline — add Supabase keys to sync</span>
        <span className="sm:hidden">Offline</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400">
        <span className="truncate">{error}</span>
        <button onClick={onDismissError} className="shrink-0 underline hover:no-underline">Dismiss</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
        <span>Loading…</span>
      </div>
    )
  }

  if (useDb && synced) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
          <Cloud className="h-3 w-3 shrink-0" />
          <span className="hidden sm:inline">Cloud sync · every {pollSeconds}s</span>
          <span className="sm:hidden">Synced</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={syncing}
          className="flex items-center gap-1 rounded-md border border-emerald-500/30 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:opacity-50 dark:text-emerald-400"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${syncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync now</span>
        </button>
      </div>
    )
  }

  return null
}