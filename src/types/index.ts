export type ActivityCategory =
  | 'travel'
  | 'food'
  | 'sightseeing'
  | 'nightlife'
  | 'spiritual'
  | 'shopping'
  | 'chill'
  | 'custom'

export type ActivityTag = 'solo' | 'together' | 'friend' | 'you'

export interface Trip {
  id: string
  name: string
  xp: number
  createdAt?: string
  updatedAt?: string
}

export interface Activity {
  id: string
  title: string
  description?: string
  time?: string
  location?: string
  category: ActivityCategory
  tag: ActivityTag
  xp: number
  completed: boolean
  imageUrl?: string
}

export interface DayPlan {
  id: string
  date: string
  label: string
  subtitle?: string
  activities: Activity[]
}

export interface ItineraryTrack {
  id: string
  title: string
  emoji: string
  description: string
  gradient: string
  accent: string
  days: DayPlan[]
}

export interface Badge {
  id: string
  title: string
  emoji: string
  description: string
  unlocked: boolean
}

export interface AppState {
  tracks: ItineraryTrack[]
  xp: number
  badges: Badge[]
}

export const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; emoji: string; color: string }
> = {
  travel: { label: 'Travel', emoji: '🚌', color: '#60a5fa' },
  food: { label: 'Food', emoji: '🍽️', color: '#f97316' },
  sightseeing: { label: 'Explore', emoji: '📸', color: '#a78bfa' },
  nightlife: { label: 'Nightlife', emoji: '🌙', color: '#f472b6' },
  spiritual: { label: 'Spiritual', emoji: '🕉️', color: '#34d399' },
  shopping: { label: 'Shopping', emoji: '🛍️', color: '#fbbf24' },
  chill: { label: 'Chill', emoji: '☀️', color: '#38bdf8' },
  custom: { label: 'Custom', emoji: '✨', color: '#e879f9' },
}

export const TAG_META: Record<ActivityTag, { label: string; color: string }> = {
  solo: { label: 'Solo', color: '#94a3b8' },
  together: { label: 'Together', color: '#34d399' },
  friend: { label: 'Friend', color: '#60a5fa' },
  you: { label: 'You', color: '#f472b6' },
}
