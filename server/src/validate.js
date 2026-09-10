// Field definitions for the certificate. The client renders its form from the
// same shape (see client/src/fields.js), so keep the two in sync.
export const FIELDS = [
  { name: 'recipientName', label: 'Recipient name', required: true, max: 60 },
  { name: 'courseTitle', label: 'Course / achievement', required: true, max: 120 },
  { name: 'description', label: 'Description', required: false, max: 300 },
  { name: 'organization', label: 'Organization', required: true, max: 80 },
  { name: 'dateIssued', label: 'Date issued', required: true, max: 40 },
  { name: 'issuerName', label: 'Signed by', required: true, max: 60 },
  { name: 'issuerTitle', label: 'Signatory title', required: false, max: 60 },
  { name: 'certificateId', label: 'Certificate ID', required: false, max: 40 },
]

/**
 * Trims and checks the incoming payload.
 * @returns {{ data: object, errors: Record<string, string> }}
 */
export function validateCertificate(body) {
  const data = {}
  const errors = {}

  for (const field of FIELDS) {
    const raw = body?.[field.name]
    const value = typeof raw === 'string' ? raw.trim() : ''

    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`
    } else if (value.length > field.max) {
      errors[field.name] = `${field.label} must be at most ${field.max} characters`
    }

    data[field.name] = value
  }

  return { data, errors }
}
