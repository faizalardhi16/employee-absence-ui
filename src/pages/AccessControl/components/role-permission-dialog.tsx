import { Loader2Icon } from "lucide-react"
import { useMemo } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useAssignPermission,
  usePermissionCatalog,
  useUnassignPermission,
} from "@/features/access-control/use-access-control"
import { toApiError } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import type { Permission, Role } from "@/types/access-control"

const TOAST_ASSIGN_FAILED = "Gagal mengubah permission role."

/** Dialog atur permission untuk satu role: klik untuk beri/lepas. */
export function RolePermissionDialog({
  role,
  onClose,
}: {
  role: Role
  onClose: () => void
}) {
  const permissionsQuery = usePermissionCatalog()
  const assignPermission = useAssignPermission()
  const unassignPermission = useUnassignPermission()

  const ownedCodes = useMemo(() => new Set(role.permissions), [role])
  const pendingIds = useMemo(() => {
    const set = new Set<number>()
    for (const variable of [assignPermission.variables, unassignPermission.variables]) {
      if (variable && variable.roleId === role.ID) set.add(variable.permissionId)
    }
    return set
  }, [assignPermission.variables, unassignPermission.variables, role.ID])

  const handleToggle = (permission: Permission) => {
    const isOwned = ownedCodes.has(permission.CODE)
    const mutation = isOwned ? unassignPermission : assignPermission
    mutation.mutate(
      { roleId: role.ID, permissionId: permission.ID },
      { onError: () => toast.error(TOAST_ASSIGN_FAILED) }
    )
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Permission untuk {role.NAME}</DialogTitle>
          <DialogDescription>
            Klik untuk memberi (aktif) atau melepas (nonaktif) permission dari role {role.CODE}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-80 gap-1.5 overflow-y-auto pr-1">
          {permissionsQuery.isPending ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          ) : permissionsQuery.isError ? (
            <p className="text-xs text-destructive">
              {toApiError(permissionsQuery.error).message}
            </p>
          ) : permissionsQuery.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada permission. Tambahkan lewat panel Permission Master.
            </p>
          ) : (
            permissionsQuery.data.map((permission) => {
              const owned = ownedCodes.has(permission.CODE)
              const pending = pendingIds.has(permission.ID)
              return (
                <button
                  key={permission.ID}
                  type="button"
                  aria-pressed={owned}
                  disabled={pending}
                  onClick={() => handleToggle(permission)}
                  className={cn(
                    "flex items-center gap-3 rounded-sm border px-3 py-2 text-left font-bold transition-colors duration-150",
                    "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    owned
                      ? "border-primary/30 bg-primary/8 hover:bg-primary/12"
                      : "border-border/70 bg-muted/20 hover:bg-muted/50",
                    pending && "cursor-wait opacity-60"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
                      owned ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    )}
                  >
                    {owned ? (
                      <svg viewBox="0 0 12 12" className="size-2.5 fill-none stroke-current stroke-2">
                        <path d="M2.5 6.5 5 9l4.5-6" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs text-foreground">
                      {permission.CODE}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {permission.NAME}
                    </span>
                  </span>
                  {pending ? (
                    <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
                  ) : null}
                </button>
              )
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}