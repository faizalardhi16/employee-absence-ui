import { Loader2Icon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { FormEvent, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface DetailSegment {
  /** Id segmen; harus sama dengan `id` pada DetailSection tujuan. */
  id: string
  label: string
  icon?: LucideIcon
}

export interface DetailHeaderProps {
  /** Label kecil di atas judul, mis. "Detail / Laporan #A-1042". */
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Aksi kanan header, mis. tombol kembali. */
  actions?: ReactNode
}

export interface DetailLayoutProps {
  segments: DetailSegment[]
  header: DetailHeaderProps
  /** Konten utama — biasanya kumpulan DetailSection. */
  children: ReactNode
  /** Teks bantuan di sisi kiri footer (mis. status penyimpanan). */
  footerHint?: ReactNode
  // ---- Kontrol submit (footer) ----
  onSubmit?: () => void
  submitting?: boolean
  submitDisabled?: boolean
  submitLabel?: string
  onCancel?: () => void
  cancelLabel?: string
}

/**
 * DetailLayout — kerangka halaman detail dengan navigasi segmen di kiri,
 * header, form di area utama, dan footer aksi (submit) yang menempel di
 * bawah viewport. SOLID: layout murni presentasi; konten datang dari props.
 */
export function DetailLayout({
  segments,
  header,
  children,
  footerHint,
  onSubmit,
  submitting = false,
  submitDisabled = false,
  submitLabel = "Simpan",
  onCancel,
  cancelLabel = "Batal",
}: DetailLayoutProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.()
  }

  return (
    <div className="flex flex-col gap-5">
      <DetailHeader {...header} />

      <div className="grid items-start gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
        <SegmentNav segments={segments} />
        <div className="flex min-w-0 flex-col gap-5">
          {onSubmit ? (
            <form onSubmit={handleSubmit} noValidate className="contents">
              {children}
              <DetailFooter
                hint={footerHint}
                submitting={submitting}
                submitDisabled={submitDisabled}
                submitLabel={submitLabel}
                onCancel={onCancel}
                cancelLabel={cancelLabel}
              />
            </form>
          ) : (
            <>
              {children}
              <DetailFooter
                hint={footerHint}
                submitting={submitting}
                submitDisabled={submitDisabled}
                submitLabel={submitLabel}
                onCancel={onCancel}
                cancelLabel={cancelLabel}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Header ----------

function DetailHeader({ eyebrow, title, description, actions }: DetailHeaderProps) {
  return (
    <section className="glass-panel rounded-md p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  )
}

// ---------- Navigasi segmen (rail kiri) ----------

/**
 * Garis aktif scrollspy, diukur dari atas viewport: sedikit di bawah topbar.
 * Klik navigasi mengarahkan segmen tepat ke garis ini (dihitung manual,
 * karena scrollIntoView + scroll-margin mendaratkan segmen lebih rendah —
 * offset tepi atas kontainer scroll yang berada di bawah topbar).
 */
const SPY_LINE_OFFSET = 96

/** Kontainer scroll halaman detail: marker Radix ScrollArea (dipakai AppShell). */
function findScrollViewport(element: Element): HTMLElement | null {
  return element.closest<HTMLElement>(
    '[data-slot="scroll-area-viewport"], [data-radix-scroll-area-viewport]',
  )
}

/**
 * Scrollspy berbasis posisi. Kontainer scroll dicari lewat marker Radix
 * ScrollArea (AppShell selalu memakai ScrollArea) — komputed `overflow`
 * tidak bisa dipakai karena Radix mengubahnya secara dinamis saat diukur.
 * Segmen aktif = segmen terakhir yang bagian atasnya melewati garis atas
 * viewport; di dasar halaman, segmen terakhir selalu aktif. Override dipakai
 * saat klik navigasi (langsung highlight), lalu dibersihkan saat scroll.
 */
function useActiveSegment(segmentIds: string[]) {
  const [override, setOverride] = useState<string | null>(null)
  const [spy, setSpy] = useState<string | null>(segmentIds[0] ?? null)

  useEffect(() => {
    if (segmentIds.length === 0) return
    const sections = segmentIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    const first = sections[0]
    const firstId = segmentIds[0] ?? null
    const lastId = segmentIds[segmentIds.length - 1] ?? null

    const scrollContainer = first ? findScrollViewport(first) : null
    const isAtBottom = () => {
      if (!scrollContainer) return false
      return (
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 4
      )
    }

    let frame = 0
    const update = () => {
      frame = 0
      setOverride(null)
      if (isAtBottom()) {
        if (lastId) setSpy(lastId)
        return
      }

      let current = firstId
      for (const id of segmentIds) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= SPY_LINE_OFFSET) {
          current = id
        }
      }
      setSpy(current)
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    scrollContainer?.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      scrollContainer?.removeEventListener("scroll", onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [segmentIds])

  return { active: override ?? spy, setOverride }
}

function SegmentNav({ segments }: { segments: DetailSegment[] }) {
  const segmentIds = useMemo(
    () => segments.map((segment) => segment.id),
    [segments],
  )
  const { active, setOverride } = useActiveSegment(segmentIds)

  const scrollTo = (id: string) => {
    // Highlight segera (optimistic) — target mungkin sudah tak bisa discroll lagi.
    setOverride(id)
    const section = document.getElementById(id)
    const viewport = section ? findScrollViewport(section) : null
    if (section && viewport) {
      const topInContent = section.getBoundingClientRect().top + viewport.scrollTop
      viewport.scrollTo({ top: topInContent - SPY_LINE_OFFSET, behavior: "smooth" })
    } else {
      section?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <aside
      aria-label="Segmen halaman"
      className="hidden lg:sticky lg:top-4 lg:block"
    >
      <div className="rounded-md border border-border/70 bg-card/80 p-2 backdrop-blur-xl">
        <p className="px-2 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground/80">
          Segmen
        </p>
        <div className="flex flex-col gap-0.5">
          {segments.map((segment, index) => {
            const isActive = segment.id === active
            return (
              <button
                key={segment.id}
                type="button"
                onClick={() => scrollTo(segment.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group relative flex min-h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-[13px] font-bold transition-all duration-200 outline-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                    isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0",
                  )}
                />
                {segment.icon ? (
                  <segment.icon
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
                    aria-hidden
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center font-mono text-[10px]",
                      isActive ? "text-primary" : "text-muted-foreground/70",
                    )}
                  >
                    {index + 1}
                  </span>
                )}
                <span className="truncate">{segment.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

// ---------- Section (kartu per segmen) ----------

export interface DetailSectionProps {
  /** Anchor untuk navigasi segmen. */
  id: string
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  /** Aksi di pojok kanan header kartu (mis. tombol kecil). */
  actions?: ReactNode
  children: ReactNode
}

/** Kartu isi satu segmen; `id`-nya menjadi target scroll navigasi segmen. */
export function DetailSection({
  id,
  title,
  description,
  icon: Icon,
  actions,
  children,
}: DetailSectionProps) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon ? <Icon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-1 max-w-xl">{description}</CardDescription>
          ) : null}
        </div>
        {actions ? <CardAction>{actions}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ---------- Footer aksi (submit) ----------

interface DetailFooterProps {
  hint?: ReactNode
  submitting: boolean
  submitDisabled: boolean
  submitLabel: string
  onCancel?: () => void
  cancelLabel: string
}

function DetailFooter({
  hint,
  submitting,
  submitDisabled,
  submitLabel,
  onCancel,
  cancelLabel,
}: DetailFooterProps) {
  return (
    <footer className="sticky bottom-0 z-10 -mx-4 rounded-md border border-border/70 bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md md:-mx-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 text-xs text-muted-foreground">{hint}</div>
        <div className="flex shrink-0 items-center gap-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button type="submit" disabled={submitting || submitDisabled}>
            {submitting ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : null}
            {submitLabel}
          </Button>
        </div>
      </div>
    </footer>
  )
}