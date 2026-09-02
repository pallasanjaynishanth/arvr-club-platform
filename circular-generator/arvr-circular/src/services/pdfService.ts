import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { downloadBlob } from '@/utils/download'
import { buildCircularFileName } from '@/utils/fileName'

function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll('img'))
  return Promise.all(
    images.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        })
      }
      if (img.complete && img.naturalWidth > 0 && 'decode' in img) {
        try {
          await img.decode()
        } catch {
          // Image decoding is best-effort; html2canvas can still capture it.
        }
      }
    })
  ).then(() => undefined)
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

export async function generateCircularPdf(
  node: HTMLElement,
  eventName: string,
  eventDate: string
): Promise<void> {
  if (!node || !node.isConnected) {
    throw new Error('The circular preview is not available.')
  }

  if (document.fonts?.ready) await document.fonts.ready
  await waitForImages(node)
  await nextPaint()

  // The live preview is zoomed with a CSS transform. Capture an untransformed
  // clone so the PDF is always a clean A4 page rather than a blank/zoomed view.
  const clone = node.cloneNode(true) as HTMLElement
  clone.id = 'circular-pdf-export'
  clone.style.transform = 'none'
  clone.style.position = 'fixed'
  clone.style.left = '-10000px'
  clone.style.top = '0'
  clone.style.width = '210mm'
  clone.style.minHeight = '297mm'
  clone.style.margin = '0'
  clone.style.zIndex = '-1'
  document.body.appendChild(clone)

  try {
    await waitForImages(clone)
    await nextPaint()

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: Math.max(clone.scrollWidth, 1),
      windowHeight: Math.max(clone.scrollHeight, 1),
    })

    if (!canvas.width || !canvas.height) {
      throw new Error('The circular preview produced an empty image.')
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pageWidth = 210
    const pageHeight = 297
    // Keep a small safety margin so browser rounding cannot push the image
    // onto a second A4 page. If the content is taller than A4, scale the
    // complete circular down proportionally instead of splitting it.
    const safePageHeight = 291
    const naturalHeight = (canvas.height * pageWidth) / canvas.width
    const scale = naturalHeight > safePageHeight ? safePageHeight / naturalHeight : 1
    const imgWidth = pageWidth * scale
    const imgHeight = naturalHeight * scale
    const x = (pageWidth - imgWidth) / 2
    const y = (pageHeight - imgHeight) / 2
    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Always create exactly one A4 page. Long circulars are proportionally
    // reduced to fit rather than being split across multiple pages.
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)

    const fileName = buildCircularFileName(eventName, eventDate, 'pdf')
    downloadBlob(pdf.output('blob'), fileName)
  } finally {
    clone.remove()
  }
}
