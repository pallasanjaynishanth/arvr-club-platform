import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
} from 'docx'
import { downloadBlob } from '@/utils/download'
import { CLUB_CONFIG, CIRCULAR_COPY } from '@/config/clubConfig'
import { EventFormData } from '@/types/event'
import { formatDateLong } from '@/utils/dateFormatter'
import {
  buildSubject,
  buildIntroduction,
  organizedByLine,
  registrationLine,
  coordinatorsLine,
} from '@/utils/circularContent'
import { buildCircularFileName } from '@/utils/fileName'

const NAVY = '16233D'
const GOLD = 'B08D3F'
const GREY = '555555'

function labelCell(text: string): TableCell {
  return new TableCell({
    width: { size: 32, type: WidthType.PERCENTAGE },
    shading: { fill: 'F3F5F9' },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, color: NAVY })],
      }),
    ],
  })
}

function valueCell(text: string): TableCell {
  return new TableCell({
    width: { size: 68, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text: text || '—', size: 21 })] })],
  })
}

function detailRow(label: string, value: string): TableRow {
  return new TableRow({ children: [labelCell(label), valueCell(value)] })
}

export async function generateCircularDocx(
  event: EventFormData,
  referenceNumber: string,
  circularDate: string
): Promise<void> {
  const objectives = (event.objectives || []).filter((o) => o.trim().length > 0)

  const rows: TableRow[] = [
    detailRow('Event Name', event.eventName),
    detailRow('Event Type', event.eventType),
    detailRow('Date', event.eventDate ? formatDateLong(event.eventDate) : ''),
    detailRow(
      'Time',
      event.startTime && event.endTime ? `${event.startTime} – ${event.endTime}` : ''
    ),
    detailRow('Venue', event.venue),
    detailRow('Organized By', organizedByLine()),
    detailRow('Target Audience', event.targetAudience),
    detailRow('Registration', registrationLine(event)),
    detailRow('Coordinator(s)', coordinatorsLine(event)),
  ]

  if (event.guestName) {
    const guestParts = [event.guestName, event.guestDesignation, event.guestOrganization].filter(
      Boolean
    )
    rows.push(detailRow('Guest / Speaker', guestParts.join(', ')))
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in twips
            margin: { top: 900, bottom: 900, left: 1000, right: 1000 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: CLUB_CONFIG.universityName,
                bold: true,
                size: 32,
                color: NAVY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: CLUB_CONFIG.departmentName, bold: true, size: 22, color: '2C4574' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: CLUB_CONFIG.clubName.toUpperCase(),
                bold: true,
                size: 20,
                color: GOLD,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
            },
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({ text: 'CIRCULAR', bold: true, size: 30, color: NAVY }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            tabStops: [{ type: 'right', position: 9000 }],
            children: [
              new TextRun({ text: `Ref. No.: ${referenceNumber || '—'}`, size: 18 }),
              new TextRun({ text: `\tDate: ${circularDate ? formatDateLong(circularDate) : '—'}`, size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({ text: buildSubject(event), bold: true, size: 24, color: NAVY })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: buildIntroduction(event), size: 21 })],
          }),
          heading('Event Details'),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
          heading('About the Event'),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [new TextRun({ text: event.description || '—', size: 21 })],
          }),
          heading('Objectives'),
          ...(objectives.length > 0
            ? objectives.map(
                (obj, idx) =>
                  new Paragraph({
                    spacing: { after: 80 },
                    children: [new TextRun({ text: `${idx + 1}. ${obj}`, size: 21 })],
                  })
              )
            : [new Paragraph({ children: [new TextRun({ text: '—', size: 21 })] })]),
          heading('Participation / Instructions'),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [new TextRun({ text: CIRCULAR_COPY.participationParagraph, size: 21 })],
          }),
          ...(event.specialInstructions
            ? [
                new Paragraph({
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 200 },
                  children: [new TextRun({ text: event.specialInstructions, size: 21 })],
                }),
              ]
            : []),
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            rows: [
              new TableRow({
                children: [
                  signatureCell(CLUB_CONFIG.facultyCoordinator, 'Faculty Coordinator'),
                  signatureCell(CLUB_CONFIG.hod, 'HOD, CSE'),
                  signatureCell(CLUB_CONFIG.clubPresident, 'Club President'),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: NAVY } },
            spacing: { before: 200 },
            children: [
              new TextRun({ text: CLUB_CONFIG.universityName, bold: true, size: 18, color: NAVY }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: CLUB_CONFIG.address.join(' '), size: 16, color: GREY })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${CLUB_CONFIG.website}  |  ${CLUB_CONFIG.email}`,
                size: 16,
                color: GREY,
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, buildCircularFileName(event.eventName, event.eventDate, 'docx'))
}

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 20, color: NAVY })],
  })
}

function signatureCell(name: string, role: string): TableCell {
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: '333333' } },
        spacing: { before: 400 },
        children: [new TextRun({ text: name, bold: true, size: 19, color: NAVY })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: role, size: 16, color: GREY })],
      }),
    ],
  })
}
