/**
 * Starts a browser download directly from a Blob. This avoids relying on a
 * third-party download helper and works on Firebase Hosting/static builds.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (!blob || blob.size === 0) {
    throw new Error('The generated file is empty.')
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}
