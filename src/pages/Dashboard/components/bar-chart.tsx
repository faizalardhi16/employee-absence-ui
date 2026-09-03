import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export interface BarDatum {
  label: string
  value: number
}

export interface BarChartProps {
  data: BarDatum[]
  className?: string
  /** Warna bar (Tailwind text color, mis. "text-primary"). */
  colorClass?: string
}

const WIDTH = 600
const HEIGHT = 160
const PAD_Y = 12
const BAR_WIDTH = 22

/**
 * BarChart — bar vertikal dengan animasi tumbuh dari bawah saat mount,
 * hover menyorot bar + tooltip nilai.
 */
export function BarChart({ data, className, colorClass = "text-primary" }: BarChartProps) {
  const [drawn, setDrawn] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const max = Math.max(...data.map((datum) => datum.value))
  const slot = WIDTH / data.length
  const barHeight = (value: number) => ((value / max) * (HEIGHT - PAD_Y * 2))

  return (
    <div className={cn("relative w-full select-none", colorClass, className)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Grafik batang"
        onMouseLeave={() => setActiveIndex(null)}
      >
        {data.map((datum, index) => {
          const x = slot * index + (slot - BAR_WIDTH) / 2
          const height = barHeight(datum.value)
          const y = HEIGHT - PAD_Y - height
          const isActive = activeIndex === index
          return (
            <g
              key={datum.label}
              onMouseEnter={() => setActiveIndex(index)}
              style={{
                transform: `scaleY(${drawn ? 1 : 0})`,
                transformOrigin: `0px ${HEIGHT - PAD_Y}px`,
                transition: `transform 500ms cubic-bezier(0.16,1,0.3,1) ${index * 60}ms`,
              }}
            >
              <rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={height}
                rx={4}
                className={cn(
                  "fill-current transition-[fill,opacity] duration-200",
                  isActive ? "opacity-100" : "opacity-75"
                )}
              />
              {isActive ? (
                <text
                  x={x + BAR_WIDTH / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium tabular-nums"
                >
                  {datum.value.toLocaleString("id-ID")}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex justify-between px-0.5 text-[10px] text-muted-foreground">
        {data.map((datum, index) => (
          <span
            key={datum.label}
            className={cn(
              "max-w-16 truncate font-bold transition-colors",
              activeIndex === index && "text-foreground"
            )}
          >
            {datum.label}
          </span>
        ))}
      </div>
    </div>
  )
}