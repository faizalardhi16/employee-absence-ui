import { useEffect, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getBrowserTimeZoneAbbreviation } from "@/lib/time"

export interface ClockInConfirmDialogProps {
  /** Kontrol visibilitas dialog (state terpusat di pemanggil). */
  open: boolean
  /** Notifikasi perubahan visibilitas (Cancel/Escape/klik luar). */
  onOpenChange: (open: boolean) => void
  /** Aksi saat tombol Confirm diklik — timestamp dicatat di sini. */
  onConfirm: () => void
  /** Sedang memproses: tombol nonaktif & spinner. */
  confirming?: boolean
}

/** Jam live yang memperbarui setiap detik selama dialog terbuka. */
function useLiveNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

function formatClock(now: Date) {
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  return {
    dateLabel,
    timeLabel,
    timeZoneAbbreviation: getBrowserTimeZoneAbbreviation(now),
  }
}

/**
 * ClockInConfirmDialog — konfirmasi clock-in untuk mencegah clock-in tak sengaja.
 * Menampilkan jam live + singkatan zona waktu lokal browser. Fokus awal ada di
 * tombol Cancel (bukan Confirm) agar tombol Enter tidak langsung mencatat.
 * Cancel, Escape, dan klik di luar dialog menutup tanpa mencatat apa pun.
 */
export function ClockInConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  confirming = false,
}: ClockInConfirmDialogProps) {
  const now = useLiveNow()
  const { dateLabel, timeLabel, timeZoneAbbreviation } = formatClock(now)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Cegah ditutup (Escape/klik luar) saat proses clock-in berjalan.
        if (!confirming) onOpenChange(next)
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm clock-in?</DialogTitle>
          <DialogDescription>
            Your clock-in will be recorded with the time shown below. Confirm to start your
            shift, or cancel if this was accidental.
          </DialogDescription>
        </DialogHeader>

        <div
          data-testid="clock-in-confirm-time"
          className="rounded-md border border-border/70 bg-muted/50 px-4 py-3 text-center"
        >
          <p className="text-xs text-muted-foreground">{dateLabel}</p>
          <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
            <time>{timeLabel}</time>
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {timeZoneAbbreviation}
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            autoFocus
            data-autofocus
            disabled={confirming}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="default" disabled={confirming} onClick={onConfirm}>
            {confirming ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}