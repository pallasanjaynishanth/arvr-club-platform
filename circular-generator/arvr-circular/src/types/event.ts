// Core domain types for the ARVR Club Circular Generator.
// Structured so that Phase 2 (Report Generation) can reuse the same Event
// record without a schema migration — see the reportStatus / reportGeneratedDate
// placeholders below, which stay unused until Phase 2.

export type EventType =
  | 'Workshop'
  | 'Seminar'
  | 'Guest Lecture'
  | 'Competition'
  | 'Hackathon'
  | 'Hands-on Session'
  | 'Awareness Program'
  | 'Technical Event'
  | 'Club Activity'
  | 'Other'

export const EVENT_TYPES: EventType[] = [
  'Workshop',
  'Seminar',
  'Guest Lecture',
  'Competition',
  'Hackathon',
  'Hands-on Session',
  'Awareness Program',
  'Technical Event',
  'Club Activity',
  'Other',
]

/** Circular lifecycle status. */
export type CircularStatus = 'draft' | 'generated'

export interface EventRecord {
  id: string
  eventName: string
  eventType: EventType
  eventDate: string // ISO date string, e.g. 2026-06-15
  startTime: string // e.g. "10:00 AM"
  endTime: string // e.g. "4:00 PM"
  venue: string

  description: string
  objectives: string[]
  targetAudience: string

  registrationRequired: boolean
  registrationLink?: string

  guestName?: string
  guestDesignation?: string
  guestOrganization?: string

  studentCoordinators: string[]
  specialInstructions?: string

  referenceNumber: string
  circularGeneratedDate: string // ISO date string

  status: CircularStatus

  // Phase 2 placeholders (unused in Phase 1, kept so the schema does not
  // need to change when Report Generation is added).
  reportStatus?: 'not_started' | 'draft' | 'generated'
  reportGeneratedDate?: string | null

  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  createdBy?: string
}

/** Fields the coordinator fills in when creating/editing an event. */
export type EventFormData = Omit<
  EventRecord,
  | 'id'
  | 'referenceNumber'
  | 'circularGeneratedDate'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'reportStatus'
  | 'reportGeneratedDate'
>

export const emptyEventForm = (): EventFormData => ({
  eventName: '',
  eventType: 'Workshop',
  eventDate: '',
  startTime: '',
  endTime: '',
  venue: '',
  description: '',
  objectives: ['', '', ''],
  targetAudience: '',
  registrationRequired: false,
  registrationLink: '',
  guestName: '',
  guestDesignation: '',
  guestOrganization: '',
  studentCoordinators: [''],
  specialInstructions: '',
})

/** Counter document used to generate sequential, year-scoped reference numbers. */
export interface ReferenceCounter {
  year: number
  lastNumber: number
}
