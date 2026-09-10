import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { buildCertificate, certificateFilename } from './certificate.js'
import { FIELDS, validateCertificate } from './validate.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4000

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Lets the client build its form from the server's field definitions.
app.get('/api/fields', (_req, res) => res.json({ fields: FIELDS }))

app.post('/api/certificate', (req, res) => {
  const { data, errors } = validateCertificate(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors })
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${certificateFilename(data)}"`)

  const doc = buildCertificate(data)
  doc.pipe(res)
})

// In production the built client is served from the same origin.
const clientDist = path.resolve(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get(/^(?!\/api\/).*/, (_req, res) => {
  const index = path.join(clientDist, 'index.html')
  if (!existsSync(index)) {
    return res.status(404).send('Client not built yet — run `npm run dev` or `npm run build`.')
  }
  res.sendFile(index)
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
