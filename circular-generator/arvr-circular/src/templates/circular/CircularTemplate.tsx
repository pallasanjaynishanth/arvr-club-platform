import { forwardRef } from 'react'
import { CLUB_CONFIG, CIRCULAR_COPY } from '@/config/clubConfig'
import { EventFormData } from '@/types/event'
import { formatDateLong } from '@/utils/dateFormatter'
import {
  buildIntroduction,
  organizedByLine,
  registrationLine,
  coordinatorsLine,
} from '@/utils/circularContent'
import './circular.css'

export interface CircularTemplateProps {
  /** Event-specific data entered by the coordinator on the Create Circular form. */
  event: EventFormData
  /** Auto-generated reference number, e.g. "ARVR/2026/001". Blank until Generate is pressed. */
  referenceNumber: string
  /** ISO date the circular is issued on. */
  circularDate: string
}

/**
 * The single source of truth for what a generated circular looks like.
 * This exact component is used for the live preview, for PDF capture
 * (via html2canvas) and for on-screen printing, so the outputs never
 * drift apart. It reproduces the official ARVR Club / Pragati University
 * circular design using real HTML text, tables and image logos — never a
 * screenshot or background image.
 */
export const CircularTemplate = forwardRef<HTMLDivElement, CircularTemplateProps>(
  ({ event, referenceNumber, circularDate }, ref) => {
    const objectives = (event.objectives || []).filter((o) => o.trim().length > 0)
    const timeRange =
      event.startTime && event.endTime ? `${event.startTime} – ${event.endTime}` : '—'

    return (
      <div className="circular-page" ref={ref} id="circular-print-root">
        <div className="circular-frame">
          {/* ---------- Header ---------- */}
          <header className="circular-header">
            <Logo src={CLUB_CONFIG.universityLogoPath} alt="Pragati University logo" />
            <div className="circular-header__center">
              <p className="circular-header__university">{CLUB_CONFIG.universityName}</p>
              <div className="circular-header__divider">
                <span />
              </div>
              <p className="circular-header__department">{CLUB_CONFIG.departmentName}</p>
              <p className="circular-header__club">{CLUB_CONFIG.clubName.toUpperCase()}</p>
            </div>
            <Logo src={CLUB_CONFIG.clubLogoPath} alt="ARVR Club logo" />
          </header>

          {/* ---------- CIRCULAR ribbon ---------- */}
          <div className="circular-title-row">
            <span className="circular-title-row__line" />
            <span className="circular-title-row__dot" />
            <h1 className="circular-title">CIRCULAR</h1>
            <span className="circular-title-row__dot" />
            <span className="circular-title-row__line" />
          </div>

          <div className="circular-meta-row">
            <span>
              <strong>Ref. No.:</strong> {referenceNumber || 'ARVR/____/___'}
            </span>
            <span>
              <strong>Date:</strong> {circularDate ? formatDateLong(circularDate) : '__________'}
            </span>
          </div>

          <p className="circular-subject-row">
            <span className="label">Subject: </span>
            <span className="value">{event.eventName || '[Event Name]'}</span>
          </p>

          <p className="circular-paragraph">{buildIntroduction(event)}</p>

          {/* ---------- Event Details ---------- */}
          <h2 className="circular-banner-heading">EVENT DETAILS</h2>
          <table className="circular-table">
            <tbody>
              <DetailRow icon={<CalendarIcon />} label="Event Name" value={event.eventName || '—'} />
              <DetailRow icon={<ClipboardIcon />} label="Event Type" value={event.eventType} />
              <DetailRow
                icon={<CalendarIcon />}
                label="Date"
                value={event.eventDate ? formatDateLong(event.eventDate) : '—'}
              />
              <DetailRow icon={<ClockIcon />} label="Time" value={timeRange} />
              <DetailRow icon={<PinIcon />} label="Venue" value={event.venue || '—'} />
              <DetailRow icon={<PeopleIcon />} label="Organized By" value={organizedByLine()} />
              <DetailRow icon={<TargetIcon />} label="Target Audience" value={event.targetAudience || '—'} />
              <DetailRow icon={<ClipboardIcon />} label="Registration" value={registrationLine(event)} />
              <DetailRow icon={<PersonIcon />} label="Coordinator(s)" value={coordinatorsLine(event)} />
              {event.guestName && (
                <DetailRow
                  icon={<PersonIcon />}
                  label="Guest / Speaker"
                  value={[event.guestName, event.guestDesignation, event.guestOrganization]
                    .filter(Boolean)
                    .join(', ')}
                />
              )}
            </tbody>
          </table>

          {/* ---------- About the Event ---------- */}
          <div className="circular-icon-heading">
            <span className="circular-icon-badge">
              <InfoIcon />
            </span>
            <span className="circular-icon-heading__text">About the Event</span>
          </div>
          <p className="circular-paragraph">{event.description || '—'}</p>

          {/* ---------- Objectives ---------- */}
          <div className="circular-icon-heading">
            <span className="circular-icon-badge">
              <TargetIcon />
            </span>
            <span className="circular-icon-heading__text">Objectives</span>
          </div>
          {objectives.length > 0 ? (
            <ul className="circular-objectives">
              {objectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          ) : (
            <p className="circular-paragraph">—</p>
          )}

          <p className="circular-paragraph">{CIRCULAR_COPY.participationParagraph}</p>
          {event.specialInstructions && (
            <p className="circular-paragraph">{event.specialInstructions}</p>
          )}
          <p className="circular-paragraph">
            For further information, please contact the {CLUB_CONFIG.clubName} Coordinators.
          </p>

          {/* ---------- Signatures ---------- */}
          <div className="circular-signature-block">
            <Signature name={CLUB_CONFIG.facultyCoordinator} role="Faculty Coordinator" sub={CLUB_CONFIG.clubName} />
            <Signature name={CLUB_CONFIG.hod} role="Head of the Department" sub="CSE" />
            <Signature name={CLUB_CONFIG.clubPresident} role="Club President" sub={CLUB_CONFIG.clubName} />
          </div>

          {/* ---------- Footer ---------- */}
          <footer className="circular-footer">
            <div className="circular-footer__item">
              <GlobeIcon />
              <div>
                <span className="circular-footer__label">Website</span>
                <span>{CLUB_CONFIG.website}</span>
              </div>
            </div>
            <div className="circular-footer__item">
              <MailIcon />
              <div>
                <span className="circular-footer__label">Email</span>
                <span>{CLUB_CONFIG.email}</span>
              </div>
            </div>
            <div className="circular-footer__item">
              <LocationIcon />
              <div>
                <span className="circular-footer__label">Location</span>
                <span>{CLUB_CONFIG.address.join(' ')}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    )
  }
)

CircularTemplate.displayName = 'CircularTemplate'

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <tr>
      <td className="icon-cell">
        <span className="circular-icon-badge">{icon}</span>
      </td>
      <td className="label">{label}</td>
      <td className="colon">:</td>
      <td>{value || '—'}</td>
    </tr>
  )
}

function Signature({ name, role, sub }: { name: string; role: string; sub: string }) {
  return (
    <div className="circular-signature">
      <div className="circular-signature__script">{name.replace(/^Dr\.\s*/, '')}</div>
      <div className="circular-signature__line">
        <p className="circular-signature__name">{name}</p>
        <p className="circular-signature__role">{role}</p>
        <p className="circular-signature__sub">{sub}</p>
      </div>
    </div>
  )
}

function Logo({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      className="circular-header__logo"
      src={src}
      alt={alt}
      onError={(e) => {
        // Fall back to a labeled placeholder box if the logo asset is missing,
        // so the circular still renders usably before real logo files are
        // added to public/assets/.
        const target = e.currentTarget
        const placeholder = document.createElement('div')
        placeholder.className = 'circular-header__logo--placeholder'
        placeholder.textContent = alt
        target.replaceWith(placeholder)
      }}
    />
  )
}

/* ---------- Inline icons (kept as real vector markup, not images, so
   PDF/print output stays crisp and text-based per the project spec) ---------- */

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <circle cx="17.5" cy="8.5" r="2.3" />
      <path d="M16 13.7c2.7.4 4.5 2.3 4.5 5.3" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.8" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M8.5 10.5h7M8.5 14h7M8.5 17.5h4.5" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-4 3.4-6.8 7.5-6.8s7.5 2.8 7.5 6.8" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" strokeLinecap="round" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6.5 8 6 8-6" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}
