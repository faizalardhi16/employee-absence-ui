import { api } from "@/lib/api"
import type {
  CreatePermissionInput,
  Permission,
  Role,
} from "@/types/access-control"

/**
 * Pemetaan endpoint RBAC backend → fungsi typed.
 * SRP: hanya HTTP; tanpa logika state.
 */
export const accessControlApi = {
  async listRoles(): Promise<Role[]> {
    const { data } = await api.get<Role[]>("/roles")
    return data
  },

  async listPermissions(): Promise<Permission[]> {
    const { data } = await api.get<Permission[]>("/permissions")
    return data
  },

  async createPermission(input: CreatePermissionInput): Promise<Permission> {
    const { data } = await api.post<Permission>("/permissions", input)
    return data
  },

  async assignPermission(roleId: number, permissionId: number): Promise<void> {
    await api.post(`/roles/${roleId}/permissions`, { permissionId })
  },

  async unassignPermission(roleId: number, permissionId: number): Promise<void> {
    await api.delete(`/roles/${roleId}/permissions/${permissionId}`)
  },
}