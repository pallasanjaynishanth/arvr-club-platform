import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/common/AppShell'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { EventsTable } from '@/components/dashboard/EventsTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { EventRecord } from '@/types/event'
import { listEvents, deleteEvent, duplicateEvent } from '@/services/eventService'
import { useCircularDownload } from '@/hooks/useCircularDownload'
import { CircularTemplate } from '@/templates/circular/CircularTemplate'
import { inputClass } from '@/components/forms/FormField'

type FilterOption = 'all' | 'draft' | 'generated'

export default function EventsList() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { hiddenRef, renderingEvent, downloadingId, downloadPdf, downloadDocx, onHiddenRendered } =
    useCircularDownload()

  async function refresh() {
    setLoading(true)
    try {
      setEvents(await listEvents())
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

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-navy-800">Saved Events</h1>
          <p className="text-sm text-slate-500">All circulars created for ARVR Club events.</p>
        </div>
        <Button onClick={() => navigate('/circulars/new')}>+ Create New Circular</Button>
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
      ) : filtered.length === 0 ? (
        <EmptyState title="No events found" description="Try a different search term or filter." />
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
