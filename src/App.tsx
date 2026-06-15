import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, RotateCcw, Scroll, Swords } from 'lucide-react'
import { useState } from 'react'
import { useItinerary } from './hooks/useItinerary'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { BadgesPanel } from './components/BadgesPanel'
import { TrackSelector } from './components/TrackSelector'
import { Roadmap } from './components/Roadmap'
import { SyncBanner } from './components/SyncBanner'
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
      className="pointer-events-none fixed left-1/2 top-1/3 z-50 font-display text-4xl font-black text-amber-500 drop-shadow-lg"
    >
      +{amount} XP
    </motion.div>
  )
}

export default function App() {
  const {
    trip,
    tripList,
    tracks,
    xp,
    badges,
    stats,
    loading,
    error,
    synced,
    syncing,
    useDb,
    uploadingId,
    notificationPermission,
    selectTrip,
    createTrip,
    updateTripName,
    deleteTrip,
    createTrack,
    updateTrack,
    deleteTrack,
    addDay,
    updateDay,
    deleteDay,
    addActivity,
    updateActivity,
    removeActivity,
    toggleActivity,
    resetProgress,
    uploadImage,
    removeImage,
    clearError,
    refresh,
    requestNotifications,
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
    const activity = tracks
      .flatMap((t) => t.days)
      .flatMap((d) => d.activities)
      .find((a) => a.id === activityId)
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
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-purple absolute -left-32 top-0 h-[480px] w-[480px] rounded-full blur-[100px]" />
        <div className="ambient-orange absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
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
  <div className='mt-4 flex items-center gap-2'>
  </div>

        <TripHub
          trips={tripList}
          activeId={trip?.id ?? null}
          onSelect={selectTrip}
          onCreate={createTrip}
          onDelete={deleteTrip}
        />

        {/* Quest progress bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel-subtle mt-4 flex items-center gap-3 rounded-2xl px-4 py-3">
          <Swords className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-fg-muted">Campaign Progress</span>
              <span className="font-bold text-accent">{stats.percent}%</span>
            </div>
            <div className="xp-bar mt-1.5 h-2 overflow-hidden rounded-full">
              <motion.div className="xp-fill h-full rounded-full" animate={{ width: `${stats.percent}%` }} transition={{ duration: 0.6 }} />
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="space-y-6">
            {tracks.length === 0 ? (
              <div className="panel rounded-3xl py-16 text-center">
                <Scroll className="mx-auto mb-3 h-12 w-12 text-fg-muted opacity-40" />
                <p className="font-display text-lg font-bold text-fg">No chapters yet</p>
                <p className="mt-1 text-sm text-fg-muted">Add a quest chapter to start building your itinerary</p>
                <button
                  onClick={() => createTrack('Chapter 1', 'Your first adventure')}
                  className="btn-primary mt-6 rounded-2xl px-6 py-2.5 text-sm font-bold text-white"
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

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <BadgesPanel badges={badges} />
            <div className="panel rounded-2xl p-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.15em] text-fg-muted">Stats</h3>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-fg-muted">Quests</dt><dd className="font-bold">{stats.total}</dd></div>
                <div className="flex justify-between"><dt className="text-fg-muted">Cleared</dt><dd className="font-bold text-emerald-500">{stats.completed}</dd></div>
                <div className="flex justify-between"><dt className="text-fg-muted">Chapters</dt><dd className="font-bold">{tracks.length}</dd></div>
              </dl>
            </div>
            <button onClick={() => setShowReset(!showReset)} className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs">
              <RotateCcw className="h-3 w-3" />Reset all progress
            </button>
            {showReset && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-center text-xs">
                <p className="text-fg-muted">Unchecks all quests & removes photos. Keeps your itinerary structure.</p>
                <button onClick={() => { resetProgress(); setShowReset(false) }} className="mt-2 rounded-lg bg-red-500 px-4 py-1.5 font-semibold text-white">Confirm</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={editTripOpen} onClose={() => setEditTripOpen(false)} title="Rename Trip">
        <FormInput value={tripName} onChange={(e) => setTripName(e.target.value)} />
        <FormActions onCancel={() => setEditTripOpen(false)} onSubmit={() => { updateTripName(tripName); setEditTripOpen(false) }} />
      </Modal>

      <AnimatePresence>{xpPopup && <XPPopup amount={xpPopup} />}</AnimatePresence>
    </div>
  )
}
