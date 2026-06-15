import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { evaluateBadges } from '../lib/badges'
import { isSupabaseConfigured, SYNC_POLL_INTERVAL_MS } from '../lib/config'
import {
  createActivity,
  createDay,
  createTrack,
  createTrip as dbCreateTrip,
  deleteActivity,
  deleteDay,
  deleteTrack,
  deleteTrip as dbDeleteTrip,
  fetchAllTrips,
  fetchCompatibleChangeSnapshot,
  fetchTripData,
  removeActivityImage,
  resetTripProgress,
  startTripPolling,
  updateActivity,
  updateActivityCompleted,
  updateDay,
  updateTrack,
  updateTrip as dbUpdateTrip,
  uploadActivityImage,
} from '../lib/itineraryDb'
import type { ActivityInput, ChangeSnapshot, ChangeSnapshotItem } from '../lib/itineraryDb'
import {
  getNotificationPermission,
  requestBrowserNotifications,
  showBrowserNotification,
  type NotificationPermissionState,
} from '../lib/notifications'
import type {
  ActivityCategory,
  ActivityTag,
  Badge,
  ItineraryTrack,
  Trip,
} from '../types'

const ACTIVE_TRIP_KEY = 'bangalore-dlc-active-trip'

function resolveActiveTripId(trips: Trip[], preferredId: string | null): string | null {
  if (!trips.length) return null
  if (preferredId && trips.some((t) => t.id === preferredId)) return preferredId

  const storedId = localStorage.getItem(ACTIVE_TRIP_KEY)
  if (storedId && trips.some((t) => t.id === storedId)) return storedId

  return trips[0]?.id ?? null
}

const CHANGE_KIND_LABELS: Record<keyof ChangeSnapshot, string> = {
  trips: 'trip',
  tracks: 'chapter',
  days: 'day',
  activities: 'quest',
}

function byId(items: ChangeSnapshotItem[]) {
  return new Map(items.map((item) => [item.id, item]))
}

function describeChangeSnapshot(previous: ChangeSnapshot, next: ChangeSnapshot) {
  const details: string[] = []
  let count = 0

  ;(Object.keys(CHANGE_KIND_LABELS) as Array<keyof ChangeSnapshot>).forEach((kind) => {
    const label = CHANGE_KIND_LABELS[kind]
    const before = byId(previous[kind])
    const after = byId(next[kind])

    after.forEach((item, id) => {
      const previousItem = before.get(id)
      if (!previousItem) {
        count += 1
        details.push(`${item.label} ${label} added`)
      } else if (previousItem.updatedAt !== item.updatedAt || previousItem.label !== item.label) {
        count += 1
        details.push(`${item.label} ${label} edited`)
      }
    })

    before.forEach((item, id) => {
      if (!after.has(id)) {
        count += 1
        details.push(`${item.label} ${label} deleted`)
      }
    })
  })

  if (!count) return null

  const body =
    details.length <= 3
      ? details.join(', ')
      : `${details.slice(0, 3).join(', ')} and ${details.length - 3} more`

  return {
    title: count === 1 ? 'Itinerary updated' : `${count} itinerary updates`,
    body,
  }
}

export function useItinerary() {
  const [tripList, setTripList] = useState<Trip[]>([])
  const [trip, setTrip] = useState<Trip | null>(null)
  const [tracks, setTracks] = useState<ItineraryTrack[]>([])
  const [activeTripId, setActiveTripId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [synced, setSynced] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(() => getNotificationPermission())

  const reloadingRef = useRef(false)
  const changeSnapshotRef = useRef<ChangeSnapshot | null>(null)
  const suppressNextNotificationRef = useRef(false)

  const reload = useCallback(
    async (silent = false, forcedTripId?: string | null) => {
      if (!isSupabaseConfigured || reloadingRef.current) return
      reloadingRef.current = true
      if (!silent) setSyncing(true)

      try {
        const trips = await fetchAllTrips()
        setTripList(trips)

        let changeSnapshot: ChangeSnapshot | null = null
        try {
          changeSnapshot = await fetchCompatibleChangeSnapshot()
        } catch {
          changeSnapshot = null
        }

        const previousSnapshot = changeSnapshotRef.current
        changeSnapshotRef.current = changeSnapshot

        if (previousSnapshot && changeSnapshot && !suppressNextNotificationRef.current) {
          const change = describeChangeSnapshot(previousSnapshot, changeSnapshot)
          if (change) {
            showBrowserNotification(change.title, change.body)
          }
        }
        suppressNextNotificationRef.current = false

        const tripId = resolveActiveTripId(
          trips,
          forcedTripId ?? localStorage.getItem(ACTIVE_TRIP_KEY) ?? activeTripId,
        )

        if (tripId) {
          setActiveTripId(tripId)
          localStorage.setItem(ACTIVE_TRIP_KEY, tripId)
          const { trip: t, tracks: fetched } = await fetchTripData(tripId)
          setTrip(t)
          setTracks(fetched)
        } else {
          setActiveTripId(null)
          localStorage.removeItem(ACTIVE_TRIP_KEY)
          setTrip(null)
          setTracks([])
        }

        setError(null)
        setSynced(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load'
        console.error('[reload]', message, err)
        setError(message)
        setSynced(false)
      } finally {
        reloadingRef.current = false
        if (!silent) setSyncing(false)
        setLoading(false)
      }
    },
    [activeTripId],
  )

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Supabase not configured — add your keys to .env')
      return
    }

    let cancelled = false
    ;(async () => {
      await reload()
      if (!cancelled) setLoading(false)
    })()

    const stop = startTripPolling(() => reload(true), SYNC_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const updatePermission = () => setNotificationPermission(getNotificationPermission())
    document.addEventListener('visibilitychange', updatePermission)
    window.addEventListener('focus', updatePermission)
    return () => {
      document.removeEventListener('visibilitychange', updatePermission)
      window.removeEventListener('focus', updatePermission)
    }
  }, [])

  const selectTrip = useCallback((tripId: string) => {
    setActiveTripId(tripId)
    localStorage.setItem(ACTIVE_TRIP_KEY, tripId)
    setLoading(true)
    fetchTripData(tripId)
      .then(({ trip: t, tracks: fetched }) => {
        setTrip(t)
        setTracks(fetched)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load trip')
        setLoading(false)
      })
  }, [])

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      try {
        await fn()
        suppressNextNotificationRef.current = true
        await reload(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Action failed'
        console.error('[action]', message, err)
        setError(message)
        setLoading(false)
      }
    },
    [reload],
  )

  const badges: Badge[] = useMemo(() => evaluateBadges(tracks), [tracks])

  const stats = useMemo(() => {
    const all = tracks.flatMap((t) => t.days).flatMap((d) => d.activities)
    const completed = all.filter((a) => a.completed).length
    return {
      total: all.length,
      completed,
      percent: all.length ? Math.round((completed / all.length) * 100) : 0,
    }
  }, [tracks])

  const xp = trip?.xp ?? 0

  return {
    trip,
    tripList,
    tracks,
    xp,
    badges,
    stats,
    loading,
    error,
    synced,
    syncing,
    uploadingId,
    useDb: isSupabaseConfigured,

    selectTrip,
    clearError: () => setError(null),
    refresh: () => reload(),
    notificationPermission,
    requestNotifications: async () => {
      const permission = await requestBrowserNotifications()
      setNotificationPermission(permission)
      return permission
    },

    createTrip: (name: string) => run(async () => {
      const id = await dbCreateTrip(name)
      setActiveTripId(id)
      localStorage.setItem(ACTIVE_TRIP_KEY, id)
    }),

    updateTripName: (name: string) =>
      run(async () => {
        if (!activeTripId) return
        await dbUpdateTrip(activeTripId, name)
      }),

    deleteTrip: (tripId: string) =>
      run(async () => {
        await dbDeleteTrip(tripId)
        if (activeTripId === tripId) {
          setActiveTripId(null)
          localStorage.removeItem(ACTIVE_TRIP_KEY)
        }
      }),

    createTrack: (title: string, description: string) =>
      run(async () => {
        if (!activeTripId) return
        await createTrack(activeTripId, { title, description })
      }),

    updateTrack: (trackId: string, data: { title?: string; description?: string; emoji?: string }) =>
      run(async () => updateTrack(trackId, data)),

    deleteTrack: (trackId: string) =>
      run(async () => {
        if (!activeTripId) return
        await deleteTrack(trackId, activeTripId)
      }),

    addDay: (trackId: string, label: string, subtitle?: string, date?: string) =>
      run(async () => {
        if (!activeTripId) return
        await createDay(activeTripId, trackId, { label, subtitle, date })
      }),

    updateDay: (dayId: string, data: { label?: string; subtitle?: string; date?: string }) =>
      run(async () => updateDay(dayId, data)),

    deleteDay: (dayId: string) =>
      run(async () => {
        if (!activeTripId) return
        await deleteDay(dayId, activeTripId)
      }),

    addActivity: (
      _trackId: string,
      dayId: string,
      data: {
        title: string
        description?: string
        time?: string
        location?: string
        category: ActivityCategory
        tag: ActivityTag
        xp?: number
      },
    ) =>
      run(async () => {
        if (!activeTripId) return
        await createActivity(activeTripId, dayId, data)
      }),

    updateActivity: (activityId: string, data: Partial<ActivityInput>) =>
      run(async () => updateActivity(activityId, data)),

    removeActivity: (_trackId: string, _dayId: string, activityId: string) =>
      run(async () => {
        if (!activeTripId) return
        await deleteActivity(activityId, activeTripId)
      }),

    toggleActivity: (_trackId: string, _dayId: string, activityId: string) => {
      const activity = tracks
        .flatMap((t) => t.days)
        .flatMap((d) => d.activities)
        .find((a) => a.id === activityId)
      if (!activity || !activeTripId) return
      run(async () =>
        updateActivityCompleted(activityId, !activity.completed, activeTripId),
      )
    },

    resetProgress: () =>
      run(async () => {
        if (!activeTripId) return
        await resetTripProgress(activeTripId)
      }),

    uploadImage: async (activityId: string, file: File) => {
      const activity = tracks
        .flatMap((t) => t.days)
        .flatMap((d) => d.activities)
        .find((a) => a.id === activityId)
      if (!activity || !activeTripId) return

      setUploadingId(activityId)
      try {
        await uploadActivityImage(activeTripId, activityId, file, activity.imageUrl)
        await reload(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploadingId(null)
      }
    },

    removeImage: async (activityId: string) => {
      const activity = tracks
        .flatMap((t) => t.days)
        .flatMap((d) => d.activities)
        .find((a) => a.id === activityId)
      if (!activity?.imageUrl) return

      setUploadingId(activityId)
      try {
        await removeActivityImage(activityId, activity.imageUrl)
        await reload(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove image')
      } finally {
        setUploadingId(null)
      }
    },
  }
}
