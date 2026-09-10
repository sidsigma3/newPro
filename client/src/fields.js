// Mirrors server/src/validate.js — the server is the source of truth for the
// rules, this drives the form layout.
export const FIELDS = [
  {
    name: 'recipientName',
    label: 'Recipient name',
    placeholder: 'Jane Smith',
    required: true,
    max: 60,
  },
  {
    name: 'courseTitle',
    label: 'Course / achievement',
    placeholder: 'Advanced React Development',
    required: true,
    max: 120,
  },
  {
    name: 'description',
    label: 'Description',
    placeholder: 'A 12-week programme covering hooks, state management and performance.',
    required: false,
    max: 300,
    type: 'textarea',
  },
  {
    name: 'organization',
    label: 'Organization',
    placeholder: 'Intellara Academy',
    required: true,
    max: 80,
  },
  {
    name: 'dateIssued',
    label: 'Date issued',
    required: true,
    max: 40,
    type: 'date',
  },
  {
    name: 'issuerName',
    label: 'Signed by',
    placeholder: 'Dr. A. Rao',
    required: true,
    max: 60,
  },
  {
    name: 'issuerTitle',
    label: 'Signatory title',
    placeholder: 'Programme Director',
    required: false,
    max: 60,
  },
  {
    name: 'certificateId',
    label: 'Certificate ID',
    placeholder: 'CERT-2026-0001',
    required: false,
    max: 40,
  },
]

export const EMPTY_FORM = Object.fromEntries(FIELDS.map((field) => [field.name, '']))
