/** Kontrak domain RBAC — mirror dari RbacController backend NestJS. */
export interface Permission {
  ID: number
  CODE: string
  NAME: string
  DESCRIPTION: string | null
}

export interface Role {
  ID: number
  CODE: string
  NAME: string
  DESCRIPTION: string | null
  permissions: string[]
}

export interface CreatePermissionInput {
  code: string
  name: string
  description?: string
}