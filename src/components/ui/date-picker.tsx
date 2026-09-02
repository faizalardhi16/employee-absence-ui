import * as React from "react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/** Minggu dimulai Senin (locale Indonesia). */
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const DEFAULT_FORMATTER = (date: Date): string =>
  date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export interface DatePickerProps {
  value?: Date | null
  onValueChange?: (date: Date | null) => void
  disabled?: boolean
  /** Tanggal paling awal yang bisa dipilih (inklusif). */
  min?: Date
  /** Tanggal paling akhir yang bisa dipilih (inklusif). */
  max?: Date
  placeholder?: string
  formatDate?: (date: Date) => string
  className?: string
}

/**
 * DatePicker — pilih tanggal via popover kalender.
 * Animasi: popover fade/zoom/slide (PopoverContent) + efek "pop" pada hari
 * yang baru dipilih. Styling memakai design token (--primary, --ring,
 * --muted, --border, dll). SOLID: hanya presentasi & state pilihan.
 */
export function DatePicker({
  value,
  onValueChange,
  disabled = false,
  min,
  max,
  placeholder = "Pilih tanggal",
  formatDate = DEFAULT_FORMATTER,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(() => firstOfMonth(value ?? new Date()))

  // Saat popover dibuka, arahkan kalender ke bulan dari nilai terpilih (atau hari ini).
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setViewDate(firstOfMonth(value ?? new Date()))
    }
  }

  const minDay = min ? startOfDay(min) : null
  const maxDay = max ? startOfDay(max) : null

  const canGoPrev =
    !minDay || viewDate.getTime() > firstOfMonth(minDay).getTime()
  const canGoNext =
    !maxDay || viewDate.getTime() < firstOfMonth(maxDay).getTime()

  const today = startOfDay(new Date())
  const todaySelectable = (!minDay || today >= minDay) && (!maxDay || today <= maxDay)

  // ---- Bangun grid kalender (6 baris × 7 kolom, offset dari Senin) ----
  const offset = (viewDate.getDay() + 6) % 7
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate()
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const monthLabel = viewDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  })

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-icon="inline-start"
          className={cn(
            "group/datepicker h-9 w-full justify-start gap-2 font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-left">
            {value ? formatDate(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-2.5">
        <div className="grid gap-2.5">
          {/* Navigasi bulan */}
          <div className="flex items-center justify-between gap-1 px-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={!canGoPrev}
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeftIcon aria-hidden />
            </Button>
            <p className="text-sm font-medium capitalize">{monthLabel}</p>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={!canGoNext}
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                )
              }
              aria-label="Bulan berikutnya"
            >
              <ChevronRightIcon aria-hidden />
            </Button>
          </div>

          {/* Nama hari */}
          <div
            className="grid grid-cols-7 gap-1"
            role="row"
            aria-label="Nama hari"
          >
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="flex size-8 items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grid tanggal */}
          <div className="grid gap-1" role="grid" aria-label={monthLabel}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1" role="row">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <span key={dayIndex} className="size-8" />
                  }
                  const selected = !!value && isSameDay(day, value)
                  const isToday = isSameDay(day, today)
                  const outOfRange =
                    (minDay !== null && day < minDay) ||
                    (maxDay !== null && day > maxDay)

                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      disabled={outOfRange}
                      onClick={() => {
                        onValueChange?.(day)
                        setOpen(false)
                      }}
                      aria-pressed={selected}
                      aria-label={day.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-sm text-sm transition-all duration-150 ease-out outline-none",
                        "hover:bg-muted hover:text-foreground",
                        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                        "disabled:pointer-events-none disabled:opacity-35",
                        isToday && !selected && "ring-1 ring-inset ring-ring/60",
                        selected &&
                          "bg-primary font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(37,99,235,0.25)] animate-in zoom-in-90 fade-in-0 duration-150"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer aksi */}
          <div className="flex items-center justify-between border-t border-border/60 pt-2">
            <Button
              variant="ghost"
              size="xs"
              disabled={!todaySelectable}
              onClick={() => {
                onValueChange?.(today)
                setOpen(false)
              }}
            >
              Hari ini
            </Button>
            <Button
              variant="ghost"
              size="xs"
              disabled={!value}
              onClick={() => {
                onValueChange?.(null)
                setOpen(false)
              }}
            >
              Bersihkan
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}