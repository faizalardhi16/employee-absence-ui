import { useEffect, useId, useState } from "react"

import { cn } from "@/lib/utils"

export interface DonutSegment {
  label: string
  value: number
  /** Kelas Tailwind warna stroke, mis. "stroke-chart-1". */
  colorClass: string
}

export interface DonutChartProps {
  segments: DonutSegment[]
  /** Teks di tengah donut (mis. "Total"). */
  centerLabel: string
  className?: string
}

const SIZE = 160
const STROKE = 18
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_DEGREES = 3

/** Donut chart dengan animasi "tumbuh" tersegmentasi + legenda interaktif. */
export function DonutChart({ segments, centerLabel, className }: DonutChartProps) {
  const uid = useId()
  const [drawn, setDrawn] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const gapLength = (GAP_DEGREES / 360) * CIRCUMFERENCE

  /** Hitung offset awal tiap segmen tanpa mutasi variabel render. */
  const arcs = segments.reduce<
    { label: string; length: number; offset: number; colorClass: string }[]
  >((acc, segment) => {
    const length = (segment.value / total) * CIRCUMFERENCE
    const offset = acc.length === 0 ? 0 : acc[acc.length - 1].offset + acc[acc.length - 1].length
    acc.push({ label: segment.label, length, offset, colorClass: segment.colorClass })
    return acc
  }, [])

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:gap-6", className)}>
      <div className="relative shrink-0">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Diagram donat">
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {arcs.map((arc, index) => {
              const dashArray = `${Math.max(arc.length - gapLength, 1)} ${CIRCUMFERENCE}`
              return (
                <circle
                  key={`${uid}-${arc.label}`}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  className={cn(
                    arc.colorClass,
                    "transition-[stroke-width,opacity] duration-200",
                    activeIndex === null || activeIndex === index ? "opacity-100" : "opacity-30"
                  )}
                  strokeWidth={activeIndex === index ? STROKE + 4 : STROKE}
                  strokeDasharray={dashArray}
                  strokeDashoffset={drawn ? arc.offset : 0}
                  strokeLinecap="butt"
                  style={{
                    transition:
                      "stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1), stroke-width 200ms ease, opacity 200ms ease",
                    transitionDelay: drawn ? `${index * 90}ms` : "0ms",
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              )
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-xl font-semibold tracking-tight tabular-nums">
              {total.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {centerLabel}
            </p>
          </div>
        </div>
      </div>

      <ul className="grid w-full gap-1.5">
        {segments.map((segment, index) => {
          const percent = Math.round((segment.value / total) * 100)
          const isActive = activeIndex === index
          return (
            <li
              key={segment.label}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={cn(
                "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 transition-colors duration-150",
                isActive && "bg-muted/70"
              )}
            >
              <span className={cn("size-2.5 shrink-0 rounded-full", segment.colorClass.replace("stroke-", "bg-"))} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-xs font-bold text-muted-foreground">
                {segment.label}
              </span>
              <span className="text-xs font-medium tabular-nums">{segment.value.toLocaleString("id-ID")}</span>
              <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">
                {percent}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}