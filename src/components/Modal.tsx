import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="quest-modal relative w-full max-w-md overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xl"
          >
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg sm:text-xl md:text-xl font-bold text-fg">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 sm:p-1.5 text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
              >
                <X className="h-4 sm:h-5 w-4 sm:w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface FormFieldProps {
  label: string
  children: ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-xs sm:text-xs font-semibold uppercase tracking-wider text-fg-muted">{label}</span>
      {children}
    </label>
  )
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input-field w-full rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm ${props.className ?? ''}`} />
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`input-field w-full resize-none rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm ${props.className ?? ''}`}
    />
  )
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`input-field w-full rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm ${props.className ?? ''}`} />
}

export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  danger,
}: {
  onCancel: () => void
  onSubmit: () => void
  submitLabel?: string
  danger?: boolean
}) {
  return (
    <div className="mt-3 sm:mt-4 md:mt-5 flex gap-2">
      <button type="button" onClick={onCancel} className="btn-ghost flex-1 rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm">
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className={`flex-1 rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white ${
          danger ? 'bg-red-500 hover:bg-red-600' : 'btn-primary'
        }`}
      >
        {submitLabel}
      </button>
    </div>
  )
}
