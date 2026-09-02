import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { EventFormData, EventRecord } from '@/types/event'
import { getNextReferenceNumber } from '@/utils/referenceNumber'
import { todayISO } from '@/utils/dateFormatter'

const EVENTS_COLLECTION = 'events'
const LOCAL_EVENTS_KEY = 'arvr-circular-generator:events'

// Firebase is a sync enhancement; it must never block the local app or downloads.
async function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  let timer: number | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error('Firebase request timed out.')), ms)
      }),
    ])
  } finally {
    if (timer !== undefined) window.clearTimeout(timer)
  }
}

function readLocalEvents(): EventRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as EventRecord[]) : []
  } catch {
    return []
  }
}

function writeLocalEvents(events: EventRecord[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events))
}

function getLocalEvent(id: string): EventRecord | null {
  return readLocalEvents().find((event) => event.id === id) ?? null
}

function saveLocalEvent(event: EventRecord): void {
  const events = readLocalEvents().filter((item) => item.id !== event.id)
  writeLocalEvents([event, ...events])
}

function isLocalId(id: string): boolean {
  return id.startsWith('local-')
}

function createLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toEventRecord(id: string, data: Record<string, unknown>): EventRecord {
  const toIso = (value: unknown): string => {
    if (value instanceof Timestamp) return value.toDate().toISOString()
    if (typeof value === 'string') return value
    return ''
  }
  return {
    id,
    eventName: (data.eventName as string) ?? '',
    eventType: (data.eventType as EventRecord['eventType']) ?? 'Other',
    eventDate: (data.eventDate as string) ?? '',
    startTime: (data.startTime as string) ?? '',
    endTime: (data.endTime as string) ?? '',
    venue: (data.venue as string) ?? '',
    description: (data.description as string) ?? '',
    objectives: (data.objectives as string[]) ?? [],
    targetAudience: (data.targetAudience as string) ?? '',
    registrationRequired: Boolean(data.registrationRequired),
    registrationLink: (data.registrationLink as string) ?? '',
    guestName: (data.guestName as string) ?? '',
    guestDesignation: (data.guestDesignation as string) ?? '',
    guestOrganization: (data.guestOrganization as string) ?? '',
    studentCoordinators: (data.studentCoordinators as string[]) ?? [],
    specialInstructions: (data.specialInstructions as string) ?? '',
    referenceNumber: (data.referenceNumber as string) ?? '',
    circularGeneratedDate: (data.circularGeneratedDate as string) ?? '',
    status: (data.status as EventRecord['status']) ?? 'draft',
    reportStatus: (data.reportStatus as EventRecord['reportStatus']) ?? 'not_started',
    reportGeneratedDate: (data.reportGeneratedDate as string | null) ?? null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdBy: (data.createdBy as string) ?? '',
  }
}

function makeLocalEvent(formData: EventFormData, id = createLocalId()): EventRecord {
  const now = new Date().toISOString()
  return {
    id,
    ...formData,
    referenceNumber: '',
    circularGeneratedDate: '',
    status: 'draft',
    reportStatus: 'not_started',
    reportGeneratedDate: null,
    createdAt: now,
    updatedAt: now,
    createdBy: 'arvr-club-generator',
  }
}

export async function listEvents(): Promise<EventRecord[]> {
  try {
    const q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => toEventRecord(d.id, d.data()))
  } catch (error) {
    console.warn('Firestore list failed; using local saved events.', error)
    return readLocalEvents().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  if (isLocalId(id)) return getLocalEvent(id)

  try {
    const ref = doc(db, EVENTS_COLLECTION, id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    return toEventRecord(snapshot.id, snapshot.data())
  } catch (error) {
    console.warn('Firestore get failed; checking local saved events.', error)
    return getLocalEvent(id)
  }
}

/** Creates a new event as a Draft. Falls back to localStorage if Firestore is unavailable. */
export async function createDraftEvent(
  formData: EventFormData,
  userId?: string
): Promise<string> {
  // Local persistence is the primary path so the UI never waits on Firebase.
  const localEvent = makeLocalEvent(formData)
  saveLocalEvent(localEvent)

  // Best-effort cloud sync; failures must never block Save Draft.
  void withTimeout(addDoc(collection(db, EVENTS_COLLECTION), {
    ...formData,
    referenceNumber: '',
    circularGeneratedDate: '',
    status: 'draft',
    reportStatus: 'not_started',
    reportGeneratedDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId ?? 'arvr-club-generator',
  })).catch((error) => console.warn('Firestore create unavailable; local draft retained.', error))

  return localEvent.id
}

export async function updateEvent(id: string, formData: Partial<EventFormData>): Promise<void> {
  const current = getLocalEvent(id)
  if (current) {
    saveLocalEvent({ ...current, ...formData, updatedAt: new Date().toISOString() })
  }

  // If this is a Firestore id, sync in the background. Never block the UI.
  if (!isLocalId(id)) {
    const ref = doc(db, EVENTS_COLLECTION, id)
    void withTimeout(updateDoc(ref, {
      ...formData,
      updatedAt: serverTimestamp(),
    })).catch((error) => console.warn('Firestore update unavailable; local copy retained.', error))
  }
}

/**
 * Marks an event's circular as Generated, assigning a reference number the
 * first time this happens. If Firebase is unavailable, a local sequential
 * reference number is used so PDF/DOCX generation is never blocked by the
 * database.
 */
export async function markCircularGenerated(event: EventRecord): Promise<EventRecord> {
  if (event.status === 'generated' && event.referenceNumber) return event

  const year = new Date(event.eventDate || todayISO()).getFullYear()
  const localEvents = readLocalEvents()
  const used = localEvents.filter((item) => {
    const itemYear = item.eventDate ? new Date(item.eventDate).getFullYear() : year
    return itemYear === year && item.referenceNumber.startsWith(`ARVR/${year}/`)
  }).length
  const referenceNumber = `ARVR/${year}/${String(used + 1).padStart(3, '0')}`
  const circularGeneratedDate = todayISO()

  const generated: EventRecord = {
    ...event,
    status: 'generated',
    referenceNumber,
    circularGeneratedDate,
    updatedAt: new Date().toISOString(),
  }

  // Persist locally immediately. File generation must not wait for Firebase.
  saveLocalEvent(generated)

  if (!isLocalId(event.id)) {
    try {
      const ref = doc(db, EVENTS_COLLECTION, event.id)
      await withTimeout(updateDoc(ref, {
        status: 'generated',
        referenceNumber,
        circularGeneratedDate,
        updatedAt: serverTimestamp(),
      }))
      return generated
    } catch (error) {
      console.warn('Firestore generation update unavailable; keeping local generated event.', error)
    }
  }

  return generated
}

export async function deleteEvent(id: string): Promise<void> {
  if (isLocalId(id)) {
    writeLocalEvents(readLocalEvents().filter((event) => event.id !== id))
    return
  }
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id))
  } catch (error) {
    const local = getLocalEvent(id)
    if (local) {
      writeLocalEvents(readLocalEvents().filter((event) => event.id !== id))
      return
    }
    throw error
  }
}

/** Creates a new draft event pre-filled from an existing event (Duplicate action). */
export async function duplicateEvent(source: EventRecord, userId?: string): Promise<string> {
  const { eventName, ...rest } = source
  const formData: EventFormData = {
    eventType: rest.eventType,
    eventDate: rest.eventDate,
    startTime: rest.startTime,
    endTime: rest.endTime,
    venue: rest.venue,
    description: rest.description,
    objectives: [...rest.objectives],
    targetAudience: rest.targetAudience,
    registrationRequired: rest.registrationRequired,
    registrationLink: rest.registrationLink,
    guestName: rest.guestName,
    guestDesignation: rest.guestDesignation,
    guestOrganization: rest.guestOrganization,
    studentCoordinators: [...rest.studentCoordinators],
    specialInstructions: rest.specialInstructions,
    eventName,
  }

  return createDraftEvent(
    {
      ...formData,
      eventName: `${eventName} (Copy)`,
    },
    userId
  )
}
