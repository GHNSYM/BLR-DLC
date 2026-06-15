import { pickTrackPreset } from '../data/game'
import { recalcXp, rowToActivity } from './badges'
import { STORAGE_BUCKET } from './config'
import type { DbActivity, DbDay, DbTrack } from './database.types'
import { getSupabase } from './supabase'
import type {
  ActivityCategory,
  ActivityTag,
  ItineraryTrack,
  Trip,
} from '../types'

export type ChangeSnapshotItem = {
  id: string
  label: string
  updatedAt: string
}

export type ChangeSnapshot = {
  trips: ChangeSnapshotItem[]
  tracks: ChangeSnapshotItem[]
  days: ChangeSnapshotItem[]
  activities: ChangeSnapshotItem[]
}

const SOFT_TRACK_ACCENTS: Record<string, string> = {
  '#f97316': '#6f9285',
  '#10b981': '#6f9285',
  '#8b5cf6': '#8b83a6',
  '#0ea5e9': '#688f9a',
  '#f59e0b': '#9a8466',
  '#ec4899': '#a57b7b',
}

const SOFT_TRACK_GRADIENTS: Record<string, string> = {
  'from-orange-500 via-rose-500 to-purple-600': 'from-stone-300 via-emerald-200 to-teal-300',
  'from-emerald-500 via-teal-500 to-cyan-600': 'from-stone-300 via-emerald-200 to-teal-300',
  'from-violet-600 via-purple-600 to-indigo-700': 'from-violet-200 via-stone-200 to-emerald-200',
  'from-sky-500 via-blue-500 to-indigo-600': 'from-teal-200 via-cyan-100 to-slate-300',
  'from-amber-500 via-yellow-500 to-orange-600': 'from-amber-100 via-stone-200 to-emerald-200',
  'from-pink-500 via-rose-500 to-red-600': 'from-rose-100 via-stone-200 to-teal-200',
}

function softenTrackAccent(accent: string) {
  return SOFT_TRACK_ACCENTS[accent.toLowerCase()] ?? accent
}

function softenTrackGradient(gradient: string) {
  return SOFT_TRACK_GRADIENTS[gradient] ?? gradient
}

function assembleTracks(
  trackRows: DbTrack[],
  dayRows: DbDay[],
  activityRows: DbActivity[],
): ItineraryTrack[] {
  return trackRows.map((track) => ({
    id: track.id,
    title: track.title,
    emoji: track.emoji,
    description: track.description,
    gradient: softenTrackGradient(track.gradient),
    accent: softenTrackAccent(track.accent),
    days: dayRows
      .filter((d) => d.track_id === track.id)
      .map((day) => ({
        id: day.id,
        date: day.date,
        label: day.label,
        subtitle: day.subtitle ?? undefined,
        activities: activityRows
          .filter((a) => a.day_id === day.id)
          .map(rowToActivity),
      })),
  }))
}

export async function fetchAllTrips(): Promise<Trip[]> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    xp: t.xp,
    createdAt: t.created_at,
  }))
}

export async function fetchChangeSnapshot(): Promise<ChangeSnapshot> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  // Only select columns guaranteed by base schema (no updated_at required)
  const [tripsRes, tracksRes, daysRes, activitiesRes] = await Promise.all([
    supabase.from('trips').select('id, name, created_at'),
    supabase.from('tracks').select('id, title'),
    supabase.from('days').select('id, label'),
    supabase.from('activities').select('id, title, created_at'),
  ])

  if (tripsRes.error) throw tripsRes.error
  if (tracksRes.error) throw tracksRes.error
  if (daysRes.error) throw daysRes.error
  if (activitiesRes.error) throw activitiesRes.error

  const stamp = (value?: string | null) => value ?? ''

  return {
    trips: (tripsRes.data ?? []).map((row) => ({
      id: row.id,
      label: row.name,
      updatedAt: stamp(row.created_at),
    })),
    tracks: (tracksRes.data ?? []).map((row) => ({
      id: row.id,
      label: row.title,
      updatedAt: row.id,
    })),
    days: (daysRes.data ?? []).map((row) => ({
      id: row.id,
      label: row.label,
      updatedAt: row.id,
    })),
    activities: (activitiesRes.data ?? []).map((row) => ({
      id: row.id,
      label: row.title,
      updatedAt: stamp(row.created_at),
    })),
  }
}

export async function fetchCompatibleChangeSnapshot(): Promise<ChangeSnapshot | null> {
  try {
    return await fetchChangeSnapshot()
  } catch {
    return null
  }
}

export async function fetchTripData(tripId: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: trip, error: tripErr } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle()

  if (tripErr) throw tripErr
  if (!trip) return { trip: null, tracks: [] as ItineraryTrack[] }

  const [tracksRes, daysRes, activitiesRes] = await Promise.all([
    supabase.from('tracks').select('*').eq('trip_id', tripId).order('sort_order'),
    supabase.from('days').select('*').eq('trip_id', tripId).order('sort_order'),
    supabase.from('activities').select('*').eq('trip_id', tripId).order('sort_order'),
  ])

  if (tracksRes.error) throw tracksRes.error
  if (daysRes.error) throw daysRes.error
  if (activitiesRes.error) throw activitiesRes.error

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      xp: trip.xp,
      createdAt: trip.created_at,
    } satisfies Trip,
    tracks: assembleTracks(tracksRes.data ?? [], daysRes.data ?? [], activitiesRes.data ?? []),
  }
}

export async function createTrip(name: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('trips').insert({ id, name, xp: 0 })
  if (error) throw error
  return id
}

export async function updateTrip(tripId: string, name: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('trips').update({ name }).eq('id', tripId)
  if (error) throw error
}

export async function deleteTrip(tripId: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: activities } = await supabase
    .from('activities')
    .select('image_url')
    .eq('trip_id', tripId)

  for (const act of activities ?? []) {
    if (act.image_url) await removeStorageObject(act.image_url)
  }

  await purgeTripStorage(tripId)
  const { error } = await supabase.from('trips').delete().eq('id', tripId)
  if (error) throw error
}

export async function createTrack(
  tripId: string,
  data: { title: string; description: string; emoji?: string; gradient?: string; accent?: string },
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { count } = await supabase
    .from('tracks')
    .select('*', { count: 'exact', head: true })
    .eq('trip_id', tripId)

  const preset = pickTrackPreset(count ?? 0)
  const id = crypto.randomUUID()

  const { error } = await supabase.from('tracks').insert({
    id,
    trip_id: tripId,
    title: data.title,
    description: data.description,
    emoji: data.emoji ?? preset.emoji,
    gradient: data.gradient ?? preset.gradient,
    accent: data.accent ?? preset.accent,
    sort_order: count ?? 0,
  })

  if (error) throw error
  return id
}

export async function updateTrack(
  trackId: string,
  data: Partial<{ title: string; description: string; emoji: string; gradient: string; accent: string }>,
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('tracks').update(data).eq('id', trackId)
  if (error) throw error
}

export async function deleteTrack(trackId: string, tripId: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: days } = await supabase.from('days').select('id').eq('track_id', trackId)
  const dayIds = (days ?? []).map((d) => d.id)

  if (dayIds.length) {
    const { data: acts } = await supabase
      .from('activities')
      .select('image_url')
      .in('day_id', dayIds)

    for (const act of acts ?? []) {
      if (act.image_url) await removeStorageObject(act.image_url)
    }
  }

  const { error } = await supabase.from('tracks').delete().eq('id', trackId)
  if (error) throw error
  await recalcXp(tripId)
}

export async function createDay(
  tripId: string,
  trackId: string,
  data: { label: string; subtitle?: string; date?: string },
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: existing } = await supabase
    .from('days')
    .select('sort_order')
    .eq('track_id', trackId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const id = crypto.randomUUID()
  const { error } = await supabase.from('days').insert({
    id,
    track_id: trackId,
    trip_id: tripId,
    date: data.date ?? new Date().toISOString().slice(0, 10),
    label: data.label,
    subtitle: data.subtitle ?? null,
    sort_order: (existing?.[0]?.sort_order ?? -1) + 1,
  })

  if (error) throw error
  return id
}

export async function updateDay(
  dayId: string,
  data: Partial<{ label: string; subtitle: string; date: string }>,
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('days').update(data).eq('id', dayId)
  if (error) throw error
}

export async function deleteDay(dayId: string, tripId: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: acts } = await supabase
    .from('activities')
    .select('image_url')
    .eq('day_id', dayId)

  for (const act of acts ?? []) {
    if (act.image_url) await removeStorageObject(act.image_url)
  }

  const { error } = await supabase.from('days').delete().eq('id', dayId)
  if (error) throw error
  await recalcXp(tripId)
}

export type ActivityInput = {
  title: string
  description?: string
  time?: string
  location?: string
  category: ActivityCategory
  tag: ActivityTag
  xp?: number
}

export async function createActivity(tripId: string, dayId: string, data: ActivityInput) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: existing } = await supabase
    .from('activities')
    .select('sort_order')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const id = crypto.randomUUID()
  const { error } = await supabase.from('activities').insert({
    id,
    day_id: dayId,
    trip_id: tripId,
    title: data.title,
    description: data.description ?? null,
    time: data.time ?? null,
    location: data.location ?? null,
    category: data.category,
    tag: data.tag,
    xp: data.xp ?? 25,
    completed: false,
    custom: false,
    sort_order: (existing?.[0]?.sort_order ?? -1) + 1,
  })

  if (error) throw error
  return id
}

export async function updateActivity(activityId: string, data: Partial<ActivityInput>) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const patch: Record<string, unknown> = {}
  if (data.title !== undefined) patch.title = data.title
  if (data.description !== undefined) patch.description = data.description ?? null
  if (data.time !== undefined) patch.time = data.time ?? null
  if (data.location !== undefined) patch.location = data.location ?? null
  if (data.category !== undefined) patch.category = data.category
  if (data.tag !== undefined) patch.tag = data.tag
  if (data.xp !== undefined) patch.xp = data.xp

  const { error } = await supabase.from('activities').update(patch).eq('id', activityId)
  if (error) throw error
}

export async function deleteActivity(activityId: string, tripId: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: activity } = await supabase
    .from('activities')
    .select('image_url')
    .eq('id', activityId)
    .single()

  if (activity?.image_url) await removeActivityStorage(tripId, activityId, activity.image_url)

  const { error } = await supabase.from('activities').delete().eq('id', activityId)
  if (error) throw error
  await recalcXp(tripId)
}

export async function updateActivityCompleted(
  activityId: string,
  completed: boolean,
  tripId: string,
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('activities').update({ completed }).eq('id', activityId)
  if (error) throw error
  await recalcXp(tripId)
}

export async function resetTripProgress(tripId: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: activities } = await supabase
    .from('activities')
    .select('image_url')
    .eq('trip_id', tripId)

  for (const act of activities ?? []) {
    if (act.image_url) await removeStorageObject(act.image_url)
  }

  await supabase
    .from('activities')
    .update({ completed: false, image_url: null })
    .eq('trip_id', tripId)

  await supabase.from('trips').update({ xp: 0 }).eq('id', tripId)
}

function storagePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length))
}

async function removeStorageObject(publicUrl: string) {
  const supabase = getSupabase()
  if (!supabase) return
  const path = storagePathFromUrl(publicUrl)
  if (!path) return
  await supabase.storage.from(STORAGE_BUCKET).remove([path])
}

async function removeActivityStorage(tripId: string, activityId: string, publicUrl?: string | null) {
  const supabase = getSupabase()
  if (!supabase) return

  const paths = new Set<string>()
  const directPath = publicUrl ? storagePathFromUrl(publicUrl) : null
  if (directPath) paths.add(directPath)

  const folder = `${tripId}/${activityId}`
  const { data: files } = await supabase.storage.from(STORAGE_BUCKET).list(folder)
  for (const file of files ?? []) {
    paths.add(`${folder}/${file.name}`)
  }

  if (paths.size) {
    await supabase.storage.from(STORAGE_BUCKET).remove([...paths])
  }
}

async function purgeTripStorage(tripId: string) {
  const supabase = getSupabase()
  if (!supabase) return
  const { data: folders } = await supabase.storage.from(STORAGE_BUCKET).list(tripId)
  for (const folder of folders ?? []) {
    const folderPath = `${tripId}/${folder.name}`
    const { data: files } = await supabase.storage.from(STORAGE_BUCKET).list(folderPath)
    const paths = (files ?? []).map((f) => `${folderPath}/${f.name}`)
    if (paths.length) {
      await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    }
  }
}

export async function uploadActivityImage(
  tripId: string,
  activityId: string,
  file: File,
  existingUrl?: string,
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  if (existingUrl) await removeStorageObject(existingUrl)

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${tripId}/${activityId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadErr) throw uploadErr

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)

  const { error: updateErr } = await supabase
    .from('activities')
    .update({ image_url: urlData.publicUrl })
    .eq('id', activityId)

  if (updateErr) throw updateErr
  return urlData.publicUrl
}

export async function removeActivityImage(activityId: string, imageUrl: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: activity, error: fetchErr } = await supabase
    .from('activities')
    .select('trip_id, image_url')
    .eq('id', activityId)
    .maybeSingle()

  if (fetchErr) throw fetchErr

  if (activity?.trip_id) {
    await removeActivityStorage(activity.trip_id, activityId, activity.image_url ?? imageUrl)
  } else {
    await removeStorageObject(imageUrl)
  }

  const { error } = await supabase
    .from('activities')
    .update({ image_url: null })
    .eq('id', activityId)

  if (error) throw error
}

export function startTripPolling(onPoll: () => void, intervalMs = 5_000) {
  let timer: ReturnType<typeof setInterval> | null = null

  const tick = () => {
    if (document.visibilityState === 'visible') onPoll()
  }

  const startInterval = () => {
    if (timer) clearInterval(timer)
    timer = setInterval(tick, intervalMs)
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      onPoll()
      startInterval()
    } else if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const onFocus = () => onPoll()

  startInterval()
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('focus', onFocus)

  return () => {
    if (timer) clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('focus', onFocus)
  }
}

// Legacy aliases used by hook
export const insertActivity = createActivity
export const insertDay = createDay
export const deleteCustomActivity = deleteActivity
