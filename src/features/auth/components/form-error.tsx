import { ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"

/** Pesan error form (validasi inline & error API) — dipakai Login & Register. */
export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-sm border border-destructive/30",
        "bg-destructive/10 px-3 py-2 text-xs text-destructive",
      )}
    >
      <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  )
}