import PDFDocument from 'pdfkit'

// A4 landscape, in PDF points.
const PAGE_WIDTH = 841.89
const PAGE_HEIGHT = 595.28

const GOLD = '#b08d3f'
const INK = '#1f2328'
const MUTED = '#6b7280'

/**
 * Builds the certificate document. The caller is responsible for piping it
 * somewhere and calling nothing else — this function ends the document.
 *
 * Layout (A4 landscape):
 *   double gold frame
 *   CERTIFICATE OF COMPLETION        (heading)
 *   This is to certify that          (lead-in)
 *   <recipient name>                 (display, underlined)
 *   has successfully completed
 *   <course title>
 *   <description>                    (optional, wrapped)
 *   ____________      ____________   (date / signature)
 *   Certificate ID · Organization    (footer)
 */
export function buildCertificate(data) {
  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margin: 0,
    info: {
      Title: `Certificate — ${data.recipientName}`,
      Author: data.organization,
      Subject: data.courseTitle,
    },
  })

  drawFrame(doc)

  centered(doc, 'CERTIFICATE OF COMPLETION', 96, {
    font: 'Helvetica-Bold',
    size: 26,
    color: INK,
    characterSpacing: 4,
  })

  // Short rule under the heading.
  doc
    .moveTo(PAGE_WIDTH / 2 - 60, 136)
    .lineTo(PAGE_WIDTH / 2 + 60, 136)
    .lineWidth(1.5)
    .strokeColor(GOLD)
    .stroke()

  centered(doc, 'This is to certify that', 162, {
    font: 'Times-Italic',
    size: 14,
    color: MUTED,
  })

  centered(doc, data.recipientName, 190, {
    font: 'Times-Bold',
    size: 40,
    color: INK,
  })

  // Underline sized to the name, with a sensible minimum width.
  doc.font('Times-Bold').fontSize(40)
  const nameWidth = Math.max(doc.widthOfString(data.recipientName) + 60, 260)
  doc
    .moveTo((PAGE_WIDTH - nameWidth) / 2, 248)
    .lineTo((PAGE_WIDTH + nameWidth) / 2, 248)
    .lineWidth(1)
    .strokeColor(GOLD)
    .stroke()

  centered(doc, 'has successfully completed', 272, {
    font: 'Times-Italic',
    size: 14,
    color: MUTED,
  })

  const courseBottom = centered(doc, data.courseTitle, 300, {
    font: 'Times-Bold',
    size: 20,
    color: INK,
    width: 620,
  })

  if (data.description) {
    centered(doc, data.description, courseBottom + 14, {
      font: 'Times-Roman',
      size: 11,
      color: MUTED,
      width: 560,
      lineGap: 3,
    })
  }

  drawSignatureBlock(doc, 200, data.dateIssued, 'Date')
  drawSignatureBlock(doc, PAGE_WIDTH - 200, data.issuerName, data.issuerTitle || 'Authorized signature')

  const footer = [data.organization, data.certificateId && `Certificate ID: ${data.certificateId}`]
    .filter(Boolean)
    .join('   ·   ')

  centered(doc, footer, 540, {
    font: 'Helvetica',
    size: 9,
    color: MUTED,
    characterSpacing: 1,
  })

  doc.end()
  return doc
}

function drawFrame(doc) {
  doc
    .rect(24, 24, PAGE_WIDTH - 48, PAGE_HEIGHT - 48)
    .lineWidth(3)
    .strokeColor(GOLD)
    .stroke()

  doc
    .rect(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68)
    .lineWidth(0.75)
    .strokeColor(GOLD)
    .stroke()
}

/** Draws a value sitting on a rule, with a caption underneath. */
function drawSignatureBlock(doc, centerX, value, caption) {
  const halfWidth = 110
  const lineY = 480

  doc
    .font('Times-Italic')
    .fontSize(14)
    .fillColor(INK)
    .text(value, centerX - halfWidth, lineY - 22, { width: halfWidth * 2, align: 'center' })

  doc
    .moveTo(centerX - halfWidth, lineY)
    .lineTo(centerX + halfWidth, lineY)
    .lineWidth(0.75)
    .strokeColor(INK)
    .stroke()

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(MUTED)
    .text(caption.toUpperCase(), centerX - halfWidth, lineY + 8, {
      width: halfWidth * 2,
      align: 'center',
      characterSpacing: 1,
    })
}

/**
 * Draws horizontally centered text at an absolute y.
 * @returns the y coordinate just below the drawn text.
 */
function centered(doc, text, y, { font, size, color, width = PAGE_WIDTH - 120, ...options }) {
  doc
    .font(font)
    .fontSize(size)
    .fillColor(color)
    .text(text, (PAGE_WIDTH - width) / 2, y, { width, align: 'center', ...options })

  return doc.y
}

/** Safe-ish filename for the Content-Disposition header. */
export function certificateFilename(data) {
  const slug =
    data.recipientName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'certificate'

  return `certificate-${slug}.pdf`
}
