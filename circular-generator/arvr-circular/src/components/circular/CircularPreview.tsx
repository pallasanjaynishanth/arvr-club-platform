import { forwardRef, useState } from 'react'
import { EventFormData } from '@/types/event'
import { CircularTemplate } from '@/templates/circular/CircularTemplate'

interface CircularPreviewProps {
  event: EventFormData
  referenceNumber: string
  circularDate: string
}

const ZOOM_STEPS = [0.4, 0.5, 0.6, 0.75, 0.9, 1]

export const CircularPreview = forwardRef<HTMLDivElement, CircularPreviewProps>(
  ({ event, referenceNumber, circularDate }, ref) => {
    const [zoomIndex, setZoomIndex] = useState(2) // default ~0.6

    const zoom = ZOOM_STEPS[zoomIndex]

    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <p className="text-sm font-semibold text-navy-700">Live Preview</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="w-10 text-center text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
              className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomIndex(2)}
              className="ml-1 rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Fit
            </button>
          </div>
        </div>
        <div className="circular-preview-wrapper flex-1">
          <div
            className="circular-preview-shadow origin-top"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease' }}
          >
            <CircularTemplate
              ref={ref}
              event={event}
              referenceNumber={referenceNumber}
              circularDate={circularDate}
            />
          </div>
        </div>
      </div>
    )
  }
)

CircularPreview.displayName = 'CircularPreview'
