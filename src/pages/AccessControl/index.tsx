import { PlusIcon, ShieldCheckIcon, ShieldXIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"

import { DataTable } from "@/components/data/data-table"
import type { DataColumn } from "@/components/data/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  usePermissionCatalog,
  useRoles,
} from "@/features/access-control/use-access-control"
import { toApiError } from "@/lib/api-error"
import { CreatePermissionForm } from "./components/create-permission-form"
import { RolePermissionDialog } from "./components/role-permission-dialog"
import type { Permission, Role } from "@/types/access-control"

const PERMISSION_COLUMNS: DataColumn<Permission>[] = [
  {
    id: "code",
    header: "Kode",
    className: "font-mono text-[11px] text-muted-foreground",
    sortValue: (permission) => permission.CODE,
    cell: (permission) => permission.CODE,
  },
  {
    id: "name",
    header: "Nama",
    sortValue: (permission) => permission.NAME,
    cell: (permission) => <span className="font-medium">{permission.NAME}</span>,
  },
  {
    id: "description",
    header: "Deskripsi",
    className: "max-w-56",
    sortValue: (permission) => permission.DESCRIPTION ?? "",
    cell: (permission) => (
      <span className="line-clamp-1 text-xs text-muted-foreground">
        {permission.DESCRIPTION ?? "-"}
      </span>
    ),
  },
]

/** Panel administrasi RBAC: kelola permission master & assignment ke role. */
export function AccessControlPage() {
  const rolesQuery = useRoles()
  const permissionsQuery = usePermissionCatalog()

  const [createOpen, setCreateOpen] = useState(false)
  const [assignRole, setAssignRole] = useState<Role | null>(null)

  const permissionCount = permissionsQuery.data?.length ?? 0
  const totalAssignments =
    rolesQuery.data?.reduce((sum, role) => sum + role.permissions.length, 0) ?? 0

  return (
    <div className="flex flex-col gap-5">
      <section className="glass-panel rounded-md p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Administrasi
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Akses &amp; Izin
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola permission master dan berikan akses ke role. Perubahan langsung
              berlaku pada sesi berikutnya.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {permissionsQuery.isPending ? "…" : permissionCount} permission
            </Badge>
            <Badge variant="outline">
              {rolesQuery.isPending ? "…" : totalAssignments} assignment
            </Badge>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Role & permission yang dimiliki */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheckIcon className="size-4 text-primary" aria-hidden />
              Role &amp; Hak Akses
            </CardTitle>
            <CardDescription>Klik “Atur” untuk memberi/melepas permission pada role.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {rolesQuery.isPending ? (
              <RoleListSkeleton />
            ) : rolesQuery.isError ? (
              <QueryError message={toApiError(rolesQuery.error).message} />
            ) : rolesQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada role.</p>
            ) : (
              rolesQuery.data.map((role) => (
                <div
                  key={role.ID}
                  className="flex flex-col gap-2.5 rounded-sm border border-border/70 bg-muted/30 p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-medium">{role.NAME}</p>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {role.CODE}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssignRole(role)}
                      aria-label={`Atur permission untuk ${role.NAME}`}
                    >
                      <SlidersHorizontalIcon className="size-3.5" aria-hidden />
                      Atur
                    </Button>
                  </div>
                  {role.DESCRIPTION ? (
                    <p className="text-xs text-muted-foreground">{role.DESCRIPTION}</p>
                  ) : null}
                  <div className="flex flex-wrap content-start gap-1.5">
                    {role.permissions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Belum ada permission untuk role ini.
                      </p>
                    ) : (
                      role.permissions.map((code) => (
                        <Badge key={code} variant="outline" className="font-mono text-[11px]">
                          {code}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Permission master */}
        <Card className="self-start">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldXIcon className="size-4 text-primary" aria-hidden />
                Permission Master
              </CardTitle>
              <CardDescription>Katalog permission yang tersedia.</CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusIcon className="size-3.5" aria-hidden />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Permission</DialogTitle>
                  <DialogDescription>
                    Kode unik dipakai guard RBAC; gunakan format resource:action.
                  </DialogDescription>
                </DialogHeader>
                <CreatePermissionForm onDone={() => setCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={PERMISSION_COLUMNS}
              rows={permissionsQuery.data ?? []}
              getRowId={(permission) => String(permission.ID)}
              isLoading={permissionsQuery.isPending}
              emptyMessage="Belum ada permission."
              enableSearch
              searchPlaceholder="Cari permission..."
              searchValue={(permission) => `${permission.CODE} ${permission.NAME}`}
              enableSort
              enablePagination
              pageSize={8}
            />
          </CardContent>
        </Card>
      </div>

      {assignRole ? (
        <RolePermissionDialog role={assignRole} onClose={() => setAssignRole(null)} />
      ) : null}
    </div>
  )
}

function RoleListSkeleton() {
  return (
    <>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </>
  )
}

function QueryError({ message }: { message: string }) {
  return <p className="text-sm text-destructive">{message}</p>
}