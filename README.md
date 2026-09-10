# Certificate Generator

React form → Express API → PDF certificate (A4 landscape), rendered server-side with **pdfkit**.

## Run it

```bash
npm install
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:4000 (the dev server proxies `/api` to it, so there is no CORS hop in the browser)

Fill the form, then **Preview** (renders inline in an iframe) or **Download PDF**.

## Production

```bash
npm run build   # builds client/dist
npm start       # Express serves the API and the built client on :4000
```

## Layout of the generated certificate

```
┌──────────────────────────────────────────────┐
│  ┌────────────────────────────────────────┐  │  double gold frame
│  │      CERTIFICATE OF COMPLETION         │  │
│  │      ───────────                       │  │
│  │       This is to certify that          │  │
│  │           Jane Smith                   │  │  ← recipientName
│  │      ─────────────────────             │  │
│  │     has successfully completed         │  │
│  │     Advanced React Development         │  │  ← courseTitle
│  │   <optional description, wrapped>      │  │  ← description
│  │                                        │  │
│  │  10 Sept 2026        Dr. A. Rao        │  │  ← dateIssued / issuerName
│  │  ───────────        ───────────        │  │
│  │      DATE          PROGRAMME DIRECTOR  │  │  ← issuerTitle
│  │                                        │  │
│  │  Intellara Academy · Certificate ID    │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Layout

```
package.json          npm workspaces + `dev` script (runs both sides)
server/
  src/index.js        Express app, routes, static hosting of client/dist
  src/certificate.js  the pdfkit drawing code — edit this to change the design
  src/validate.js     field definitions + request validation
client/
  src/App.jsx         the form, preview pane and download handling
  src/fields.js       form field definitions (mirrors validate.js)
  src/styles.css
```

## API

| Method | Path               | Body / Response                                              |
| ------ | ------------------ | ------------------------------------------------------------ |
| `GET`  | `/api/health`      | `{ ok: true }`                                                |
| `GET`  | `/api/fields`      | `{ fields: [...] }` — the server's field definitions          |
| `POST` | `/api/certificate` | JSON fields in → `application/pdf` out, or `400 { errors }`   |

Fields: `recipientName*`, `courseTitle*`, `description`, `organization*`, `dateIssued*`, `issuerName*`, `issuerTitle`, `certificateId` (`*` = required).

```bash
curl -X POST http://localhost:4000/api/certificate \
  -H 'Content-Type: application/json' \
  -d '{"recipientName":"Jane Smith","courseTitle":"Advanced React","organization":"Intellara","dateIssued":"10 September 2026","issuerName":"Dr. Rao"}' \
  -o certificate.pdf
```

## Changing the design

Everything visual lives in [server/src/certificate.js](server/src/certificate.js) — coordinates are PDF points on an
841.89 × 595.28 page. To add a field: append it to `FIELDS` in [server/src/validate.js](server/src/validate.js), add
the matching entry in [client/src/fields.js](client/src/fields.js), and draw it in `buildCertificate`.
