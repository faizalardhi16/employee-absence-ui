import { api } from "@/lib/api"
import type { AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth"

/**
 * Pemetaan endpoint auth backend → fungsi typed.
 * SRP: hanya HTTP; tanpa logika state. DIP: hooks bergantung pada modul ini
 * sebagai satu-satunya tempat URL endpoint didefinisikan.
 */
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data } = await api.post<AuthUser>("/auth/login", credentials)
    return data
  },

  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    const { data } = await api.post<AuthUser>("/auth/register", credentials)
    return data
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout")
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>("/auth/me")
    return data
  },

  async permissions(): Promise<string[]> {
    const { data } = await api.get<string[]>("/auth/permissions")
    return data
  },
}
