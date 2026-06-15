import { BADGE_DEFINITIONS } from '../data/game'
import { getSupabase } from './supabase'
import type {
  Activity,
  ActivityCategory,
  ActivityTag,
  Badge,
  ItineraryTrack,
} from '../types'

export function countByCategory(tracks: ItineraryTrack[], category: ActivityCategory) {
  return tracks
    .flatMap((t) => t.days)
    .flatMap((d) => d.activities)
    .filter((a) => a.completed && a.category === category).length
}

function allComplete(tracks: ItineraryTrack[]) {
  const all = tracks.flatMap((t) => t.days).flatMap((d) => d.activities)
  return all.length > 0 && all.every((a) => a.completed)
}

export function evaluateBadges(tracks: ItineraryTrack[]): Badge[] {
  const activities = tracks.flatMap((t) => t.days).flatMap((d) => d.activities)
  const completed = activities.filter((a) => a.completed).length
  const withPhotos = activities.filter((a) => a.imageUrl).length

  return BADGE_DEFINITIONS.map((b) => {
    let unlocked = false
    switch (b.id) {
      case 'first-step':
        unlocked = completed >= 1
        break
      case 'explorer':
        unlocked = countByCategory(tracks, 'sightseeing') >= 5
        break
      case 'foodie':
        unlocked = countByCategory(tracks, 'food') >= 5
        break
      case 'night-owl':
        unlocked = countByCategory(tracks, 'nightlife') >= 3
        break
      case 'shutterbug':
        unlocked = withPhotos >= 3
        break
      case 'completionist':
        unlocked = allComplete(tracks)
        break
    }
    return { ...b, unlocked }
  })
}

export function rowToActivity(row: {
  id: string
  title: string
  description: string | null
  time: string | null
  location: string | null
  category: string
  tag: string
  xp: number
  completed: boolean
  image_url: string | null
}): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    time: row.time ?? undefined,
    location: row.location ?? undefined,
    category: row.category as ActivityCategory,
    tag: row.tag as ActivityTag,
    xp: row.xp,
    completed: row.completed,
    imageUrl: row.image_url ?? undefined,
  }
}

async function recalcXp(tripId: string) {
  const supabase = getSupabase()
  if (!supabase) return

  const { data: activities } = await supabase
    .from('activities')
    .select('xp, completed')
    .eq('trip_id', tripId)

  const xp = (activities ?? [])
    .filter((a) => a.completed)
    .reduce((sum, a) => sum + a.xp, 0)

  await supabase.from('trips').update({ xp }).eq('id', tripId)
}

export { recalcXp }
