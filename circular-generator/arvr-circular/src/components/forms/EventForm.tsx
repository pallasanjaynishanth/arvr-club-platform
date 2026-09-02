import { EventFormData, EVENT_TYPES } from '@/types/event'
import { FormErrors } from '@/utils/validation'
import { FormField, inputClass } from '@/components/forms/FormField'
import { SectionCard } from '@/components/forms/SectionCard'
import { Button } from '@/components/common/Button'

interface EventFormProps {
  data: EventFormData
  errors: FormErrors
  onChange: (data: EventFormData) => void
}

export function EventForm({ data, errors, onChange }: EventFormProps) {
  function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    onChange({ ...data, [key]: value })
  }

  function updateObjective(index: number, value: string) {
    const next = [...data.objectives]
    next[index] = value
    set('objectives', next)
  }

  function addObjective() {
    set('objectives', [...data.objectives, ''])
  }

  function removeObjective(index: number) {
    if (data.objectives.length <= 1) return
    set(
      'objectives',
      data.objectives.filter((_, i) => i !== index)
    )
  }

  function updateCoordinator(index: number, value: string) {
    const next = [...data.studentCoordinators]
    next[index] = value
    set('studentCoordinators', next)
  }

  function addCoordinator() {
    set('studentCoordinators', [...data.studentCoordinators, ''])
  }

  function removeCoordinator(index: number) {
    if (data.studentCoordinators.length <= 1) return
    set(
      'studentCoordinators',
      data.studentCoordinators.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Event Details" description="Core details shown at the top of the circular.">
        <FormField label="Event Name" htmlFor="eventName" required error={errors.eventName}>
          <input
            id="eventName"
            className={inputClass(!!errors.eventName)}
            value={data.eventName}
            onChange={(e) => set('eventName', e.target.value)}
            placeholder="e.g. Virtual Reality Workshop"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Event Type" htmlFor="eventType" required error={errors.eventType}>
            <select
              id="eventType"
              className={inputClass(!!errors.eventType)}
              value={data.eventType}
              onChange={(e) => set('eventType', e.target.value as EventFormData['eventType'])}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Event Date" htmlFor="eventDate" required error={errors.eventDate}>
            <input
              id="eventDate"
              type="date"
              className={inputClass(!!errors.eventDate)}
              value={data.eventDate}
              onChange={(e) => set('eventDate', e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Start Time" htmlFor="startTime" required error={errors.startTime}>
            <input
              id="startTime"
              type="time"
              className={inputClass(!!errors.startTime)}
              value={to24h(data.startTime)}
              onChange={(e) => set('startTime', from24h(e.target.value))}
            />
          </FormField>
          <FormField label="End Time" htmlFor="endTime" required error={errors.endTime}>
            <input
              id="endTime"
              type="time"
              className={inputClass(!!errors.endTime)}
              value={to24h(data.endTime)}
              onChange={(e) => set('endTime', from24h(e.target.value))}
            />
          </FormField>
        </div>

        <FormField label="Venue" htmlFor="venue" required error={errors.venue}>
          <input
            id="venue"
            className={inputClass(!!errors.venue)}
            value={data.venue}
            onChange={(e) => set('venue', e.target.value)}
            placeholder="e.g. CSE Seminar Hall"
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Event Information">
        <FormField label="About the Event" htmlFor="description" required error={errors.description}>
          <textarea
            id="description"
            rows={4}
            className={inputClass(!!errors.description)}
            value={data.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="A short paragraph describing the event."
          />
        </FormField>

        <FormField label="Objectives" required error={errors.objectives} hint="Add as many as needed.">
          <div className="flex flex-col gap-2">
            {data.objectives.map((obj, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className={inputClass()}
                  value={obj}
                  onChange={(e) => updateObjective(idx, e.target.value)}
                  placeholder={`Objective ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeObjective(idx)}
                  disabled={data.objectives.length <= 1}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 text-sm text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Remove objective ${idx + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="self-start" onClick={addObjective}>
              + Add Objective
            </Button>
          </div>
        </FormField>

        <FormField label="Target Audience" htmlFor="targetAudience" required error={errors.targetAudience}>
          <input
            id="targetAudience"
            className={inputClass(!!errors.targetAudience)}
            value={data.targetAudience}
            onChange={(e) => set('targetAudience', e.target.value)}
            placeholder="e.g. All CSE Students"
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Registration">
        <FormField label="Registration Required?" required>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="registrationRequired"
                checked={data.registrationRequired === true}
                onChange={() => set('registrationRequired', true)}
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="registrationRequired"
                checked={data.registrationRequired === false}
                onChange={() => set('registrationRequired', false)}
              />
              No
            </label>
          </div>
        </FormField>

        {data.registrationRequired && (
          <FormField label="Registration Link" htmlFor="registrationLink" required error={errors.registrationLink}>
            <input
              id="registrationLink"
              className={inputClass(!!errors.registrationLink)}
              value={data.registrationLink}
              onChange={(e) => set('registrationLink', e.target.value)}
              placeholder="https://forms.gle/…"
            />
          </FormField>
        )}
      </SectionCard>

      <SectionCard title="Guest / Speaker" description="Optional.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Guest Name" htmlFor="guestName">
            <input
              id="guestName"
              className={inputClass()}
              value={data.guestName}
              onChange={(e) => set('guestName', e.target.value)}
            />
          </FormField>
          <FormField label="Designation" htmlFor="guestDesignation">
            <input
              id="guestDesignation"
              className={inputClass()}
              value={data.guestDesignation}
              onChange={(e) => set('guestDesignation', e.target.value)}
            />
          </FormField>
          <FormField label="Organization" htmlFor="guestOrganization">
            <input
              id="guestOrganization"
              className={inputClass()}
              value={data.guestOrganization}
              onChange={(e) => set('guestOrganization', e.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Coordinators">
        <FormField label="Student Coordinator(s)">
          <div className="flex flex-col gap-2">
            {data.studentCoordinators.map((name, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className={inputClass()}
                  value={name}
                  onChange={(e) => updateCoordinator(idx, e.target.value)}
                  placeholder={`Coordinator ${idx + 1} name`}
                />
                <button
                  type="button"
                  onClick={() => removeCoordinator(idx)}
                  disabled={data.studentCoordinators.length <= 1}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 text-sm text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Remove coordinator ${idx + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="self-start" onClick={addCoordinator}>
              + Add Coordinator
            </Button>
          </div>
        </FormField>

        <FormField label="Special Instructions" htmlFor="specialInstructions" hint="Optional.">
          <textarea
            id="specialInstructions"
            rows={2}
            className={inputClass()}
            value={data.specialInstructions}
            onChange={(e) => set('specialInstructions', e.target.value)}
          />
        </FormField>
      </SectionCard>
    </div>
  )
}

// Time inputs store "10:00 AM" style strings (to match the spec's display
// format) but <input type="time"> needs 24h "HH:MM". These helpers convert
// between the two so the picker still works.
function to24h(display: string): string {
  if (!display) return ''
  const match = display.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return ''
  let [, h, m, period] = match
  let hour = parseInt(h, 10)
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${m}`
}

function from24h(value: string): string {
  if (!value) return ''
  const [hStr, mStr] = value.split(':')
  let hour = parseInt(hStr, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  if (hour === 0) hour = 12
  return `${hour}:${mStr} ${period}`
}
