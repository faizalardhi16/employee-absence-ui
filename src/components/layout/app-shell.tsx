import { ArrowUpIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useMatches } from "react-router-dom"

import { AppFooter } from "@/components/layout/app-footer"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth.store"
import { useUiStore } from "@/stores/ui.store"

const SIDEBAR_WIDTH_EXPANDED = "w-72"
const SIDEBAR_WIDTH_COLLAPSED = "w-20"

/** Marker route: halaman yang menolak footer shell (mis. halaman detail). */
export interface RouteHandle {
  hideFooter?: boolean
}

/**
 * Kerangka halaman setelah login: sidebar + topbar + konten + footer.
 * Desktop: sidebar statis yang bisa diciutkan. Mobile: sidebar jadi drawer (Sheet).
 * Footer shell otomatis disembunyikan bila route aktif menandai handle.hideFooter.
 */
export function AppShell() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const developerMode = useAuthStore((s) => s.user?.developerMode ?? false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)

  const matches = useMatches()
  const hideFooter = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.hideFooter === true,
  )

  useEffect(() => {
    const viewport = shellRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (!viewport) return

    const handleScroll = () => setShowScrollTop(viewport.scrollTop > 240)
    handleScroll()
    viewport.addEventListener("scroll", handleScroll, { passive: true })

    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    const viewport = shellRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    viewport?.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div ref={shellRef} className="relative flex h-dvh min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(8,145,178,0.1),transparent_24%),linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.8))] text-foreground dark:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.15),transparent_28%),radial-gradient(circle_at_top_right,rgba(8,145,178,0.12),transparent_24%),linear-gradient(180deg,rgba(15,23,42,1),rgba(15,23,42,0.88))]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_86%)] dark:opacity-10" />

      <aside
        className={cn(
          "relative z-10 hidden shrink-0 transition-[width] duration-200 md:block",
          collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        )}
      >
        <div className="glass-panel flex h-full overflow-hidden rounded-none border-y-0 border-l-0 p-1">
          <AppSidebar />
        </div>
      </aside>

      <div className="relative z-10 flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-72 border-border/70 bg-card/95 p-0 backdrop-blur-xl">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu navigasi</SheetTitle>
            </SheetHeader>
            <AppSidebar onNavigate={() => setMobileNavOpen(false)} className="p-3 pt-6" />
          </SheetContent>
        </Sheet>

        <AppTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="w-full">
              <div className="glass-panel min-h-full overflow-hidden rounded-none border-x-0 border-b-0 shadow-none">
                <div className="border-b border-border/60 bg-gradient-to-r from-primary/8 via-transparent to-accent/12 px-4 py-4 md:px-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                      Internal workspace
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ringkasan operasional dan akses aplikasi dalam satu area kerja.
                    </p>
                  </div>
                </div>
                <div className="px-4 py-5 md:px-6 md:py-6">
                  <PageTransition />
                </div>
              </div>
            </div>
          </ScrollArea>
        </main>

        {hideFooter ? null : <AppFooter />}
      </div>

      {showScrollTop ? (
        <Button
          type="button"
          variant="default"
          size="icon"
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
          onClick={scrollToTop}
          className={cn(
            "fixed right-5 z-30 size-10 rounded-full shadow-[0_12px_30px_rgba(37,99,235,0.3)] animate-in fade-in-0 slide-in-from-bottom-2 duration-200 md:right-8",
            // Naikkan posisi saat Developer Mode aktif supaya tidak menimpa
            // tombol Request/Response Log (fixed right-4 bottom-4).
            developerMode
              ? "bottom-24 md:bottom-24"
              : "bottom-20 md:bottom-8",
          )}
        >
          <ArrowUpIcon aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
