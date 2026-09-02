import { AxiosError } from "axios"

/**
 * Satu-satunya bentuk payload error yang boleh sampai ke UI.
 * Hanya berisi field yang aman bagi user:
 * - `statusCode`: status HTTP (mis. 400, 404, 500)
 * - `message`: pesan tunggal / daftar pesan yang ramah user
 *
 * Field internal backend (mis. `error`, `trace`, `stack`, detail debug)
 * sengaja TIDAK dibaca agar stack trace / kode internal tidak bocor.
 */
export interface ApiErrorPayload {
  statusCode: number
  message: string | string[]
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
    // Hapus stack trace internal (path file, nomor baris) supaya tidak pernah
    // bocor ke lapisan UI/logger. Property non-enumerable: tak ikut terserialisasi.
    Object.defineProperty(this, "stack", {
      value: undefined,
      configurable: true,
      writable: true,
    })
  }
}

/**
 * Normalisasi teks pesan: runtuhkan baris baru agar stack trace / multi-line
 * internal tidak bisa diselundupkan ke dalam satu pesan UI. Kembalikan string
 * bersih, atau undefined bila tidak ada teks yang aman.
 */
function sanitizeMessage(value: unknown): string {
  const text = typeof value === "string" ? value : String(value ?? "")
  return text.replace(/[\r\n]+/g, " ").trim()
}

function flattenMessage(message: string | string[] | undefined): string | undefined {
  if (message === undefined || message === null) return undefined
  const parts = Array.isArray(message) ? message : [message]
  const cleaned = parts.map(sanitizeMessage).filter((part) => part.length > 0)
  return cleaned.length > 0 ? cleaned.join(", ") : undefined
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
        flattenMessage(payload?.message) ?? flattenMessage(candidate.message) ?? FALLBACK_MESSAGE
      return new ApiError(payload?.statusCode ?? candidate.response.status, message)
    }
    // Request terkirim tapi tidak ada respons (server mati / jaringan).
    return new ApiError(FALLBACK_STATUS, NETWORK_MESSAGE)
  }

  if (candidate instanceof Error) {
    const message = flattenMessage(candidate.message) ?? FALLBACK_MESSAGE
    return new ApiError(FALLBACK_STATUS, message)
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
