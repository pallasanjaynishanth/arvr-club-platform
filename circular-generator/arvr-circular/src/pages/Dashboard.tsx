import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/common/AppShell'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/components/dashboard/StatCard'
import { EventsTable } from '@/components/dashboard/EventsTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { EventRecord } from '@/types/event'
import { listEvents, deleteEvent, duplicateEvent, createDraftEvent } from '@/services/eventService'
import { useCircularDownload } from '@/hooks/useCircularDownload'
import { CircularTemplate } from '@/templates/circular/CircularTemplate'
import { DEMO_EVENT } from '@/utils/demoData'
import { inputClass } from '@/components/forms/FormField'

type FilterOption = 'all' | 'draft' | 'generated'

export default function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const {
    hiddenRef,
    renderingEvent,
    downloadingId,
    downloadPdf,
    downloadDocx,
    onHiddenRendered,
  } = useCircularDownload()

  async function refresh() {
    setLoading(true)
    try {
      const data = await listEvents()
      setEvents(data)
    } catch {
      showToast('Could not load events. Please check your connection.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (renderingEvent) {
      // Let the hidden node paint before capturing it.
      const id = requestAnimationFrame(() => requestAnimationFrame(onHiddenRendered))
      return () => cancelAnimationFrame(id)
    }
  }, [renderingEvent, onHiddenRendered])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filter !== 'all' && e.status !== filter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return e.eventName.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
      }
      return true
    })
  }, [events, filter, search])

  const stats = useMemo(
    () => ({
      total: events.length,
      draft: events.filter((e) => e.status === 'draft').length,
      generated: events.filter((e) => e.status === 'generated').length,
    }),
    [events]
  )

  async function handleDuplicate(event: EventRecord) {
    try {
      const id = await duplicateEvent(event)
      showToast('Event duplicated as a new draft.', 'success')
      navigate(`/circulars/${id}/edit`)
    } catch {
      showToast('Could not duplicate this event. Please try again.', 'error')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEvent(deleteTarget.id)
      showToast('Event deleted.', 'success')
      setDeleteTarget(null)
      refresh()
    } catch {
      showToast('Could not delete this event. Please try again.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function handleLoadDemo() {
    setSeeding(true)
    try {
      const id = await createDraftEvent(DEMO_EVENT)
      showToast('Sample event added.', 'success')
      navigate(`/circulars/${id}/edit`)
    } catch {
      showToast('Could not add the sample event. Please try again.', 'error')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-navy-800">Dashboard</h1>
          <p className="text-sm text-slate-500">ARVR Club circular activity at a glance.</p>
        </div>
        <Button onClick={() => navigate('/circulars/new')}>+ Create New Circular</Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Events" value={stats.total} />
        <StatCard label="Draft Circulars" value={stats.draft} />
        <StatCard label="Generated Circulars" value={stats.generated} />
        <StatCard label="Latest Event" value={events[0]?.eventName ?? '—'} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(['all', 'draft', 'generated'] as FilterOption[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
                filter === f ? 'bg-navy-700 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          className={`${inputClass()} max-w-xs`}
          placeholder="Search by event name or venue…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No circulars yet"
          description="Create your first circular, or load a sample event to see how the template looks."
          action={
            <div className="flex justify-center gap-2">
              <Button onClick={() => navigate('/circulars/new')}>+ Create New Circular</Button>
              <Button variant="secondary" onClick={handleLoadDemo} loading={seeding}>
                Load Sample Event
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching events" description="Try a different search term or filter." />
      ) : (
        <EventsTable
          events={filtered}
          downloadingId={downloadingId}
          onDownloadPdf={downloadPdf}
          onDownloadDocx={downloadDocx}
          onDuplicate={handleDuplicate}
          onDelete={(e) => setDeleteTarget(e)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this event?"
        description={`"${deleteTarget?.eventName}" and its circular data will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Off-screen renderer used to generate PDFs for events not currently open in the editor */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1 }}>
        {renderingEvent && (
          <CircularTemplate
            ref={hiddenRef}
            event={renderingEvent}
            referenceNumber={renderingEvent.referenceNumber}
            circularDate={renderingEvent.circularGeneratedDate}
          />
        )}
      </div>
    </AppShell>
  )
}
