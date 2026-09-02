import axios from "axios"

import { appConfig } from "@/config/app-config"
import {
  CSRF_HEADER_NAME,
  CSRF_INVALID_MESSAGE,
  ensureCsrfToken,
  invalidateCsrfToken,
  isUnsafeMethod,
} from "@/lib/csrf"
import { logger } from "@/lib/logger"
import { toApiError } from "@/lib/api-error"
import {
  redactSensitive,
  serializeLogBody,
  useRequestLogStore,
} from "@/stores/request-log.store"
import type { InternalAxiosRequestConfig } from "axios"

const REQUEST_TIMEOUT_MS = 15_000

/** Tanda waktu & salinan body request, dilampirkan pada config oleh request interceptor. */
interface TimedConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startedAt: number
    /**
     * Body request yang sudah diredaksi & diserialisasi. Diambil SAAT request
     * (sebelum axios men-transform data menjadi string) — setelah transform,
     * config.data sudah bukan objek asli sehingga redaksi tidak bisa diterapkan.
     */
    requestBody?: string
  }
  /** Penanda retry CSRF — mencegah retry berulang tak terbatas. */
  _csrfRetried?: boolean
}

/**
 * Envelope response standar backend NestJS (TransformInterceptor global):
 * semua sukses dibungkus { success: true, data, timestamp }.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/** Buka envelope menjadi payload asli; body tanpa pola envelope diteruskan apa adanya. */
function unwrapEnvelope(body: unknown): unknown {
  if (isRecord(body) && body.success === true && "data" in body) {
    return body.data
  }
  return body
}

/**
 * Instance axios tunggal untuk seluruh aplikasi.
 * SRP: hanya mengurus transport (base URL, cookie, timeout) dan observability.
 * Auth memakai HttpOnly cookie → `withCredentials` + tanpa token di sisi JS.
 */
export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
})

api.interceptors.request.use(async (config) => {
  const timed = config as TimedConfig
  timed.metadata = {
    startedAt: performance.now(),
    requestBody: serializeLogBody(redactSensitive(config.data)),
  }
  // Proteksi CSRF: request yang mengubah state wajib membawa header token.
  if (isUnsafeMethod(config.method)) {
    const csrfToken = await ensureCsrfToken()
    config.headers.set(CSRF_HEADER_NAME, csrfToken)
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // Normalisasi: konsumen selalu menerima payload domain langsung, bukan envelope.
    response.data = unwrapEnvelope(response.data)
    logCompleted(response.config as TimedConfig, response.status)
    recordRequestLog(response.config as TimedConfig, response.status, response.data, false)
    return response
  },
  (error) => {
    const config = error?.config as TimedConfig | undefined
    if (config) {
      const status = error.response?.status ?? 0
      logCompleted(config, status)
      recordRequestLog(config, status, error.response?.data, true)
      // Token CSRF basi/hilang → ambil token baru dan ulangi request sekali.
      if (
        status === 403 &&
        isCsrfRejection(error.response?.data) &&
        !config._csrfRetried
      ) {
        config._csrfRetried = true
        invalidateCsrfToken()
        return api.request(config)
      }
    }
    return Promise.reject(toApiError(error))
  },
)

/** Catat request/response ke RequestLogStore (body diredaksi & dibatasi). */
function recordRequestLog(
  config: TimedConfig | undefined,
  status: number,
  responseBody: unknown,
  isError: boolean,
): void {
  if (!config) return
  const startedAt = config.metadata?.startedAt
  useRequestLogStore.getState().addEntry({
    method: (config.method ?? "GET").toUpperCase(),
    url: config.url ?? "",
    status,
    durationMs:
      startedAt !== undefined ? Math.round(performance.now() - startedAt) : undefined,
    // Body request dari snapshot request-time (sudah diredaksi di interceptor).
    requestBody: config.metadata?.requestBody,
    responseBody: serializeLogBody(redactSensitive(responseBody)),
    isError,
  })
}

/** Deteksi 403 dari CsrfGuard backend via pesan error yang terpusat. */
function isCsrfRejection(body: unknown): boolean {
  return (
    isRecord(body) &&
    typeof body.message === "string" &&
    body.message.includes(CSRF_INVALID_MESSAGE)
  )
}

function logCompleted(config: TimedConfig | undefined, status: number): void {
  const startedAt = config?.metadata?.startedAt
  const durationMs = startedAt !== undefined ? Math.round(performance.now() - startedAt) : undefined

  logger.info("request completed", {
    method: config?.method?.toUpperCase(),
    path: config?.url,
    status,
    duration_ms: durationMs,
  })
}
