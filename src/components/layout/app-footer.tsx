import { appConfig } from "@/config/app-config"

/** Footer aplikasi - identitas & copyright saja, tanpa logika lain. */
export function AppFooter() {
  return (
    <footer className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-border/70 bg-card/95 px-4 py-3 text-center text-xs text-muted-foreground shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md md:px-6">
      (c) {new Date().getFullYear()} {appConfig.appName} - Starter kit internal
    </footer>
  )
}
