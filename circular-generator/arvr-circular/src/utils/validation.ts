import { EventFormData } from '@/types/event'

export type FormErrors = Partial<Record<keyof EventFormData, string>>

export function validateEventForm(data: EventFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.eventName.trim()) errors.eventName = 'Event name is required.'
  if (!data.eventType) errors.eventType = 'Please select an event type.'
  if (!data.eventDate) errors.eventDate = 'Event date is required.'
  if (!data.startTime.trim()) errors.startTime = 'Start time is required.'
  if (!data.endTime.trim()) errors.endTime = 'End time is required.'
  if (!data.venue.trim()) errors.venue = 'Venue is required.'
  if (!data.description.trim()) errors.description = 'A description of the event is required.'
  if (!data.targetAudience.trim()) errors.targetAudience = 'Target audience is required.'

  const hasObjective = data.objectives.some((o) => o.trim().length > 0)
  if (!hasObjective) errors.objectives = 'Please add at least one objective.'

  if (data.registrationRequired && !data.registrationLink?.trim()) {
    errors.registrationLink = 'Registration link is required when registration is required.'
  }

  if (data.eventDate) {
    const parsed = new Date(data.eventDate)
    if (Number.isNaN(parsed.getTime())) {
      errors.eventDate = 'Please enter a valid date.'
    }
  }

  return errors
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0
}
