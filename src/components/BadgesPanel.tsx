import { motion } from 'framer-motion'
import type { Badge } from '../types'

interface BadgesPanelProps {
  badges: Badge[]
}

export function BadgesPanel({ badges }: BadgesPanelProps) {
  const unlocked = badges.filter((b) => b.unlocked).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="panel rounded-2xl p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-fg-muted">
          🎒 Loot Bag
        </h3>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
          {unlocked}/{badges.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            title={badge.description}
            className={`flex flex-col items-center rounded-xl p-2.5 text-center transition-all ${
              badge.unlocked
                ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/10 ring-1 ring-amber-400/40 shadow-sm'
                : 'badge-locked grayscale'
            }`}
          >
            <span className="text-2xl">{badge.emoji}</span>
            <span className="badge-label mt-1 text-[9px] font-semibold leading-tight">{badge.title}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
