/** Formats an ISO date string (YYYY-MM-DD) as "15 June 2026". */
export function formatDateLong(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Formats an ISO date string as "2026-06-15" (already ISO, kept for clarity/reuse). */
export function formatDateISO(isoDate: string): string {
  return isoDate
}

/** Formats an ISO date string as "15-06-2026" for filenames/tables. */
export function formatDateShort(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}

/** Today as an ISO date string, in local time. */
export function todayISO(): string {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
