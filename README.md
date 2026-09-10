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

## Environment variables

| File                     | Committed | Used by                     | Purpose                                              |
| ------------------------ | --------- | --------------------------- | ---------------------------------------------------- |
| `server/.env.example`    | yes       | —                           | Template. Copy to `server/.env`.                     |
| `server/.env`            | **no**    | `npm run dev` / `npm start` | Local values. Gitignored.                            |
| `client/.env.example`    | yes       | —                           | Template.                                            |
| `client/.env.development`| yes       | `npm run dev` (vite)        | Empty base URL → requests go through the Vite proxy. |
| `client/.env.production` | yes       | `npm run build`             | The deployed backend URL.                            |
| `client/.env.local`      | **no**    | vite, any mode              | Your personal overrides. Gitignored.                 |

**Server** — loaded natively via `node --env-file-if-exists=.env`, no `dotenv` dependency. A real
environment variable always wins over the file, which is how hosts like Vercel inject config.

| Variable          | Default    | Meaning                                                                     |
| ----------------- | ---------- | --------------------------------------------------------------------------- |
| `PORT`            | `4000`     | Port the API binds to. The Vite proxy expects 4000.                          |
| `ALLOWED_ORIGINS` | *(unset)*  | Comma-separated browser origins allowed to call the API. Unset = any origin. |

**Client** — Vite only exposes variables prefixed `VITE_`, and inlines them at build time, so
changing one means rebuilding.

| Variable             | Default | Meaning                                                                        |
| -------------------- | ------- | ------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL`  | `''`    | Backend origin. Empty = same-origin (dev proxy / single-server build). A bare host gets `https://` added. |

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
