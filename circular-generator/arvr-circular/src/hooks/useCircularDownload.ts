import { useRef, useState, useCallback } from 'react'
import { EventRecord } from '@/types/event'
import { generateCircularPdf } from '@/services/pdfService'
import { generateCircularDocx } from '@/services/docxService'

const HIDDEN_RENDER_TIMEOUT_MS = 5000

/**
 * Generates downloads for events from the dashboard by rendering the exact
 * same circular template in an off-screen DOM node used by the editor.
 */
export function useCircularDownload() {
  const hiddenRef = useRef<HTMLDivElement>(null)
  const [renderingEvent, setRenderingEvent] = useState<EventRecord | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const resolverRef = useRef<(() => void) | null>(null)

  const downloadPdf = useCallback(async (event: EventRecord) => {
    setDownloadingId(event.id)
    setRenderingEvent(event)

    try {
      await new Promise<void>((resolve, reject) => {
        resolverRef.current = resolve
        window.setTimeout(() => {
          if (resolverRef.current) {
            resolverRef.current = null
            reject(new Error('Timed out while preparing the circular preview.'))
          }
        }, HIDDEN_RENDER_TIMEOUT_MS)
      })

      if (!hiddenRef.current) {
        throw new Error('Could not find the circular preview.')
      }

      await generateCircularPdf(hiddenRef.current, event.eventName, event.eventDate)
    } finally {
      resolverRef.current = null
      setRenderingEvent(null)
      setDownloadingId(null)
    }
  }, [])

  const downloadDocx = useCallback(async (event: EventRecord) => {
    setDownloadingId(event.id)
    try {
      await generateCircularDocx(
        event,
        event.referenceNumber,
        event.circularGeneratedDate
      )
    } finally {
      setDownloadingId(null)
    }
  }, [])

  const onHiddenRendered = useCallback(() => {
    resolverRef.current?.()
    resolverRef.current = null
  }, [])

  return {
    hiddenRef,
    renderingEvent,
    downloadingId,
    downloadPdf,
    downloadDocx,
    onHiddenRendered,
  }
}
