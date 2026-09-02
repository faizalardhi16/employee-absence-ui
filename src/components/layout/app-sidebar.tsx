import { useEffect, useState } from "react"
import { ChevronDownIcon, LockIcon } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { BrandLogo } from "@/components/layout/brand-logo"
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/components/layout/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuthStore } from "@/stores/auth.store"
import { useUiStore } from "@/stores/ui.store"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  /** Dipakai di dalam Sheet mobile: tutup sheet setiap item diklik. */
  onNavigate?: () => void
  className?: string
}

const GROUP_ACTIVE =
  "bg-gradient-to-r from-primary/15 via-primary/8 to-transparent text-primary shadow-[inset_0_0_0_1px_rgba(37,99,235,0.12)]"
const GROUP_IDLE =
  "text-muted-foreground hover:bg-muted/70 hover:text-foreground"

/** Navigasi sidebar: indikator aktif beranimasi, expand group halus, profil user. */
export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setOpenGroups((current) => {
      const next = { ...current }
      for (const item of NAV_ITEMS) {
        if (!item.children) continue
        const hasActiveChild = item.children.some(
          (child) => !child.disabled && child.to === location.pathname
        )
        if (hasActiveChild) next[item.label] = true
      }
      return next
    })
  }, [location.pathname])

  const toggleGroup = (label: string) =>
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }))

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase()

  return (
    <div className={cn("flex h-full flex-col gap-2 p-3", collapsed && "items-center px-2", className)}>
      {/* Brand */}
      <NavLink
        to="/"
        onClick={onNavigate}
        className={cn(
          "mb-3 flex min-h-12 w-full items-center rounded-sm",
          collapsed ? "justify-center px-0" : "px-2",
        )}
      >
        <BrandLogo collapsed={collapsed} />
      </NavLink>

      <nav aria-label="Navigasi utama" className="flex w-full flex-1 flex-col gap-4 overflow-y-auto">
        {/* Menu utama */}
        <div className="flex flex-col gap-1">
          {!collapsed ? (
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground/80">
              Menu utama
            </p>
          ) : null}
          {NAV_ITEMS.map((item) => (
            <NavGroup
              key={item.label}
              item={item}
              collapsed={collapsed}
              isOpen={openGroups[item.label] ?? false}
              isActive={
                item.children?.some(
                  (child) => !child.disabled && child.to === location.pathname
                ) ?? false
              }
              onToggle={() => toggleGroup(item.label)}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Menu sekunder */}
        <div className="flex flex-col gap-1">
          {!collapsed ? (
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground/80">
              Sistem
            </p>
          ) : (
            <span className="mx-auto h-px w-8 bg-border/70" />
          )}
          {SECONDARY_NAV_ITEMS.map((item) => (
            <DisabledItem key={item.label} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className="flex-1" />

        {/* Status sistem */}
        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-sm border border-border/70 bg-background/50 px-3 py-2.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-chart-2" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">Semua sistem normal</p>
              <p className="truncate text-[11px] text-muted-foreground">Layanan API & database aktif</p>
            </div>
          </div>
        ) : (
          <span
            className="relative mx-auto flex size-2 overflow-hidden"
            title="Semua sistem normal"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-chart-2" />
          </span>
        )}
      </nav>

      {/* Profil user */}
      <div className={cn("mt-2 flex w-full items-center gap-2.5", collapsed && "justify-center")}>
        <div
          title={collapsed ? user?.email : undefined}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-sm border border-border/70 bg-card/80 px-2.5 py-2 text-left transition-colors duration-200",
            "hover:border-ring/40 hover:bg-card",
            collapsed && "w-auto justify-center px-1.5"
          )}
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-gradient-to-br from-primary/15 to-accent/20 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user?.email ?? "Pengguna"}</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-chart-2" aria-hidden />
                Online
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Item navigasi tunggal dengan indikator aktif beranimasi (accent bar kiri). */
function NavItemLink({
  to,
  label,
  icon: Icon,
  collapsed,
  onNavigate,
  end = false,
}: {
  to: string
  label: string
  icon: (typeof NAV_ITEMS)[number]["icon"]
  collapsed: boolean
  onNavigate?: () => void
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex min-h-11 w-full items-center overflow-hidden rounded-sm text-sm font-medium transition-all duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          collapsed ? "justify-center px-0" : "gap-2.5 px-3",
          isActive
            ? "bg-gradient-to-r from-primary/15 via-primary/6 to-transparent text-primary shadow-[inset_0_0_0_1px_rgba(37,99,235,0.12)]"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={cn(
              "absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
              isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
            )}
          />
          <Icon
            className={cn(
              "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
              isActive && "scale-110"
            )}
            aria-hidden
          />
          {!collapsed ? <span className="truncate">{label}</span> : null}
        </>
      )}
    </NavLink>
  )
}

/** Group submenu: tombol expand + konten yang dianimasikan (grid-rows trick). */
function NavGroup({
  item,
  collapsed,
  isOpen,
  isActive,
  onToggle,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number]
  collapsed: boolean
  isOpen: boolean
  isActive: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  if (!item.children) {
    return (
      <NavItemLink
        to={item.to!}
        label={item.label}
        icon={item.icon}
        collapsed={collapsed}
        onNavigate={onNavigate}
        end={item.to === "/"}
      />
    )
  }

  // Mode collapsed: popover flyout di samping.
  if (collapsed) {
    return (
      <Popover open={isOpen} onOpenChange={onToggle}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title={item.label}
            className={cn(
              "flex min-h-11 w-full items-center justify-center rounded-sm text-sm font-medium transition-all duration-200 ease-out",
              isActive ? GROUP_ACTIVE : GROUP_IDLE
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">{item.label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" sideOffset={8} className="w-60 p-2">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{item.label}</p>
          <div className="mt-1 flex flex-col gap-1">
            {item.children.map((child) =>
              child.disabled ? (
                <span
                  key={child.to}
                  className="flex cursor-not-allowed items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-muted-foreground/60"
                >
                  <LockIcon className="size-3.5" aria-hidden />
                  {child.label}
                  {child.badge ? (
                    <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{child.badge}</span>
                  ) : null}
                </span>
              ) : (
                <NavLink
                  key={child.to}
                  to={child.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "rounded-sm px-2.5 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/12 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  {child.label}
                </NavLink>
              )
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "group flex min-h-11 w-full items-center gap-2.5 rounded-sm px-3 text-sm font-medium transition-all duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isActive ? GROUP_ACTIVE : GROUP_IDLE
        )}
      >
        <item.icon
          className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
          aria-hidden
        />
        <span className="truncate">{item.label}</span>
        <ChevronDownIcon
          className={cn(
            "ml-auto size-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {/* Konten submenu dengan animasi tinggi (grid-rows 0fr → 1fr). */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-3 flex flex-col gap-1 border-l border-border/70 pl-3 py-1">
            {item.children.map((child) =>
              child.disabled ? (
                <span
                  key={child.to}
                  className="flex cursor-not-allowed items-center gap-2 rounded-sm px-3 py-2.5 text-sm text-muted-foreground/60"
                >
                  <LockIcon className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{child.label}</span>
                  {child.badge ? (
                    <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      {child.badge}
                    </span>
                  ) : null}
                </span>
              ) : (
                <NavLink
                  key={child.to}
                  to={child.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-2 rounded-sm px-3 py-2.5 text-sm transition-colors duration-200",
                      isActive
                        ? "bg-primary/12 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                          isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                        )}
                      />
                      <span className="truncate">{child.label}</span>
                    </>
                  )}
                </NavLink>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Item disabled dengan ikon gembok + badge. */
function DisabledItem({
  item,
  collapsed,
}: {
  item: (typeof SECONDARY_NAV_ITEMS)[number]
  collapsed: boolean
}) {
  return (
    <div
      title={collapsed ? `${item.label} (${item.badge})` : undefined}
      className={cn(
        "flex min-h-11 w-full cursor-not-allowed items-center gap-2.5 rounded-sm text-sm font-medium text-muted-foreground/55",
        collapsed ? "justify-center px-0" : "px-3"
      )}
    >
      <item.icon className="size-4 shrink-0 opacity-70" aria-hidden />
      {!collapsed ? (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge ? (
            <span className="ml-auto shrink-0 rounded-full border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium">
              {item.badge}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  )
}