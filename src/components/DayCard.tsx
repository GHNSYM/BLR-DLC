import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { DayPlan } from '../types'
import {
  ActivityItem,
  AddActivityButton,
  CreateActivityModal,
  type ActivityFormData,
} from './ActivityItem'
import { FormActions, FormInput, Modal } from './Modal'

interface DayCardProps {
  day: DayPlan
  accent: string
  uploadingId?: string | null
  defaultOpen?: boolean
  onToggle: (activityId: string) => void
  onAdd: (data: ActivityFormData) => void
  onEdit: (activityId: string, data: ActivityFormData) => void
  onDelete: (activityId: string) => void
  onEditDay: (data: { label: string; subtitle?: string; date?: string }) => void
  onDeleteDay: () => void
  onUploadImage?: (activityId: string, file: File) => void
  onRemoveImage?: (activityId: string) => void
}

export function DayCard({
  day,
  accent,
  uploadingId,
  defaultOpen = false,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onEditDay,
  onDeleteDay,
  onUploadImage,
  onRemoveImage,
}: DayCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [showCreate, setShowCreate] = useState(false)
  const [editDayOpen, setEditDayOpen] = useState(false)
  const [label, setLabel] = useState(day.label)
  const [subtitle, setSubtitle] = useState(day.subtitle ?? '')
  const [date, setDate] = useState(day.date)

  const done = day.activities.filter((a) => a.completed).length
  const total = day.activities.length
  const allDone = total > 0 && done === total

  return (
    <>
      <motion.div
        layout
        className={`overflow-hidden rounded-2xl border transition-all ${
          allDone ? 'border-emerald-500/40 bg-emerald-500/[0.04]' : 'quest-card'
        }`}
      >
        <div className="flex items-center gap-2 p-1">
          <button onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left">
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl font-display" style={{ backgroundColor: `${accent}18`, color: accent }}>
              <span className="text-[9px] font-bold uppercase leading-none opacity-70">{day.label.split(',')[0]}</span>
              <span className="text-xl font-extrabold leading-none">{day.label.split(' ').pop()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-fg">{day.label}</h3>
              {day.subtitle && <p className="text-xs text-fg-muted">{day.subtitle}</p>}
              <div className="mt-2 flex items-center gap-2">
                <div className="xp-bar h-2 flex-1 overflow-hidden rounded-full">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: accent }} animate={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
                </div>
                <span className="text-[10px] font-bold text-fg-muted">{done}/{total}</span>
              </div>
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-5 w-5 text-fg-muted" /></motion.div>
          </button>
          <div className="flex shrink-0 flex-col gap-1 pr-2">
            <button onClick={() => { setLabel(day.label); setSubtitle(day.subtitle ?? ''); setDate(day.date); setEditDayOpen(true) }}
              className="rounded-lg p-1.5 text-fg-muted hover:bg-accent-soft hover:text-accent"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => confirm('Delete this day and all its quests?') && onDeleteDay()}
              className="rounded-lg p-1.5 text-fg-muted hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-2 border-t border-border-subtle px-4 pb-4 pt-3">
                {day.activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    accent={accent}
                    uploading={uploadingId === activity.id}
                    onToggle={() => onToggle(activity.id)}
                    onEdit={(data) => onEdit(activity.id, data)}
                    onDelete={() => onDelete(activity.id)}
                    onUploadImage={onUploadImage ? (f) => onUploadImage(activity.id, f) : undefined}
                    onRemoveImage={onRemoveImage && activity.imageUrl ? () => onRemoveImage(activity.id) : undefined}
                  />
                ))}
                <AddActivityButton onClick={() => setShowCreate(true)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <CreateActivityModal open={showCreate} onClose={() => setShowCreate(false)} onSubmit={onAdd} />

      <Modal open={editDayOpen} onClose={() => setEditDayOpen(false)} title="Edit Day">
        <div className="space-y-3">
          <label className="block space-y-1"><span className="text-xs font-semibold text-fg-muted">Label</span>
            <FormInput value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="block space-y-1"><span className="text-xs font-semibold text-fg-muted">Subtitle</span>
            <FormInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </label>
          <label className="block space-y-1"><span className="text-xs font-semibold text-fg-muted">Date</span>
            <FormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <FormActions onCancel={() => setEditDayOpen(false)} onSubmit={() => { onEditDay({ label, subtitle: subtitle || undefined, date }); setEditDayOpen(false) }} />
      </Modal>
    </>
  )
}

export function AddDayButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      className="dashed-btn flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-fg-muted hover:text-accent">
      <Plus className="h-4 w-4" />Add day to this chapter
    </motion.button>
  )
}

export function CreateDayModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (label: string, subtitle?: string, date?: string) => void
}) {
  const [label, setLabel] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const submit = () => {
    if (!label.trim()) return
    onSubmit(label.trim(), subtitle || undefined, date)
    setLabel('')
    setSubtitle('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Day">
      <div className="space-y-3">
        <label className="block space-y-1"><span className="text-xs font-semibold text-fg-muted">Label</span>
          <FormInput placeholder="Sat, Jul 4" value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="block space-y-1"><span className="text-xs font-semibold text-fg-muted">Subtitle</span>
          <FormInput placeholder="Beaches & forts" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </label>
        <label className="block space-y-1"><span className="text-xs font-semibold text-fg-muted">Date</span>
          <FormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <FormActions onCancel={onClose} onSubmit={submit} submitLabel="Add day" />
    </Modal>
  )
}
