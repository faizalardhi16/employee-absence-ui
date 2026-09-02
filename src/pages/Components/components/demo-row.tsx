import type { ReactNode } from "react"

/** Baris demo: label + area preview berpola putus-putus. */
export function DemoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-2 rounded-sm border border-dashed border-border/80 bg-background/50 p-4">
        {children}
      </div>
    </div>
  )
}