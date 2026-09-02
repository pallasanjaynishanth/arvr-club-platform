import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/common/AppShell'
import { EventForm } from '@/components/forms/EventForm'
import { CircularPreview } from '@/components/circular/CircularPreview'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/common/Toast'
import { EventFormData, EventRecord, emptyEventForm } from '@/types/event'
import { validateEventForm, isFormValid, FormErrors } from '@/utils/validation'
import {
  createDraftEvent,
  updateEvent,
  getEvent,
  markCircularGenerated,
} from '@/services/eventService'
import { generateCircularPdf } from '@/services/pdfService'
import { generateCircularDocx } from '@/services/docxService'
import { todayISO } from '@/utils/dateFormatter'
import { FullPageSpinner } from '@/components/common/Spinner'

/** Turns a thrown value (often a Firebase FirebaseError) into a short,
 *  user-facing explanation instead of a generic "please try again". */
function describeError(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | undefined)?.code
  if (code === 'permission-denied') {
    return 'Firestore rejected this request (permission-denied). Check that firestore.rules has been deployed.'
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'Could not reach Firestore. Check your internet connection and Firebase configuration.'
  }
  if (code === 'invalid-argument' || code === 'not-found') {
    return `Firestore rejected this request (${code}).`
  }
  if (error instanceof Error && error.message) {
    return `${fallback} (${error.message})`
  }
  return fallback
}

export default function CircularEditor() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loadingEvent, setLoadingEvent] = useState(isEditing)
  const [record, setRecord] = useState<EventRecord | null>(null)
  const [form, setForm] = useState<EventFormData>(emptyEventForm())
  const [errors, setErrors] = useState<FormErrors>({})
  const [savingDraft, setSavingDraft] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatingDocx, setGeneratingDocx] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditing || !id) return
    let active = true
    getEvent(id)
      .then((data) => {
        if (!active) return
        if (!data) {
          showToast('That event could not be found.', 'error')
          navigate('/events')
          return
        }
        setRecord(data)
        setForm(toFormData(data))
      })
      .catch(() => {
        showToast('Could not load this event. Please try again.', 'error')
      })
      .finally(() => active && setLoadingEvent(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loadingEvent) return <FullPageSpinner label="Loading event…" />

  const referenceNumber = record?.referenceNumber || 'ARVR/____/___ (assigned on generate)'
  const circularDate = record?.circularGeneratedDate || todayISO()

  function runValidation(): boolean {
    const nextErrors = validateEventForm(form)
    setErrors(nextErrors)
    if (!isFormValid(nextErrors)) {
      showToast('Please fix the highlighted fields before continuing.', 'error')
      return false
    }
    return true
  }

  async function handleSaveDraft() {
    setSavingDraft(true)
    try {
      if (record) {
        await updateEvent(record.id, form)
        showToast('Draft saved.', 'success')
      } else {
        const newId = await createDraftEvent(form)
        showToast('Draft saved.', 'success')
        navigate(`/circulars/${newId}/edit`, { replace: true })
      }
    } catch (error) {
      console.error('Save Draft failed:', error)
      showToast(describeError(error, 'Could not save this draft.'), 'error')
    } finally {
      setSavingDraft(false)
    }
  }

  /** Prepares export data without making PDF/DOCX depend on Firebase. */
  async function ensureGenerated(): Promise<EventRecord | null> {
    if (!runValidation()) return null

    try {
      let current = record
      if (!current) {
        const newId = await createDraftEvent(form)
        current = {
          id: newId,
          ...form,
          referenceNumber: '',
          circularGeneratedDate: '',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'arvr-club-generator',
          reportStatus: 'not_started',
          reportGeneratedDate: null,
        }
      } else {
        // Update locally/remotely when possible, but do not block export if Firebase is unavailable.
        await updateEvent(current.id, form)
        current = { ...current, ...form, updatedAt: new Date().toISOString() }
      }

      const generated = await markCircularGenerated(current)
      setRecord(generated)
      return generated
    } catch (error) {
      console.error('Prepare circular failed:', error)
      // Even if persistence fails unexpectedly, exports should still work from form data.
      const year = new Date(form.eventDate || todayISO()).getFullYear()
      const fallback: EventRecord = {
        id: record?.id || `local-export-${Date.now()}`,
        ...form,
        referenceNumber: record?.referenceNumber || `ARVR/${year}/001`,
        circularGeneratedDate: record?.circularGeneratedDate || todayISO(),
        status: 'generated',
        createdAt: record?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'arvr-club-generator',
        reportStatus: record?.reportStatus || 'not_started',
        reportGeneratedDate: record?.reportGeneratedDate || null,
      }
      setRecord(fallback)
      return fallback
    }
  }

  async function handleGeneratePdf() {
    setGeneratingPdf(true)
    try {
      const generated = await ensureGenerated()
      if (!generated) return
      if (!previewRef.current) {
        showToast('Could not find the circular preview to capture. Please try again.', 'error')
        return
      }
      // setRecord() updates the preview on the next render; wait for that
      // render before capturing so the generated reference/date are included.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      if (!previewRef.current) {
        throw new Error('Could not find the circular preview to capture.')
      }
      await generateCircularPdf(previewRef.current, form.eventName, form.eventDate)
      showToast('Circular generated successfully.', 'success')
    } catch (error) {
      console.error('PDF generation failed:', error)
      showToast(describeError(error, 'PDF generation failed. Please try again.'), 'error')
    } finally {
      setGeneratingPdf(false)
    }
  }

  async function handleGenerateDocx() {
    setGeneratingDocx(true)
    try {
      const generated = await ensureGenerated()
      if (!generated) return
      await generateCircularDocx(form, generated.referenceNumber, generated.circularGeneratedDate)
      showToast('Circular generated successfully.', 'success')
    } catch (error) {
      console.error('DOCX generation failed:', error)
      showToast(describeError(error, 'DOCX generation failed. Please try again.'), 'error')
    } finally {
      setGeneratingDocx(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-slate-500 hover:text-navy-700"
          >
            ← Back
          </button>
          <h1 className="mt-1 text-xl font-semibold text-navy-800">
            {isEditing ? 'Edit Circular' : 'Create New Circular'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleSaveDraft} loading={savingDraft}>
            Save Draft
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="secondary" onClick={handleGenerateDocx} loading={generatingDocx}>
            Generate DOCX
          </Button>
          <Button onClick={handleGeneratePdf} loading={generatingPdf}>
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <EventForm data={form} errors={errors} onChange={setForm} />
        </div>
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-140px)]">
          <CircularPreview
            ref={previewRef}
            event={form}
            referenceNumber={referenceNumber}
            circularDate={circularDate}
          />
        </div>
      </div>
    </AppShell>
  )
}

function toFormData(record: EventRecord): EventFormData {
  const {
    id: _id,
    referenceNumber: _ref,
    circularGeneratedDate: _cgd,
    status: _status,
    createdAt: _ca,
    updatedAt: _ua,
    createdBy: _cb,
    reportStatus: _rs,
    reportGeneratedDate: _rgd,
    ...rest
  } = record
  return {
    ...rest,
    objectives: rest.objectives.length > 0 ? rest.objectives : ['', '', ''],
    studentCoordinators: rest.studentCoordinators.length > 0 ? rest.studentCoordinators : [''],
  }
}
