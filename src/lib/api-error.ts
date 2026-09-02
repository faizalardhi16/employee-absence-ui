import { AxiosError } from "axios"

/** Bentuk body error standar dari NestJS backend (AllExceptionsFilter). */
export interface ApiErrorPayload {
  statusCode: number
  message: string | string[]
  error?: string
}

const FALLBACK_STATUS = 500
const FALLBACK_MESSAGE = "Terjadi kesalahan yang tidak terduga. Coba lagi nanti."
const NETWORK_MESSAGE = "Tidak dapat terhubung ke server. Periksa koneksi Anda."
const TIMEOUT_STATUS = 408
const TIMEOUT_MESSAGE = "Permintaan melebihi batas waktu. Silakan coba lagi."

/**
 * Normalisasi semua kegagalan request menjadi satu model error.
 * Lapisan atas (UI/hook) cukup mengenal `ApiError`, bukan bentuk error Axios/backend.
 */
export class ApiError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

function flattenMessage(message: string | string[] | undefined): string | undefined {
  if (Array.isArray(message)) return message.join(", ")
  return message
}

export function toApiError(candidate: unknown): ApiError {
  if (candidate instanceof ApiError) return candidate

  if (candidate instanceof AxiosError) {
    // Request dibatalkan oleh AbortController karena melewati batas waktu.
    // Dipetakan ke pesan ramah pengguna, bukan error/bantalan stack mentah.
    if (isTimeoutError(candidate)) {
      return new ApiError(TIMEOUT_STATUS, TIMEOUT_MESSAGE)
    }

    if (candidate.response) {
      const payload = candidate.response.data as Partial<ApiErrorPayload> | undefined
      const message =
        flattenMessage(payload?.message) ?? candidate.message ?? FALLBACK_MESSAGE
      return new ApiError(payload?.statusCode ?? candidate.response.status, message)
    }
    // Request terkirim tapi tidak ada respons (server mati / jaringan).
    return new ApiError(FALLBACK_STATUS, NETWORK_MESSAGE)
  }

  if (candidate instanceof Error) {
    return new ApiError(FALLBACK_STATUS, candidate.message)
  }

  return new ApiError(FALLBACK_STATUS, FALLBACK_MESSAGE)
}

/** Deteksi pembatalan request akibat timeout (AbortController). */
function isTimeoutError(candidate: AxiosError): boolean {
  return (
    candidate.code === "ERR_CANCELED" ||
    candidate.code === "ECONNABORTED" ||
    candidate.config?.signal?.aborted === true
  )
}
