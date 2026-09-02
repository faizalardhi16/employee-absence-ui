/**
 * RequestLogStore — buffer ring request/response HTTP terakhir, dipakai
 * komponen RequestResponseLog untuk inspeksi apa yang dikirim & diterima.
 * SRP: hanya menyimpan data; logika penangkapan ada di lib/api.ts.
 */
import { create } from "zustand"

/** Batas isi body yang dicatat (karakter) — mencegah UI berat. */
const BODY_CHAR_LIMIT = 4_000
/** Jumlah entri maksimal yang disimpan (buffer ring). */
const MAX_ENTRIES = 50

/** Kunci yang dianggap sensitif → nilai diganti "••••••" sebelum disimpan. */
const SENSITIVE_KEY_PATTERN = /password|passwd|token|secret|authorization|api[-_]?key/i

export interface RequestLogEntry {
  id: string
  /** Epoch ms saat request selesai. */
  timestamp: number
  method: string
  /** Path relatif (mis. /api/auth/login). */
  url: string
  /** 0 = gagal tanpa respons (network/error). */
  status: number
  durationMs?: number
  /** Body request (sudah diredaksi), string JSON. */
  requestBody?: string
  /** Body response (sudah diredaksi), string JSON. */
  responseBody?: string
  isError: boolean
}

interface RequestLogStore {
  entries: RequestLogEntry[]
  addEntry: (entry: Omit<RequestLogEntry, "id" | "timestamp">) => void
  clear: () => void
}

export const useRequestLogStore = create<RequestLogStore>()((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        ...state.entries,
        { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
      ].slice(-MAX_ENTRIES),
    })),
  clear: () => set({ entries: [] }),
}))

// ================= Serialisasi & redaksi =================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Ganti nilai kunci sensitif dengan "••••••" (rekursif, kedalaman dibatasi). */
export function redactSensitive(value: unknown, depth = 0): unknown {
  if (depth > 6) return value
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item, depth + 1))
  if (isRecord(value)) {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? "••••••" : redactSensitive(item, depth + 1)
    }
    return out
  }
  return value
}

/** Serialisasi body menjadi string aman untuk ditampilkan (dibatasi panjang). */
export function serializeLogBody(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === "string") {
    return value.length > BODY_CHAR_LIMIT
      ? `${value.slice(0, BODY_CHAR_LIMIT)}\n… (terpotong)`
      : value
  }
  if (typeof FormData !== "undefined" && value instanceof FormData) {
    const fields = Array.from(value.keys())
    return `[FormData: ${fields.length} field — ${fields.join(", ")}]`
  }
  try {
    const json = JSON.stringify(value)
    return json.length > BODY_CHAR_LIMIT
      ? `${json.slice(0, BODY_CHAR_LIMIT)}\n… (terpotong)`
      : json
  } catch {
    return String(value)
  }
}