import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, RotateCcw, Scroll, Swords } from 'lucide-react'
import { useState } from 'react'
import { useItinerary } from './hooks/useItinerary'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { BadgesPanel } from './components/BadgesPanel'
import { TrackSelector } from './components/TrackSelector'
import { Roadmap } from './components/Roadmap'
import { TripHub } from './components/TripHub'
import { EmptyState } from './components/EmptyState'
import { FormActions, FormInput, Modal } from './components/Modal'

function XPPopup({ amount }: { amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.3 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="pointer-events-none fixed left-1/2 top-1/3 z-50 -translate-x-1/2 whitespace-nowrap font-display text-3xl font-black text-amber-500 drop-shadow-lg"
    >
      +{amount} XP
    </motion.div>
  )
}

export default function App() {
  const {
    trip, tripList, tracks, xp, badges, stats, loading, error,
    synced, syncing, useDb, uploadingId, notificationPermission,
    selectTrip, createTrip, updateTripName, deleteTrip,
    createTrack, updateTrack, deleteTrack,
    addDay, updateDay, deleteDay,
    addActivity, updateActivity, removeActivity,
    toggleActivity, resetProgress, uploadImage, removeImage,
    clearError, refresh, requestNotifications,
  } = useItinerary()

  const { theme, toggleTheme } = useTheme()
  const [activeTrackId, setActiveTrackId] = useState('')
  const [xpPopup, setXpPopup] = useState<number | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [editTripOpen, setEditTripOpen] = useState(false)
  const [tripName, setTripName] = useState('')

  const resolvedTrackId = activeTrackId || tracks[0]?.id || ''
  const activeTrack = tracks.find((t) => t.id === resolvedTrackId)

  const handleToggle = (trackId: string, dayId: string, activityId: string) => {
    const activity = tracks.flatMap((t) => t.days).flatMap((d) => d.activities).find((a) => a.id === activityId)
    const wasCompleted = activity?.completed
    toggleActivity(trackId, dayId, activityId)
    if (!wasCompleted && activity) {
      setXpPopup(activity.xp)
      setTimeout(() => setXpPopup(null), 1200)
    }
  }

  if (!useDb) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app p-6 text-center">
        <div className="panel max-w-sm rounded-3xl p-8">
          <p className="font-display text-lg font-bold text-fg">Supabase required</p>
          <p className="mt-2 text-sm text-fg-muted">Add your keys to <code className="text-accent">.env</code> and restart the dev server.</p>
        </div>
      </div>
    )
  }

  if (loading && !trip && tripList.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-sm text-fg-muted">Loading from Supabase…</p>
        </div>
      </div>
    )
  }

  if (!trip && tripList.length === 0 && !loading) {
    return <EmptyState onCreateTrip={createTrip} error={error} onDismissError={clearError} />
  }

  return (
    <div className="relative min-h-screen bg-app text-fg">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-purple absolute -left-40 md:-left-32 top-0 h-64 md:h-[480px] w-64 md:w-[480px] rounded-full blur-2xl md:blur-[100px]" />
        <div className="ambient-orange absolute -right-40 md:-right-32 top-1/4 h-64 md:h-[400px] w-64 md:w-[400px] rounded-full blur-2xl md:blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 space-y-4 md:space-y-6">

        <Header
          trip={trip}
          xp={xp}
          completed={stats.completed}
          total={stats.total}
          theme={theme}
          onToggleTheme={toggleTheme}
          notificationPermission={notificationPermission}
          onEnableNotifications={requestNotifications}
          onEditTrip={() => { setTripName(trip?.name ?? ''); setEditTripOpen(true) }}
          loading={loading}
          synced={synced}
          syncing={syncing}
          useDb={useDb}
          syncError={error}
          onRefresh={refresh}
          onDismissSyncError={clearError}
        />

        <TripHub
          trips={tripList}
          activeId={trip?.id ?? null}
          onSelect={selectTrip}
          onCreate={createTrip}
          onDelete={deleteTrip}
        />

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="panel-subtle flex items-center gap-3 rounded-xl px-4 py-3"
        >
          <Swords className="h-4 w-4 text-accent shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-fg-muted">Campaign Progress</span>
              <span className="font-bold text-accent">{stats.percent}%</span>
            </div>
            <div className="xp-bar mt-1.5 h-1.5 overflow-hidden rounded-full">
              <motion.div
                className="xp-fill h-full rounded-full"
                animate={{ width: `${stats.percent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_220px]">

          {/* Left: chapters + roadmap */}
          <div className="space-y-4 md:space-y-6 min-w-0">
            {tracks.length === 0 ? (
              <div className="panel rounded-xl py-12 px-4 text-center">
                <Scroll className="mx-auto mb-3 h-10 w-10 text-fg-muted opacity-40" />
                <p className="font-display text-lg font-bold text-fg">No chapters yet</p>
                <p className="mt-1 text-sm text-fg-muted">Add a quest chapter to start building</p>
                <button
                  onClick={() => createTrack('Chapter 1', 'Your first adventure')}
                  className="btn-primary mt-5 rounded-xl px-6 py-2.5 text-sm font-bold text-white"
                >
                  + Add first chapter
                </button>
              </div>
            ) : (
              <>
                <TrackSelector
                  tracks={tracks}
                  activeId={resolvedTrackId}
                  onSelect={setActiveTrackId}
                  onCreate={createTrack}
                  onEdit={(id, title, desc) => updateTrack(id, { title, description: desc })}
                  onDelete={deleteTrack}
                />
                <AnimatePresence mode="wait">
                  {activeTrack && (
                    <Roadmap
                      key={activeTrack.id}
                      track={activeTrack}
                      uploadingId={uploadingId}
                      onToggle={(dayId, activityId) => handleToggle(activeTrack.id, dayId, activityId)}
                      onAddActivity={(_d, data) => addActivity(activeTrack.id, _d, data)}
                      onEditActivity={(_d, actId, data) => updateActivity(actId, data)}
                      onDeleteActivity={(_d, actId) => removeActivity(activeTrack.id, _d, actId)}
                      onAddDay={(label, sub, date) => addDay(activeTrack.id, label, sub, date)}
                      onEditDay={(dayId, data) => updateDay(dayId, data)}
                      onDeleteDay={(dayId) => deleteDay(dayId)}
                      onUploadImage={uploadImage}
                      onRemoveImage={removeImage}
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Right sidebar — desktop sticky, mobile inline at bottom */}
          <div className="space-y-3 md:sticky md:top-6 md:self-start">
            <BadgesPanel badges={badges} />

            {/* Stats */}
            <div className="panel rounded-xl p-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fg-muted">Stats</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Quests</dt>
                  <dd className="font-bold">{stats.total}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Cleared</dt>
                  <dd className="font-bold text-emerald-500">{stats.completed}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Chapters</dt>
                  <dd className="font-bold">{tracks.length}</dd>
                </div>
              </dl>
            </div>

            {/* Reset */}
            <button
              onClick={() => setShowReset(!showReset)}
              className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Reset progress
            </button>
            {showReset && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-center text-xs">
                <p className="text-fg-muted">Unchecks all quests & removes photos.</p>
                <button
                  onClick={() => { resetProgress(); setShowReset(false) }}
                  className="mt-2 rounded-lg bg-red-500 px-3 py-1.5 font-semibold text-white"
                >
                  Confirm reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={editTripOpen} onClose={() => setEditTripOpen(false)} title="Rename Trip">
        <FormInput value={tripName} onChange={(e) => setTripName(e.target.value)} />
        <FormActions
          onCancel={() => setEditTripOpen(false)}
          onSubmit={() => { updateTripName(tripName); setEditTripOpen(false) }}
        />
      </Modal>

      <AnimatePresence>{xpPopup && <XPPopup amount={xpPopup} />}</AnimatePresence>
    </div>
  )
}