/**
 * Logger terstruktur satu-satunya aplikasi (satu instance, dipakai semua modul).
 * Setiap event dicetak SATU baris JSON agar aman untuk log aggregator.
 *
 * Kontrak: JANGAN mengirim secret (password/token) ke logger — pemanggil
 * wajib melakukan redaksi sebelum memanggil.
 */
export type LogLevel = "debug" | "info" | "warn" | "error"

const LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const minSeverity = import.meta.env.DEV ? LEVEL_SEVERITY.debug : LEVEL_SEVERITY.info

type LogMeta = Record<string, unknown>

function write(level: LogLevel, msg: string, meta?: LogMeta): void {
  if (LEVEL_SEVERITY[level] < minSeverity) return
  const entry = { level, time: new Date().toISOString(), msg, ...meta }
  const line = JSON.stringify(entry)
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

export const logger = {
  debug: (msg: string, meta?: LogMeta) => write("debug", msg, meta),
  info: (msg: string, meta?: LogMeta) => write("info", msg, meta),
  warn: (msg: string, meta?: LogMeta) => write("warn", msg, meta),
  error: (msg: string, meta?: LogMeta) => write("error", msg, meta),
}
