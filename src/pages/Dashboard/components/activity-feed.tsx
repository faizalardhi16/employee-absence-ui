import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ActivityItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
  time: string
  tone: "primary" | "cyan" | "amber" | "rose"
}

export interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

const TONE_DOT = {
  primary: "bg-primary",
  cyan: "bg-chart-2",
  amber: "bg-chart-3",
  rose: "bg-destructive",
} as const

const TONE_ICON = {
  primary: "bg-primary/10 text-primary",
  cyan: "bg-chart-2/10 text-chart-2",
  amber: "bg-chart-3/10 text-chart-3",
  rose: "bg-destructive/10 text-destructive",
} as const

/** Umpan aktivitas: timeline vertikal dengan dot warna + sorot hover. */
export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const Icon = item.icon
        const isLast = index === items.length - 1
        return (
          <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Garis timeline */}
            {!isLast ? (
              <span className="absolute top-7 left-3.5 h-[calc(100%-1.25rem)] w-px bg-border/70" aria-hidden />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110",
                TONE_ICON[item.tone]
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              <span className={cn("absolute -top-0.5 -right-0.5 size-1.5 rounded-full ring-2 ring-card", TONE_DOT[item.tone])} aria-hidden />
            </span>

            <div className="min-w-0 flex-1 rounded-sm border border-transparent px-2 py-1 transition-colors duration-150 hover:border-border/60 hover:bg-muted/40">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <time className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {item.time}
                </time>
              </div>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {item.description}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}