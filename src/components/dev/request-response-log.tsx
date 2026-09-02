import {
  ChevronDownIcon,
  ChevronRightIcon,
  NetworkIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRequestLogStore } from "@/stores/request-log.store"
import type { RequestLogEntry } from "@/stores/request-log.store"
import { cn } from "@/lib/utils"

const STATUS_TONE_CLASSES: Record<string, string> = {
  ok: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  redirect: "border-chart-1/30 bg-chart-1/10 text-chart-1",
  client: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  server: "border-destructive/30 bg-destructive/10 text-destructive",
}

/** Klasifikasi status HTTP → tone badge. 0 = gagal tanpa respons. */
function statusTone(status: number): string {
  if (status >= 500 || status === 0) return STATUS_TONE_CLASSES.server
  if (status >= 400) return STATUS_TONE_CLASSES.client
  if (status >= 300) return STATUS_TONE_CLASSES.redirect
  return STATUS_TONE_CLASSES.ok
}

function statusLabel(status: number): string {
  return status === 0 ? "ERR" : String(status)
}

const METHOD_BADGE_CLASSES: Record<string, string> = {
  GET: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  POST: "bg-primary/10 text-primary border-primary/25",
  PUT: "bg-chart-1/10 text-chart-1 border-chart-1/30",
  PATCH: "bg-chart-1/10 text-chart-1 border-chart-1/30",
  DELETE: "bg-destructive/10 text-destructive border-destructive/30",
}

/** Badge kecil warna metode HTTP (fallback outline). */
function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={cn(
        "rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-semibold",
        METHOD_BADGE_CLASSES[method] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {method}
    </span>
  )
}

/** Waktu lokal ringkas (HH:MM:SS). */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

/**
 * RequestResponseLog — inspektor ringan request/response HTTP dari aplikasi.
 * Tombol mengambang di pojok kanan bawah; panel menampilkan daftar log
 * (metode, URL, status, durasi) dan detail body request & response.
 * SOLID: murni presentasi; data datang dari RequestLogStore.
 */
export function RequestResponseLog() {
  const entries = useRequestLogStore((s) => s.entries)
  const clear = useRequestLogStore((s) => s.clear)
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)

  // Auto-scroll ke entri terbaru hanya jika pengguna sedang di dasar daftar.
  useEffect(() => {
    const list = listRef.current
    if (!list || !open) return
    if (stickToBottomRef.current) {
      list.scrollTop = list.scrollHeight
    }
  }, [entries.length, open])

  const handleScroll = () => {
    const list = listRef.current
    if (!list) return
    stickToBottomRef.current =
      list.scrollHeight - list.scrollTop - list.clientHeight < 24
  }

  const errorCount = entries.filter((entry) => entry.isError).length

  return (
    <>
      {/* Tombol trigger mengambang */}
      <button
        type="button"
        aria-label="Buka log request & response"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="fixed right-4 bottom-4 z-50 flex size-11 items-center justify-center rounded-full border border-border/70 bg-card/95 text-muted-foreground shadow-[0_10px_28px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <NetworkIcon className="size-5" aria-hidden />
        {entries.length > 0 ? (
          <span
            className={cn(
              "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold text-white",
              errorCount > 0 ? "bg-destructive" : "bg-chart-2",
            )}
          >
            {errorCount > 0 ? `${errorCount}!` : entries.length}
          </span>
        ) : null}
      </button>

      {/* Panel log */}
      {open ? (
        <div className="fixed right-4 bottom-16 z-50 flex max-h-[72vh] w-[min(480px,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-border/70 bg-card/95 shadow-[0_18px_48px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <NetworkIcon className="size-4 text-primary" aria-hidden />
              Request · Response Log
            </p>
            <div className="flex items-center gap-1">
              <span className="mr-1 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {entries.length} entri
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Bersihkan log"
                onClick={() => {
                  clear()
                  setExpandedId(null)
                }}
                disabled={entries.length === 0}
              >
                <Trash2Icon className="size-3.5" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup panel log"
                onClick={() => setOpen(false)}
              >
                <XIcon className="size-3.5" aria-hidden />
              </Button>
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto"
          >
            {entries.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Belum ada request tercatat. Lakukan aksi apa pun di aplikasi…
              </p>
            ) : (
              entries.map((entry) => (
                <LogRow
                  key={entry.id}
                  entry={entry}
                  expanded={expandedId === entry.id}
                  onToggle={() =>
                    setExpandedId((current) => (current === entry.id ? null : entry.id))
                  }
                />
              ))
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}

/** Satu baris log: ringkasan + detail request/response saat diperluas. */
function LogRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: RequestLogEntry
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60"
      >
        {expanded ? (
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <MethodBadge method={entry.method} />
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
          {entry.url}
        </span>
        <Badge
          variant="outline"
          className={cn("border font-mono text-[10px]", statusTone(entry.status))}
        >
          {statusLabel(entry.status)}
        </Badge>
        {entry.durationMs !== undefined ? (
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {entry.durationMs} ms
          </span>
        ) : null}
      </button>

      {expanded ? (
        <div className="grid gap-2 border-t border-border/50 bg-muted/30 px-3 py-2.5">
          <BodyBlock label="Request" time={entry.timestamp} body={entry.requestBody} />
          <BodyBlock label="Response" time={entry.timestamp} body={entry.responseBody} />
        </div>
      ) : null}
    </div>
  )
}

/** Blok body (Request/Response) dalam <pre> monospace. */
function BodyBlock({ label, time, body }: { label: string; time: number; body?: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {formatTime(time)}
        </span>
      </p>
      <pre className="max-h-48 overflow-auto rounded-sm border border-border/70 bg-background/80 p-2.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-foreground">
        {body ?? <span className="text-muted-foreground/60">(kosong)</span>}
      </pre>
    </div>
  )
}