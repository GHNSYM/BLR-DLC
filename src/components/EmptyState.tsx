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
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-2 sm:px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="panel max-w-sm md:max-w-md rounded-lg sm:rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-10"
      >
        <div className="mx-auto mb-4 sm:mb-5 md:mb-6 flex h-16 sm:h-18 md:h-20 w-16 sm:w-18 md:w-20 items-center justify-center rounded-lg sm:rounded-2xl md:rounded-3xl bg-accent-soft">
          <Map className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 text-accent" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold">
          <span className="shimmer-text">Start Adventure</span>
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-fg-muted">
          Create a trip, add chapters, plan days, and build quests.
        </p>
        {error && (
          <div className="mt-3 sm:mt-4 md:mt-5 flex items-start gap-2 rounded-lg sm:rounded-xl border border-red-500/25 bg-red-500/10 px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-3.5 sm:h-4 w-3.5 sm:w-4 shrink-0" />
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
          className="btn-primary mt-5 sm:mt-6 md:mt-8 flex w-full items-center justify-center gap-2 rounded-lg sm:rounded-xl md:rounded-2xl py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm font-bold text-white"
        >
          <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
          Create trip
        </button>
        <p className="mt-2.5 sm:mt-3 md:mt-4 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-fg-muted">
          <Sparkles className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
          Chapters → Days → Quests
        </p>
      </motion.div>

      <Modal open={open} onClose={() => setOpen(false)} title="Name Your Adventure">
        <FormInput autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <FormActions onCancel={() => setOpen(false)} onSubmit={submit} submitLabel="Let's go!" />
      </Modal>
    </div>
  )
}
