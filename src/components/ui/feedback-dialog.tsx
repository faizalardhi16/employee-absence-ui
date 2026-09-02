import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type FeedbackTone = "success" | "warning" | "confirm" | "failed"

/** Konfigurasi visual per varian: ikon + warna lingkaran ikon. */
const TONE_CONFIG: Record<FeedbackTone, { icon: LucideIcon; iconClasses: string }> = {
  success: {
    icon: CircleCheckIcon,
    iconClasses: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  },
  warning: {
    icon: TriangleAlertIcon,
    iconClasses: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  },
  confirm: {
    icon: CircleHelpIcon,
    iconClasses: "border-primary/25 bg-primary/10 text-primary",
  },
  failed: {
    icon: CircleAlertIcon,
    iconClasses: "border-destructive/30 bg-destructive/10 text-destructive",
  },
}

export interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  /** Ikon kustom; default ikon sesuai varian. */
  icon?: LucideIcon
  /** Konten tambahan di bawah deskripsi (mis. daftar detail error). */
  children?: ReactNode
  // ---- Footer ----
  confirmLabel?: string
  /**
   * Aksi tombol utama. Tanpa onConfirm, tombol hanya menutup dialog.
   * Dengan onConfirm, dialog tetap terbuka sampai pemanggil menutupnya
   * (mis. setelah aksi async selesai via confirming).
   */
  onConfirm?: () => void
  /** Sedang memproses: tombol utama ber-spinner & semua aksi nonaktif. */
  confirming?: boolean
  /** Tombol utama bergaya destructive (mis. konfirmasi hapus). */
  danger?: boolean
  cancelLabel?: string
  onCancel?: () => void
  /** Sembunyikan tombol batal (biasanya dipakai Success/Failed). */
  hideCancel?: boolean
  className?: string
}

interface FeedbackDialogViewProps extends FeedbackDialogProps {
  tone: FeedbackTone
}

/**
 * FeedbackDialogView — dasar semua dialog feedback (success/warning/confirm/
 * failed). SOLID: satu implementasi; varian hanya menyetel tone + default
 * label. Ikon dalam lingkaran berwarna sesuai tone, footer aksi di kanan.
 */
function FeedbackDialogView({
  tone,
  open,
  onOpenChange,
  title,
  description,
  icon: IconOverride,
  children,
  confirmLabel,
  onConfirm,
  confirming = false,
  danger = false,
  cancelLabel = "Batal",
  onCancel,
  hideCancel = false,
  className,
}: FeedbackDialogViewProps) {
  const { icon: ToneIcon, iconClasses } = TONE_CONFIG[tone]
  const Icon = IconOverride ?? ToneIcon

  const handleCancel = () => {
    if (confirming) return
    onCancel?.()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (confirming) return
    if (onConfirm) {
      onConfirm()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Cegah ditutup (Escape/overlay) saat proses masih berjalan.
        if (!confirming) onOpenChange(next)
      }}
    >
      <DialogContent showCloseButton={!confirming} className={cn("sm:max-w-sm", className)}>
        <DialogHeader className="items-center text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full border",
              iconClasses,
            )}
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <DialogTitle className="mt-1 text-lg">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="max-w-xs">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {children}

        <DialogFooter>
          {!hideCancel ? (
            <Button variant="outline" onClick={handleCancel} disabled={confirming}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            variant={danger ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Sukses: pemberitahuan operasi berhasil (tombol OK saja). */
export function SuccessDialog(props: FeedbackDialogProps) {
  return <FeedbackDialogView tone="success" confirmLabel="OK" hideCancel {...props} />
}

/** Peringatan: pemberitahuan risiko/kondisi khusus (tombol OK saja). */
export function WarningDialog(props: FeedbackDialogProps) {
  return <FeedbackDialogView tone="warning" confirmLabel="OK" hideCancel {...props} />
}

/** Konfirmasi: butuh keputusan pengguna (Batal + Konfirmasi). */
export function ConfirmDialog(props: FeedbackDialogProps) {
  return <FeedbackDialogView tone="confirm" confirmLabel="Konfirmasi" {...props} />
}

/** Gagal: pemberitahuan error (tombol OK saja). */
export function FailedDialog(props: FeedbackDialogProps) {
  return <FeedbackDialogView tone="failed" confirmLabel="OK" hideCancel {...props} />
}