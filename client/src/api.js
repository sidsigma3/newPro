// `API_` is exposed via envPrefix in vite.config.js; VITE_API_BASE_URL is kept
// as a fallback so either name works.
const RAW_FROM_ENV = import.meta.env.API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? ''

// Deployed backend, used when a production build reaches the bundler without an
// env var — an empty variable in the host's dashboard overrides .env.production,
// which silently leaves the app calling its own origin. An env var with an
// actual value still wins over this.
const PRODUCTION_FALLBACK = 'https://server-sidsigma3s-projects.vercel.app'

const RAW_BASE_URL = RAW_FROM_ENV || (import.meta.env.PROD ? PRODUCTION_FALLBACK : '')

/**
 * Accepts a bare host (`server-xyz.vercel.app`) or a full origin
 * (`https://server-xyz.vercel.app`), with or without a trailing slash.
 * An empty value means same-origin — which is what the Vite dev proxy and the
 * single-server production build both rely on.
 */
function normalizeBaseUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const API_BASE_URL = normalizeBaseUrl(RAW_BASE_URL)

// Logged once on load. Values are baked in at build time, so this is the
// quickest way to see what the bundler actually received.
console.info(
  `[api] base URL: ${API_BASE_URL || '(same origin)'} | from env: ${JSON.stringify(RAW_FROM_ENV)}`,
)

/** Builds an absolute API URL from a root-relative path such as `/api/certificate`. */
export function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}
