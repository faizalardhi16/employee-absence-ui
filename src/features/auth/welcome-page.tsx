import { ActivityIcon, ArrowUpRightIcon, BadgeCheckIcon, LockKeyholeIcon, RadioIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BrandLogo } from "@/components/layout/brand-logo"
import { appConfig } from "@/config/app-config"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/types/auth"

/** Durasi pengisian progress (ms) sebelum halaman sambutan berakhir. */
const PROGRESS_DURATION_MS = 1_300
/** Jeda singkat setelah progress penuh (tahan tampilan "Siap digunakan"). */
const HOLD_MS = 300
/** Durasi animasi keluar sebelum navigasi ke workspace. */
const EXIT_MS = 320

/** Label tahap yang berganti seiring progress berjalan. */
const STAGES = [
  { at: 26, label: "Menyiapkan workspace…" },
  { at: 52, label: "Memuat modul internal…" },
  { at: 78, label: "Sinkronisasi hak akses…" },
  { at: 100, label: "Siap digunakan" },
] as const

interface WelcomePageProps {
  user: AuthUser
  /** Tujuan setelah halaman sambutan selesai (biasanya "/"). */
  destination: string
}

/**
 * WelcomePage — halaman sambutan penuh layar setelah login berhasil:
 * "Welcome to Internal Workspace" + progress bar yang mengisi, lalu otomatis
 * masuk ke shell. SOLID: mengelola animasi/navigasinya sendiri; login tidak
 * perlu tahu detail timing.
 */
export function WelcomePage({ user, destination }: WelcomePageProps) {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const startedAt = performance.now()
    const updateProgress = () => {
      const now = performance.now()
      const next = Math.min(100, Math.round(((now - startedAt) / PROGRESS_DURATION_MS) * 100))
      setProgress(next)
    }

    const progressTimer = window.setInterval(updateProgress, 80)
    const completeTimer = window.setTimeout(() => {
      setProgress(100)
      setLeaving(true)
      const navigationTimer = window.setTimeout(() => {
        void navigate(destination, { replace: true })
      }, EXIT_MS)
      timersRef.current.push(navigationTimer)
    }, PROGRESS_DURATION_MS + HOLD_MS)

    timersRef.current.push(progressTimer, completeTimer)
    return () => {
      for (const timer of timersRef.current) {
        window.cancelAnimationFrame(timer)
        window.clearInterval(timer)
        window.clearTimeout(timer)
      }
      timersRef.current = []
    }
  }, [destination, navigate])

  const stage =
    [...STAGES].reverse().find((s) => progress >= s.at)?.label ?? STAGES[0].label

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.32),transparent_34%),linear-gradient(160deg,#0f172a_0%,#1d4ed8_55%,#0f172a_100%)] p-4",
        leaving && "animate-out fade-out-0 duration-300 ease-in",
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
      <div className="absolute -top-24 -right-24 size-96 rounded-full border border-white/10 bg-white/5 blur-2xl" />
      <div className="absolute -bottom-32 -left-16 size-[28rem] rounded-full border border-white/10 bg-gradient-to-tr from-cyan-400/20 to-transparent blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl gap-12 py-6 lg:grid-cols-[1fr_360px] lg:items-center lg:gap-20">
        <div className="grid gap-12">
          <div
            className="flex items-center justify-between animate-in fade-in-0 slide-in-from-top-2 duration-500"
            style={{ animationDelay: "40ms" }}
          >
            <BrandLogo className="[&_p]:text-white [&_p:last-child]:text-blue-100/80" />
            <span className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-100/70 sm:flex">
              <span className="size-1.5 rounded-full bg-chart-2 shadow-[0_0_12px_currentColor]" />
              Secure session
            </span>
          </div>

          <div
            className="grid max-w-2xl gap-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-500"
            style={{ animationDelay: "140ms" }}
          >
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <BadgeCheckIcon className="size-4" aria-hidden />
              Access verified
            </p>
            <h1 className="font-heading text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Welcome to your
              <span className="block text-cyan-200">internal workspace.</span>
            </h1>
            <p className="max-w-lg text-base leading-7 text-blue-100/75 sm:text-lg">
              A clear view of the work that keeps your operations moving. We are preparing your secure command center now.
            </p>
          </div>

          <div
            className="flex items-center gap-3 text-sm text-blue-100/70 animate-in fade-in-0 duration-500"
            style={{ animationDelay: "220ms" }}
          >
            <div className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-cyan-200">
              <LockKeyholeIcon className="size-4" aria-hidden />
            </div>
            <span className="max-w-[15rem] truncate">{user.email}</span>
            <ArrowUpRightIcon className="size-4 text-white/40" aria-hidden />
          </div>
        </div>

        <div
          className="grid gap-7 rounded-[1.75rem] border border-white/15 bg-slate-950/25 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 duration-500 sm:p-8"
          style={{ animationDelay: "220ms" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-200/80">Launch sequence</p>
              <p className="text-xl font-semibold tracking-tight text-white">Preparing your view</p>
            </div>
            <ActivityIcon className="size-5 text-cyan-200" aria-hidden />
          </div>

          <div className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <span className="text-sm text-blue-100/70">{stage}</span>
              <span className="font-heading text-3xl font-semibold tracking-tight text-white">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="welcome-progress h-full origin-left rounded-full bg-cyan-200 animate-[welcome-progress_1.3s_linear_forwards]" />
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 pt-5">
            {[
              { label: "Identity confirmed", icon: BadgeCheckIcon },
              { label: "Permissions synced", icon: RadioIcon },
              { label: "Workspace encrypted", icon: LockKeyholeIcon },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-blue-100/75">
                <Icon className="size-4 text-cyan-200" aria-hidden />
                <span>{label}</span>
                <span className="ml-auto size-1.5 rounded-full bg-chart-2" />
              </div>
            ))}
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-100/45">
            {appConfig.appName} · internal operations
          </p>
        </div>
      </div>
    </div>
  )
}