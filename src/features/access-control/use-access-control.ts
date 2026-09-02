import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { accessControlApi } from "@/features/access-control/access.api"
import type { CreatePermissionInput } from "@/types/access-control"

/** Kunci cache React Query untuk domain access control — terpusat agar konsisten. */
export const accessQueryKeys = {
  roles: ["access", "roles"] as const,
  permissions: ["access", "permissions"] as const,
}

/** Daftar role beserta permission yang dimiliki. */
export function useRoles() {
  return useQuery({
    queryKey: accessQueryKeys.roles,
    queryFn: () => accessControlApi.listRoles(),
  })
}

/** Katalog semua permission master (untuk tabel + dialog assignment). */
export function usePermissionCatalog() {
  return useQuery({
    queryKey: accessQueryKeys.permissions,
    queryFn: () => accessControlApi.listPermissions(),
  })
}

/** Tambah permission baru → invalidasi katalog + role. */
export function useCreatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePermissionInput) => accessControlApi.createPermission(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accessQueryKeys.permissions })
      void queryClient.invalidateQueries({ queryKey: accessQueryKeys.roles })
    },
  })
}

/** Berikan permission ke role → invalidasi daftar role. */
export function useAssignPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      accessControlApi.assignPermission(roleId, permissionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accessQueryKeys.roles })
    },
  })
}

/** Lepas permission dari role → invalidasi daftar role. */
export function useUnassignPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      accessControlApi.unassignPermission(roleId, permissionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accessQueryKeys.roles })
    },
  })
}