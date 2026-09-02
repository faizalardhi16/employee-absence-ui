/** Kontrak domain auth — mirror dari AuthUserDto backend NestJS. */
export interface AuthUser {
  userId: number
  email: string
  roles: string[]
  /** Developer Mode aktif (dari kolom UAR_USERS.DEVELOPER_MODE). */
  developerMode: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
}
