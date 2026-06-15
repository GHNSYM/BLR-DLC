import { motion } from 'framer-motion'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ItineraryTrack } from '../types'
import { FormActions, FormInput, FormTextarea, Modal } from './Modal'

interface TrackSelectorProps {
  tracks: ItineraryTrack[]
  activeId: string
  onSelect: (id: string) => void
  onCreate: (title: string, description: string) => void
  onEdit: (trackId: string, title: string, description: string) => void
  onDelete: (trackId: string) => void
}

export function TrackSelector({
  tracks,
  activeId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: TrackSelectorProps) {
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editId, setEditId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const openCreate = () => {
    setTitle('')
    setDescription('')
    setModal('create')
  }

  const openEdit = (track: ItineraryTrack) => {
    setEditId(track.id)
    setTitle(track.title)
    setDescription(track.description)
    setModal('edit')
  }

  const submit = () => {
    if (!title.trim()) return
    if (modal === 'create') onCreate(title.trim(), description.trim() || 'A new chapter')
    if (modal === 'edit') onEdit(editId, title.trim(), description.trim())
    setModal(null)
  }

  return (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-fg-muted">
            Quest Chapters
          </h3>
          <button
            onClick={openCreate}
            className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add chapter
          </button>
        </div>

        <div className="chapter-scroll flex gap-3 overflow-x-auto pt-2 -mx-1 px-1 -mb-2">
          {tracks.map((track, i) => {
            const total = track.days.flatMap((d) => d.activities).length
            const done = track.days.flatMap((d) => d.activities).filter((a) => a.completed).length
            const pct = total ? Math.round((done / total) * 100) : 0
            const active = track.id === activeId

            return (
              <motion.button
                key={track.id}
                onClick={() => onSelect(track.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative min-w-[170px] shrink-0 overflow-hidden rounded-2xl border p-4 text-left
                  transition-all duration-200 hover:-translate-y-1
                  ${active ? 'track-active' : 'track-idle'}`}
                style={active
                  ? { borderColor: `${track.accent}70`, boxShadow: `0 0 0 1px ${track.accent}30, 0 4px 20px -4px ${track.accent}30` }
                  : {}
                }
              >
                {active && (
                  <motion.div
                    layoutId="chapter-glow"
                    className="absolute inset-0"
                    style={{ backgroundColor: `${track.accent}20` }} // 20 = 12% opacity in hex
                  />
                )}

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl drop-shadow-sm">{track.emoji}</span>
                    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); openEdit(track) }}
                        className="rounded p-1 text-fg-muted hover:text-accent"
                      >
                        <Pencil className="h-3 w-3" />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete chapter "${track.title}"?`)) onDelete(track.id)
                        }}
                        className="rounded p-1 text-fg-muted hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-2 font-display text-sm font-bold text-fg">{track.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-fg-muted">{track.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="xp-bar h-1.5 flex-1 overflow-hidden rounded-full">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: track.accent }}
                        animate={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: track.accent }}>{pct}%</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'New Chapter' : 'Edit Chapter'}
      >
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-muted">Title</span>
            <FormInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goa Quest" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-muted">Description</span>
            <FormTextarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beaches, forts & nightlife" />
          </label>
        </div>
        <FormActions onCancel={() => setModal(null)} onSubmit={submit} />
      </Modal>
    </>
  )
}
