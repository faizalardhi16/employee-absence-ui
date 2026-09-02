import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

const SPINNER_SIZE_CLASSES = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-8",
} as const

interface LoadingSpinnerProps {
  size?: keyof typeof SPINNER_SIZE_CLASSES
  /** Teks di samping spinner (mis. status "Menyimpan…"). */
  label?: string
  className?: string
}

/** Spinner loading inline — dipakai di tombol, teks, atau area kecil. */
export function LoadingSpinner({ size = "md", label, className }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Memuat"}
      className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
    >
      <Loader2Icon className={cn("animate-spin text-current", SPINNER_SIZE_CLASSES[size])} aria-hidden />
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </span>
  )
}

interface PageLoaderProps {
  label?: string
  description?: string
  className?: string
}

/** Halaman loading penuh — dipakai saat validasi sesi, transisi, dll. */
export function PageLoader({
  label = "Memuat…",
  description,
  className,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("grid min-h-dvh place-items-center p-4", className)}
    >
      <div className="grid justify-items-center gap-4 text-center">
        <LoadingSpinner size="lg" />
        <div className="grid gap-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </div>
  )
}