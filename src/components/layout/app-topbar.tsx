import { ChevronsLeft, ChevronsRight, Loader2Icon, LogOut, MenuIcon } from "lucide-react"
import { useState } from "react"

import { useLogout } from "@/features/auth/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/auth.store"
import { useUiStore } from "@/stores/ui.store"

interface AppTopbarProps {
  /** Hanya ada di layar kecil: buka drawer navigasi. */
  onOpenMobileNav?: () => void
}

const AVATAR_FALLBACK_LENGTH = 2

export function AppTopbar({ onOpenMobileNav }: AppTopbarProps) {
  const user = useAuthStore((s) => s.user)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const logoutMutation = useLogout({
    onSuccess: () => setLogoutOpen(false),
  })

  const initials = (user?.email ?? "?")
    .slice(0, AVATAR_FALLBACK_LENGTH)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-white/85 backdrop-blur-xl dark:bg-card/80">
      <div className="flex h-16 w-full items-center gap-3 px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Buka menu navigasi"
          onClick={onOpenMobileNav}
          className="md:hidden"
        >
          <MenuIcon className="size-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={sidebarCollapsed ? "Perlebar sidebar" : "Ciutkan sidebar"}
          onClick={toggleSidebar}
          className="hidden md:inline-flex"
        >
          {sidebarCollapsed ? <ChevronsRight className="size-5" /> : <ChevronsLeft className="size-5" />}
        </Button>

        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-foreground">Police Internal Dashboard</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Layout ringkas untuk pemantauan akses dan operasional.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground lg:flex">
            Live operations
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu pengguna"
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-1.5 py-1.5 shadow-sm outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{(user.roles ?? []).join(", ")}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Keluar dari workspace?</DialogTitle>
            <DialogDescription>
              Anda yakin ingin keluar? Sesi Anda akan berakhir dan perlu login kembali
              untuk mengakses data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutOpen(false)}
              disabled={logoutMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
              ) : (
                <LogOut aria-hidden />
              )}
              Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
