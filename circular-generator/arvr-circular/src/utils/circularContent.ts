import { EventFormData, EventRecord } from '@/types/event'
import { formatDateLong } from '@/utils/dateFormatter'
import { CLUB_CONFIG } from '@/config/clubConfig'

type MinimalEvent = Pick<
  EventFormData,
  'eventName' | 'eventDate' | 'startTime' | 'endTime' | 'venue'
>

/** Deterministic subject line — never AI-generated, see spec section 32. */
export function buildSubject(event: MinimalEvent): string {
  return `Subject: ${event.eventName || '[Event Name]'}`
}

/** Deterministic introductory sentence — never AI-generated, see spec section 32. */
export function buildIntroduction(event: MinimalEvent): string {
  const dateText = event.eventDate ? formatDateLong(event.eventDate) : '[Date]'
  const timeText =
    event.startTime && event.endTime
      ? `from ${event.startTime} to ${event.endTime}`
      : '[Time]'
  return `This is to inform all the students that the ${CLUB_CONFIG.clubName}, ${CLUB_CONFIG.departmentName}, ${CLUB_CONFIG.universityName} is organizing ${
    event.eventName || '[Event Name]'
  } on ${dateText} ${timeText} at ${event.venue || '[Venue]'}.`
}

export function organizedByLine(): string {
  return `${CLUB_CONFIG.clubName}, ${CLUB_CONFIG.departmentName}`
}

export function registrationLine(event: Pick<EventFormData, 'registrationRequired' | 'registrationLink'>): string {
  if (!event.registrationRequired) return 'Not required'
  return event.registrationLink ? `Required — ${event.registrationLink}` : 'Required'
}

export function coordinatorsLine(event: Pick<EventFormData, 'studentCoordinators'>): string {
  const names = (event.studentCoordinators || []).filter((n) => n.trim().length > 0)
  return names.length > 0 ? names.join(', ') : '—'
}

export type CircularEventInput = EventFormData | EventRecord
