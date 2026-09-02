import { api } from "@/lib/api"
import type { UpdateProfileInput, UserProfile } from "@/types/profile"

/**
 * Pemetaan endpoint profil backend → fungsi typed.
 * SRP: hanya HTTP; tanpa logika state.
 */
export const profileApi = {
  async get(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>("/auth/profile")
    return data
  },

  async update(input: UpdateProfileInput): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>("/auth/profile", input)
    return data
  },
}