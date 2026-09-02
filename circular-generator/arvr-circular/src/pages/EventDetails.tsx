import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/common/AppShell'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { CircularPreview } from '@/components/circular/CircularPreview'
import { FullPageSpinner } from '@/components/common/Spinner'
import { useToast } from '@/components/common/Toast'
import { EventRecord } from '@/types/event'
import { getEvent } from '@/services/eventService'
import { generateCircularPdf } from '@/services/pdfService'
import { generateCircularDocx } from '@/services/docxService'

export default function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [event, setEvent] = useState<EventRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    getEvent(id)
      .then((data) => {
        if (!data) {
          showToast('That event could not be found.', 'error')
          navigate('/events')
          return
        }
        setEvent(data)
      })
      .catch(() => showToast('Could not load this event.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <FullPageSpinner label="Loading event…" />
  if (!event) return null

  async function handleDownloadPdf() {
    if (!previewRef.current || !event) return
    setDownloadingPdf(true)
    try {
      await generateCircularPdf(previewRef.current, event.eventName, event.eventDate)
    } catch {
      showToast('Could not generate the PDF. Please try again.', 'error')
    } finally {
      setDownloadingPdf(false)
    }
  }

  async function handleDownloadDocx() {
    if (!event) return
    setDownloadingDocx(true)
    try {
      await generateCircularDocx(event, event.referenceNumber, event.circularGeneratedDate)
    } catch {
      showToast('Could not generate the DOCX file. Please try again.', 'error')
    } finally {
      setDownloadingDocx(false)
    }
  }

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => navigate('/events')} className="text-sm text-slate-500 hover:text-navy-700">
            ← Back to Saved Events
          </button>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold text-navy-800">{event.eventName}</h1>
            <StatusBadge status={event.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(`/circulars/${event.id}/edit`)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={handleDownloadDocx} loading={downloadingDocx}>
            Download DOCX
          </Button>
          <Button onClick={handleDownloadPdf} loading={downloadingPdf}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <CircularPreview
          ref={previewRef}
          event={event}
          referenceNumber={event.referenceNumber}
          circularDate={event.circularGeneratedDate}
        />
      </div>
    </AppShell>
  )
}
