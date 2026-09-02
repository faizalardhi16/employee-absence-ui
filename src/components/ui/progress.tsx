import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

interface ProgressProps {
  /** Nilai 0-100. Tanpa value (atau indeterminate=true) = mode indeterminate. */
  value?: number
  /** Mode tak tentu: bar berjalan terus (loading tanpa persentase pasti). */
  indeterminate?: boolean
  className?: string
  indicatorClassName?: string
}

/**
 * Progress — bar progres dengan dua mode:
 * - determinate: `value` 0-100, transisi lebar halus;
 * - indeterminate: bar berjalan terus, untuk loading yang durasinya tak tentu.
 * SOLID: murni presentasi; logika nilai datang dari pemanggil.
 */
export function Progress({
  value,
  indeterminate = false,
  className,
  indicatorClassName,
}: ProgressProps) {
  const isIndeterminate = indeterminate || value === undefined
  const clamped = Math.min(100, Math.max(0, value ?? 0))

  return (
    <ProgressPrimitive.Root
      value={isIndeterminate ? undefined : clamped}
      max={100}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 rounded-full bg-primary transition-transform duration-300 ease-out",
          isIndeterminate &&
            "w-1/3 animate-[progress-indeterminate_1.1s_ease-in-out_infinite]",
          indicatorClassName,
        )}
        style={{
          transform: isIndeterminate ? undefined : `translateX(-${100 - clamped}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  )
}