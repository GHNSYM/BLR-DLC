import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import type { ItineraryTrack } from '../types'
import type { ActivityFormData } from './ActivityItem'
import { DayCard, AddDayButton, CreateDayModal } from './DayCard'

interface RoadmapProps {
  track: ItineraryTrack
  uploadingId?: string | null
  onToggle: (dayId: string, activityId: string) => void
  onAddActivity: (dayId: string, data: ActivityFormData) => void
  onEditActivity: (dayId: string, activityId: string, data: ActivityFormData) => void
  onDeleteActivity: (dayId: string, activityId: string) => void
  onAddDay: (label: string, subtitle?: string, date?: string) => void
  onEditDay: (dayId: string, data: { label: string; subtitle?: string; date?: string }) => void
  onDeleteDay: (dayId: string) => void
  onUploadImage?: (activityId: string, file: File) => void
  onRemoveImage?: (activityId: string) => void
}

export function Roadmap({
  track,
  uploadingId,
  onToggle,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onAddDay,
  onEditDay,
  onDeleteDay,
  onUploadImage,
  onRemoveImage,
}: RoadmapProps) {
  const [showAddDay, setShowAddDay] = useState(false)

  return (
    <motion.div
      key={track.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="text-2xl md:text-4xl">{track.emoji}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg md:text-2xl font-bold text-fg">{track.title}</h2>
          <p className="text-xs md:text-sm text-fg-muted truncate">{track.description}</p>
        </div>
      </div>

      {track.days.length === 0 ? (
        <div className="dashed-btn rounded-lg md:rounded-2xl py-8 md:py-12 px-3 md:px-4 text-center">
          <MapPin className="mx-auto mb-2 h-6 md:h-8 w-6 md:w-8 text-fg-muted opacity-50" />
          <p className="text-xs md:text-sm text-fg-muted">No days in this chapter yet</p>
          <button onClick={() => setShowAddDay(true)} className="mt-2 md:mt-3 text-xs md:text-sm font-semibold text-accent hover:underline">
            Add the first day →
          </button>
        </div>
      ) : (
        <div className="relative space-y-3 md:space-y-5 pl-3 md:pl-4">
          <div className="roadmap-line absolute left-[7px] md:left-[11px] top-4 bottom-4 w-0.5" aria-hidden />
          {track.days.map((day, i) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative"
            >
              <div
                className="quest-node absolute -left-4 top-7 z-10 h-4 w-4 rounded-full ring-4 ring-app"
                style={{ backgroundColor: track.accent }}
              />
              <DayCard
                day={day}
                accent={track.accent}
                uploadingId={uploadingId}
                defaultOpen={i === 0}
                onToggle={(id) => onToggle(day.id, id)}
                onAdd={(data) => onAddActivity(day.id, data)}
                onEdit={(id, data) => onEditActivity(day.id, id, data)}
                onDelete={(id) => onDeleteActivity(day.id, id)}
                onEditDay={(data) => onEditDay(day.id, data)}
                onDeleteDay={() => onDeleteDay(day.id)}
                onUploadImage={onUploadImage}
                onRemoveImage={onRemoveImage}
              />
            </motion.div>
          ))}
          <AddDayButton onClick={() => setShowAddDay(true)} />
        </div>
      )}

      <CreateDayModal
        open={showAddDay}
        onClose={() => setShowAddDay(false)}
        onSubmit={(label, subtitle, date) => { onAddDay(label, subtitle, date); setShowAddDay(false) }}
      />
    </motion.div>
  )
}
