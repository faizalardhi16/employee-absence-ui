import { useEffect, useRef, useState } from "react"

/**
 * useCountUp — animasikan angka dari nilai tampil terakhir ke target
 * (easeOutCubic via requestAnimationFrame). Target berubah → lanjut dari
 * angka yang sedang tampil, tanpa reset ke 0.
 */
export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0)
  const valueRef = useRef(0)

  useEffect(() => {
    const from = valueRef.current
    const delta = target - from
    if (delta === 0) return

    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + delta * eased)
      valueRef.current = next
      setValue(next)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}