import { useEffect, useRef, useState } from 'react'
import { apiUrl } from './api.js'
import { EMPTY_FORM, FIELDS } from './fields.js'

/** `2026-09-10` from a date input becomes `10 September 2026` on the certificate. */
function formatDate(value) {
  if (!value) return ''
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildPayload(form) {
  return { ...form, dateIssued: formatDate(form.dateIssued) }
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Blob URLs leak until revoked; drop the previous one whenever it changes.
  const previewUrlRef = useRef(null)
  useEffect(() => {
    previewUrlRef.current = previewUrl
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [previewUrl])

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  /** Posts the form and returns the PDF blob, or null when the server rejected it. */
  async function requestPdf() {
    const response = await fetch(apiUrl('/api/certificate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      setErrors(body.errors || {})
      setStatus({ type: 'error', message: 'Please fix the highlighted fields.' })
      return null
    }

    setErrors({})
    return response.blob()
  }

  async function handleSubmit(event, action) {
    event.preventDefault()
    setBusy(true)
    setStatus(null)

    try {
      const blob = await requestPdf()
      if (!blob) return

      const url = URL.createObjectURL(blob)

      if (action === 'download') {
        const link = document.createElement('a')
        link.href = url
        link.download = `certificate-${form.recipientName.trim().toLowerCase().replace(/\s+/g, '-')}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
        setStatus({ type: 'success', message: 'Certificate downloaded.' })
      } else {
        setPreviewUrl(url)
        setStatus({ type: 'success', message: 'Preview updated.' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Could not reach the server: ${error.message}` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1>Certificate Generator</h1>
        <p>Fill in the details and the server renders a printable A4 landscape certificate.</p>
      </header>

      <div className="layout">
        <form className="card" onSubmit={(event) => handleSubmit(event, 'preview')} noValidate>
          {FIELDS.map((field) => (
            <label key={field.name} className="field">
              <span className="field__label">
                {field.label}
                {field.required && <em aria-hidden="true"> *</em>}
              </span>

              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  maxLength={field.max}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  maxLength={field.max}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                />
              )}

              {errors[field.name] && <span className="field__error">{errors[field.name]}</span>}
            </label>
          ))}

          <div className="actions">
            <button type="submit" className="btn btn--ghost" disabled={busy}>
              {busy ? 'Working…' : 'Preview'}
            </button>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={(event) => handleSubmit(event, 'download')}
            >
              Download PDF
            </button>
          </div>

          {status && <p className={`status status--${status.type}`}>{status.message}</p>}
        </form>

        <section className="card preview">
          {previewUrl ? (
            <iframe title="Certificate preview" src={previewUrl} />
          ) : (
            <div className="preview__empty">
              <p>No preview yet</p>
              <span>Fill the required fields and press Preview.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
