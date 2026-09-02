import { appConfig } from "@/config/app-config"

/**
 * Proteksi CSRF sisi frontend (pola double-submit cookie).
 *
 * Alur:
 *  1. GET /csrf → server set cookie `csrf_token` (non-HttpOnly) + balas token.
 *  2. Token dicache di memori (fallback: baca cookie) & dilampirkan sebagai
 *     header `X-CSRF-Token` pada setiap request yang mengubah state.
 *
 * Modul ini sengaja memakai fetch (bukan axios instance `api`) supaya tidak
 * ada circular import dengan src/lib/api.ts.
 */

export const CSRF_COOKIE_NAME = "csrf_token"
export const CSRF_HEADER_NAME = "x-csrf-token"
/** Harus sama persis dengan CSRF_INVALID_MESSAGE di backend (csrf.constants.ts). */
export const CSRF_INVALID_MESSAGE = "CSRF token invalid atau tidak cocok"

/** Metode HTTP yang tidak mengubah state → tidak butuh header CSRF. */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

let cachedToken: string | null = null
let inFlight: Promise<string> | null = null

/** Baca token CSRF dari cookie (non-HttpOnly sehingga JS bisa membacanya). */
export function readCsrfCookie(): string | null {
  const prefix = `${CSRF_COOKIE_NAME}=`
  const segment = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
  return segment ? decodeURIComponent(segment.slice(prefix.length)) : null
}

/** True bila metode request berpotensi mengubah state (butuh header CSRF). */
export function isUnsafeMethod(method: string | undefined): boolean {
  return !SAFE_METHODS.has((method ?? "get").toUpperCase())
}

/** Buang token cache → request berikutnya akan fetch token baru. */
export function invalidateCsrfToken(): void {
  cachedToken = null
}

interface CsrfResponse {
  success?: boolean
  data?: { csrfToken?: string }
  csrfToken?: string
}

/**
 * Pastikan token CSRF tersedia — single-flight: request bersamaan berbagi
 * satu promise fetch. Prioritas: cache memori → cookie → fetch baru.
 */
export async function ensureCsrfToken(force = false): Promise<string> {
  if (!force) {
    const cached = cachedToken ?? readCsrfCookie()
    if (cached) {
      cachedToken = cached
      return cached
    }
    if (inFlight) return inFlight
  }

  inFlight = fetch(`${appConfig.apiBaseUrl}/csrf`, {
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Gagal mengambil CSRF token: HTTP ${response.status}`)
      }
      const body = (await response.json()) as CsrfResponse
      const token = body.data?.csrfToken ?? body.csrfToken
      if (!token) {
        throw new Error("Server tidak mengembalikan CSRF token")
      }
      cachedToken = token
      return token
    })
    .finally(() => {
      inFlight = null
    })
  return inFlight
}