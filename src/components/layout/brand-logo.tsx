import { ShieldCheck } from "lucide-react"

import { appConfig } from "@/config/app-config"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  collapsed?: boolean
  className?: string
}

/** Logo + nama aplikasi; dipakai bersama oleh sidebar dan halaman login. */
export function BrandLogo({ collapsed = false, className }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-[linear-gradient(135deg,rgba(37,99,235,1),rgba(8,145,178,1))] text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)]">
        <ShieldCheck className="size-5" />
      </div>
      {!collapsed ? (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight">{appConfig.appName}</p>
          <p className="truncate text-xs text-muted-foreground">Modern civic operations interface</p>
        </div>
      ) : null}
    </div>
  )
}
