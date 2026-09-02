/** Sanitizes a string for safe use inside a filename. */
export function sanitizeForFilename(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
}

export function buildCircularFileName(
  eventName: string,
  eventDate: string,
  extension: 'pdf' | 'docx'
): string {
  const safeName = sanitizeForFilename(eventName) || 'Event'
  const safeDate = eventDate || 'undated'
  return `ARVR_Circular_${safeName}_${safeDate}.${extension}`
}
