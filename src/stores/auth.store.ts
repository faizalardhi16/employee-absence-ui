import { create } from "zustand"

import type { AuthUser } from "@/types/auth"

/**
 * Snapshot client-side user yang sedang login.
 * Sumber kebenaran session = HttpOnly cookie + query `useMe`;
 * store ini hanya cache untuk UI instan (avatar, menu, role gating).
 * Sengaja TIDAK di-persist agar tidak pernah stale terhadap cookie.
 */
interface AuthStore {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
