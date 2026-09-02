import { CheckCircle2Icon } from "lucide-react"

/** Kotak info kecil (email/user id) di panel "Sesi & Hak Akses". */
export function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/70 bg-muted/40 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}

export function SessionStatus() {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-chart-2/30 bg-chart-2/10 px-3 py-2 text-xs font-medium text-chart-2">
      <CheckCircle2Icon className="size-4" aria-hidden />
      Session valid — cookie HttpOnly aktif
    </div>
  )
}