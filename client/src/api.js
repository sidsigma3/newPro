const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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

/** Builds an absolute API URL from a root-relative path such as `/api/certificate`. */
export function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}
