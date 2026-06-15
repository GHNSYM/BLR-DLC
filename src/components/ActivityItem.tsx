import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Clock,
  ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  CATEGORY_META,
  TAG_META,
  type Activity,
  type ActivityCategory,
  type ActivityTag,
} from "../types";
import {
  FormActions,
  FormInput,
  FormSelect,
  FormTextarea,
  Modal,
} from "./Modal";

export type ActivityFormData = {
  title: string;
  description?: string;
  time?: string;
  location?: string;
  category: ActivityCategory;
  tag: ActivityTag;
  xp?: number;
};

interface ActivityItemProps {
  activity: Activity;
  accent: string;
  uploading?: boolean;
  onToggle: () => void;
  onEdit: (data: ActivityFormData) => void;
  onDelete: () => void;
  onUploadImage?: (file: File) => void;
  onRemoveImage?: () => void;
}

export function ActivityItem({
  activity,
  accent,
  uploading,
  onToggle,
  onEdit,
  onDelete,
  onUploadImage,
  onRemoveImage,
}: ActivityItemProps) {
  const cat = CATEGORY_META[activity.category];
  const tag = TAG_META[activity.tag];
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<ActivityFormData>({
    title: activity.title,
    description: activity.description,
    time: activity.time,
    location: activity.location,
    category: activity.category,
    tag: activity.tag,
    xp: activity.xp,
  });

  const openEdit = () => {
    setForm({
      title: activity.title,
      description: activity.description,
      time: activity.time,
      location: activity.location,
      category: activity.category,
      tag: activity.tag,
      xp: activity.xp,
    });
    setEditOpen(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative overflow-hidden rounded-lg md:rounded-2xl border transition-all ${
          activity.completed
            ? "border-emerald-500/40 bg-emerald-500/[0.06]"
            : "interactive-item"
        }`}
      >
        <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3.5">
          <motion.button
            onClick={onToggle}
            whileTap={{ scale: 0.85 }}
            className={`quest-node mt-0.5 flex h-5 w-5 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-md md:rounded-lg border-2 transition-all ${
              activity.completed
                ? "border-emerald-400 bg-emerald-500 text-white"
                : "border-border bg-surface-raised"
            }`}
            style={
              !activity.completed ? { borderColor: `${accent}88` } : undefined
            }
          >
            {activity.completed && (
              <Check className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
            )}
          </motion.button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-sm md:text-base">{cat.emoji}</span>
              <h4
                className={`text-xs md:text-sm font-semibold leading-snug ${activity.completed ? "text-fg-muted line-through" : "text-fg"}`}
              >
                {activity.title}
              </h4>
            </div>

            {activity.description && (
              <p className="mt-0.5 md:mt-1 text-[11px] md:text-xs leading-relaxed text-fg-muted">
                {activity.description}
              </p>
            )}

            {activity.imageUrl && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="mt-1.5 md:mt-2 block overflow-hidden rounded-lg md:rounded-xl border border-border"
              >
                <img
                  src={activity.imageUrl}
                  alt={activity.title}
                  className="h-24 md:h-28 w-full max-w-sm object-cover transition-transform hover:scale-105"
                />
              </button>
            )}

            <div className="mt-1.5 md:mt-2 flex flex-wrap items-center gap-1 md:gap-2">
              {activity.time && (
                <span className="flex items-center gap-0.5 text-[10px] md:text-[11px] text-fg-muted">
                  <Clock className="h-2.5 md:h-3 w-2.5 md:w-3" />
                  {activity.time}
                </span>
              )}
              {activity.location && (
                <span className="flex items-center gap-0.5 text-[10px] md:text-[11px] text-fg-muted">
                  <MapPin className="h-2.5 md:h-3 w-2.5 md:w-3" />
                  {activity.location}
                </span>
              )}
              <span
                className="rounded-full px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-medium"
                style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
              >
                {tag.label}
              </span>
              <span className="flex items-center gap-0.5 text-[9px] md:text-[10px] font-bold text-amber-500">
                <Zap className="h-2.5 md:h-3 w-2.5 md:w-3" />+{activity.xp}
              </span>
            </div>

            {onUploadImage && (
              <div className="mt-1.5 md:mt-2 flex items-center gap-1 md:gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadImage(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-0.5 md:gap-1 rounded-lg border border-border px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] font-medium text-fg-muted hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-2.5 md:h-3 w-2.5 md:w-3 animate-spin" />
                  ) : activity.imageUrl ? (
                    <ImageIcon className="h-2.5 md:h-3 w-2.5 md:w-3" />
                  ) : (
                    <Camera className="h-2.5 md:h-3 w-2.5 md:w-3" />
                  )}
                  {uploading
                    ? "Uploading…"
                    : activity.imageUrl
                      ? "Change"
                      : "Photo"}
                </button>
                {activity.imageUrl && onRemoveImage && (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={onRemoveImage}
                    className="text-[9px] md:text-[10px] text-fg-muted hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-0.5 md:gap-1 opacity-50 transition-opacity group-hover:opacity-100">
            <button
              onClick={openEdit}
              className="rounded-lg p-1 text-fg-muted hover:bg-accent-soft hover:text-accent md:opacity-0 md:group-hover:opacity-100"
            >
              <Pencil className="h-3 md:h-3.5 w-3 md:w-3.5" />
            </button>
            <button
              onClick={() => confirm("Delete this quest?") && onDelete()}
              className="rounded-lg p-1 md:p-1.5 text-fg-muted hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3 md:h-3.5 w-3 md:w-3.5" />
            </button>
          </div>
        </div>

        {activity.completed && (
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />
        )}
      </motion.div>

      <AnimatePresence>
        {previewOpen && activity.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          >
            <button
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setPreviewOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Quest"
      >
        <ActivityForm form={form} setForm={setForm} />
        <FormActions
          onCancel={() => setEditOpen(false)}
          onSubmit={() => {
            onEdit(form);
            setEditOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

export function ActivityForm({
  form,
  setForm,
}: {
  form: ActivityFormData;
  setForm: (f: ActivityFormData) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-fg-muted">Title</span>
        <FormInput
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-fg-muted">Description</span>
        <FormTextarea
          rows={2}
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-fg-muted">Time</span>
          <FormInput
            value={form.time ?? ""}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-fg-muted">XP</span>
          <FormInput
            type="number"
            value={form.xp ?? 25}
            onChange={(e) => setForm({ ...form, xp: Number(e.target.value) })}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-fg-muted">Location</span>
        <FormInput
          value={form.location ?? ""}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-fg-muted">Category</span>
          <FormSelect
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as ActivityCategory })
            }
          >
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.emoji} {v.label}
              </option>
            ))}
          </FormSelect>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-fg-muted">Who</span>
          <FormSelect
            value={form.tag}
            onChange={(e) =>
              setForm({ ...form, tag: e.target.value as ActivityTag })
            }
          >
            {Object.entries(TAG_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </FormSelect>
        </label>
      </div>
    </div>
  );
}

export function AddActivityButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="dashed-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold text-fg-muted hover:text-accent"
    >
      <Plus className="h-4 w-4" />
      Add quest
    </motion.button>
  );
}

export function CreateActivityModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityFormData) => void;
}) {
  const [form, setForm] = useState<ActivityFormData>({
    title: "",
    category: "sightseeing",
    tag: "together",
    xp: 25,
  });

  const submit = () => {
    if (!form.title.trim()) return;
    onSubmit(form);
    setForm({ title: "", category: "sightseeing", tag: "together", xp: 25 });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Quest">
      <ActivityForm form={form} setForm={setForm} />
      <FormActions
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="Add quest"
      />
    </Modal>
  );
}
