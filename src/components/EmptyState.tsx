import { motion } from 'framer-motion'
import { AlertCircle, Map, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { FormActions, FormInput, Modal } from './Modal'

interface EmptyStateProps {
  onCreateTrip: (name: string) => void
  error?: string | null
  onDismissError?: () => void
}

export function EmptyState({ onCreateTrip, error, onDismissError }: EmptyStateProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Banglore DLC')

  const submit = () => {
    if (!name.trim()) return
    onCreateTrip(name.trim())
    setOpen(false)
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="panel max-w-md rounded-3xl p-10"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-soft">
          <Map className="h-10 w-10 text-accent" />
        </div>
        <h2 className="font-display text-3xl font-extrabold">
          <span className="shimmer-text">Start Your Adventure</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Create a trip, add chapters, plan days, and build quests together.
        </p>
        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-left text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p>{error}</p>
              {onDismissError && (
                <button type="button" onClick={onDismissError} className="mt-1 font-semibold underline">
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          className="btn-primary mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
        >
          <Plus className="h-5 w-5" />
          Create your first trip
        </button>
        <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-fg-muted">
          <Sparkles className="h-3 w-3" />
          Then add chapters → days → quests
        </p>
      </motion.div>

      <Modal open={open} onClose={() => setOpen(false)} title="Name Your Adventure">
        <FormInput autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <FormActions onCancel={() => setOpen(false)} onSubmit={submit} submitLabel="Let's go!" />
      </Modal>
    </div>
  )
}
