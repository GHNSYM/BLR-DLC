import { motion } from "framer-motion";
import { Map, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Trip } from "../types";
import { FormActions, FormInput, Modal } from "./Modal";

interface TripHubProps {
  trips: Trip[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

export function TripHub({
  trips,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: TripHubProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
    setShowCreate(false);
  };

  return (
    <>
      <div className="panel rounded-lg md:rounded-xl lg:rounded-2xl p-3 md:p-4">
        <div className="mb-2 md:mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Map className="h-4 w-4 text-accent" />
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fg-secondary">
              Trips
            </h3>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>

        <div className="flex gap-2 md:gap-2 overflow-x-auto pb-1 chapter-scroll">
          {trips.map((t) => {
            const active = t.id === activeId;
            return (
              <motion.div
                key={t.id}
                whileHover={{ scale: 1.02 }}
                className={`group relative min-w-[110px] md:min-w-[140px] shrink-0 rounded-lg md:rounded-xl border p-2 md:p-3 transition-all text-xs ${
                  active ? "track-active" : "track-idle cursor-pointer"
                }`}
                onClick={() => onSelect(t.id)}
              >
                <p className="font-display font-bold text-fg truncate text-sm">
                  {t.name}
                </p>
                <p className="mt-0.5 text-[10px] text-fg-muted">
                  {t.xp} XP
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${t.name}" and all its quests?`))
                      onDelete(t.id);
                  }}
                  className="absolute right-1.5 md:right-2 top-1.5 md:top-2 rounded p-0.5 md:p-1 text-fg-muted opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 md:h-3 w-3 md:w-3" />
                </button>
              </motion.div>
            );
          })}
          {trips.length === 0 && (
            <p className="py-2 text-xs text-fg-muted">No trips</p>
          )}
        </div>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Adventure"
      >
        <FormInput
          autoFocus
          placeholder="e.g. Banglore DLC — July 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <FormActions
          onCancel={() => setShowCreate(false)}
          onSubmit={handleCreate}
          submitLabel="Create trip"
        />
      </Modal>
    </>
  );
}
