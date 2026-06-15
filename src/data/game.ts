export interface BadgeDefinition {
  id: string
  title: string
  emoji: string
  description: string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first-step', title: 'First Step', emoji: '👣', description: 'Complete your first quest' },
  { id: 'explorer', title: 'Explorer', emoji: '📸', description: 'Complete 5 explore quests' },
  { id: 'foodie', title: 'Foodie', emoji: '🍛', description: 'Complete 5 food quests' },
  { id: 'night-owl', title: 'Night Owl', emoji: '🦉', description: 'Complete 3 nightlife quests' },
  { id: 'shutterbug', title: 'Shutterbug', emoji: '📷', description: 'Upload 3 quest photos' },
  { id: 'completionist', title: 'Quest Master', emoji: '🏆', description: 'Complete every quest' },
]

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000]

export function getLevel(xp: number) {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return { level, current, next, progress: ((xp - current) / (next - current)) * 100 }
}

export const TRACK_PRESETS = [
  { emoji: '🏖️', accent: '#0d9488' }, // teal
  { emoji: '🌆', accent: '#6366f1' }, // indigo  
  { emoji: '🕉️', accent: '#8b5cf6' }, // violet
  { emoji: '🎒', accent: '#f97316' }, // orange
  { emoji: '🌄', accent: '#f43f5e' }, // rose
  { emoji: '🍻', accent: '#eab308' }, // gold
] as const

export function pickTrackPreset(index: number) {
  return TRACK_PRESETS[index % TRACK_PRESETS.length]
}
