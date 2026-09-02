import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventRecord } from '@/types/event'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDateShort } from '@/utils/dateFormatter'
import { Spinner } from '@/components/common/Spinner'

interface EventsTableProps {
  events: EventRecord[]
  downloadingId: string | null
  onDownloadPdf: (event: EventRecord) => void
  onDownloadDocx: (event: EventRecord) => void
  onDuplicate: (event: EventRecord) => void
  onDelete: (event: EventRecord) => void
}

export function EventsTable({
  events,
  downloadingId,
  onDownloadPdf,
  onDownloadDocx,
  onDuplicate,
  onDelete,
}: EventsTableProps) {
  const navigate = useNavigate()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Event Name</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">{event.eventName}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateShort(event.eventDate)}</td>
                <td className="px-4 py-3 text-slate-600">{event.venue}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={event.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {event.createdAt ? formatDateShort(event.createdAt.slice(0, 10)) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                    >
                      {downloadingId === event.id ? <Spinner size={14} /> : 'Actions ▾'}
                    </button>
                    {openMenuId === event.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                          <MenuAction label="View" onClick={() => navigate(`/events/${event.id}`)} />
                          <MenuAction label="Edit" onClick={() => navigate(`/circulars/${event.id}/edit`)} />
                          <MenuAction
                            label="Duplicate"
                            onClick={() => {
                              onDuplicate(event)
                              setOpenMenuId(null)
                            }}
                          />
                          <MenuAction
                            label="Download PDF"
                            onClick={() => {
                              onDownloadPdf(event)
                              setOpenMenuId(null)
                            }}
                          />
                          <MenuAction
                            label="Download DOCX"
                            onClick={() => {
                              onDownloadDocx(event)
                              setOpenMenuId(null)
                            }}
                          />
                          <MenuAction
                            label="Delete"
                            danger
                            onClick={() => {
                              onDelete(event)
                              setOpenMenuId(null)
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MenuAction({
  label,
  onClick,
  danger,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
        danger ? 'text-red-600' : 'text-slate-700'
      }`}
    >
      {label}
    </button>
  )
}
