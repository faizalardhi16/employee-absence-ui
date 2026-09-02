import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { useCountUp } from "./use-count-up"
import { cn } from "@/lib/utils"

export interface KpiCardProps {
  label: string
  value: number
  /** Persentase perubahan vs periode sebelumnya (negatif = turun). */
  delta?: number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  tone: "primary" | "cyan" | "amber" | "rose"
  hint: string
}

const TONE_BAR = {
  primary: "from-primary to-primary/30",
  cyan: "from-chart-2 to-chart-2/30",
  amber: "from-chart-3 to-chart-3/30",
  rose: "from-destructive to-destructive/30",
} as const

const TONE_ICON = {
  primary: "from-primary/15 to-primary/5 text-primary",
  cyan: "from-chart-2/15 to-chart-2/5 text-chart-2",
  amber: "from-chart-3/15 to-chart-3/5 text-chart-3",
  rose: "from-destructive/15 to-destructive/5 text-destructive",
} as const

/** Kartu metrik dengan count-up dan delta vs periode sebelumnya. */
export function KpiCard({
  label,
  value,
  delta,
  prefix = "",
  suffix = "",
  icon: Icon,
  tone,
  hint,
}: KpiCardProps) {
  const animatedValue = useCountUp(value)
  const isUp = (delta ?? 0) >= 0

  return (
    <div className="group relative overflow-hidden rounded-sm border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur-xl transition-colors duration-200 hover:border-ring/35">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
          TONE_BAR[tone]
        )}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {prefix}
            {animatedValue.toLocaleString("id-ID")}
            {suffix}
          </p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br transition-transform duration-200 group-hover:scale-110",
            TONE_ICON[tone]
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      </div>
      {delta !== undefined ? (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            isUp
              ? "bg-chart-2/10 text-chart-2"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {isUp ? (
            <ArrowUpRightIcon className="size-3" aria-hidden />
          ) : (
            <ArrowDownRightIcon className="size-3" aria-hidden />
          )}
          {Math.abs(delta)}%
          <span className="text-muted-foreground">vs periode lalu</span>
        </div>
      ) : null}
    </div>
  )
}