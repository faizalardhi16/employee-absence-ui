import { useEffect, useId, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export interface AreaChartProps {
  values: number[]
  labels: string[]
  className?: string
  /** Warna garis & area (Tailwind text color, mis. "text-primary"). */
  colorClass?: string
}

const WIDTH = 600
const HEIGHT = 180
const PAD_X = 8
const PAD_Y = 16
const GRID_LINES = 4

/**
 * AreaChart — grafik garis berisi area gradient, grid, dan tooltip interaktif.
 * Garis "menggambar" sendiri saat mount (stroke-dashoffset), titik terdekat
 * dari kursor disorot dengan garis bantu + tooltip.
 */
export function AreaChart({
  values,
  labels,
  className,
  colorClass = "text-primary",
}: AreaChartProps) {
  const gradientId = useId()
  const [drawn, setDrawn] = useState(false)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const innerW = WIDTH - PAD_X * 2
  const innerH = HEIGHT - PAD_Y * 2
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0

  const pointX = (index: number) => PAD_X + index * stepX
  const pointY = (value: number) =>
    PAD_Y + innerH - ((value - min) / span) * innerH

  const linePath = values
    .map((value, index) => `${index === 0 ? "M" : "L"} ${pointX(index)} ${pointY(value)}`)
    .join(" ")
  const areaPath = `${linePath} L ${pointX(values.length - 1)} ${HEIGHT - PAD_Y} L ${PAD_X} ${HEIGHT - PAD_Y} Z`

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg || values.length === 0) return
    const rect = svg.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH
    const index = Math.round((x - PAD_X) / stepX)
    setHoverIndex(Math.min(Math.max(index, 0), values.length - 1))
  }

  const hover =
    hoverIndex !== null
      ? { index: hoverIndex, x: pointX(hoverIndex), y: pointY(values[hoverIndex]) }
      : null
  const tooltipLeft = hover ? (hover.x / WIDTH) * 100 : 0
  const tooltipTop = hover ? (hover.y / HEIGHT) * 100 : 0

  return (
    <div className={cn("relative w-full select-none", colorClass, className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Grafik area"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid horizontal */}
        {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
          const y = PAD_Y + (innerH / GRID_LINES) * i
          const value = max - (span / GRID_LINES) * i
          return (
            <g key={`grid-${i}`}>
              <line x1={PAD_X} x2={WIDTH - PAD_X} y1={y} y2={y} className="stroke-border/70" strokeWidth={1} />
              <text x={WIDTH - PAD_X - 2} y={y - 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
                {Math.round(value).toLocaleString("id-ID")}
              </text>
            </g>
          )
        })}

        {/* Area + garis */}
        <path d={areaPath} fill={`url(#${gradientId})`} className="animate-in fade-in-0 duration-500" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Garis bantu + titik hover */}
        {hover ? (
          <g className="animate-in fade-in-0 duration-100">
            <line x1={hover.x} x2={hover.x} y1={PAD_Y} y2={HEIGHT - PAD_Y} className="stroke-foreground/25" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={hover.x} cy={hover.y} r={6} className="fill-background stroke-current" strokeWidth={2} />
            <circle cx={hover.x} cy={hover.y} r={2.5} className="fill-current" />
          </g>
        ) : null}
      </svg>

      {/* Label sumbu X (jarang) */}
      <div className="mt-1 flex justify-between px-0.5 text-[10px] text-muted-foreground">
        {labels.length <= 8
          ? labels.map((label, index) => (
              <span
                key={label}
                className={cn("font-bold", hoverIndex === index && "text-foreground")}
              >
                {label}
              </span>
            ))
          : [0, Math.floor(labels.length / 2), labels.length - 1].map((index) => (
              <span key={labels[index]} className="font-bold">
                {labels[index]}
              </span>
            ))}
      </div>

      {/* Tooltip */}
      {hover ? (
        <div
          className={cn(
            "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-sm border border-border/70 bg-popover px-2 py-1 text-xs shadow-md animate-in fade-in-0 zoom-in-90 duration-100",
            hoverIndex === 0 && "translate-x-0",
            hoverIndex === values.length - 1 && "-translate-x-full"
          )}
          style={{ left: `${tooltipLeft}%`, top: `${tooltipTop}%` }}
        >
          <p className="font-medium text-foreground">
            {values[hover.index].toLocaleString("id-ID")} laporan
          </p>
          <p className="text-muted-foreground">{labels[hover.index]}</p>
        </div>
      ) : null}
    </div>
  )
}