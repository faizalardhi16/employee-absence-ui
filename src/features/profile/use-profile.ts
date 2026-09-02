import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { profileApi } from "@/features/profile/profile.api"
import { useAuthStore } from "@/stores/auth.store"
import type { UpdateProfileInput } from "@/types/profile"

/** Kunci cache React Query untuk domain profil — terpusat agar konsisten. */
export const profileQueryKeys = {
  profile: ["profile"] as const,
}

/** Profil user yang login. */
export function useProfile() {
  return useQuery({
    queryKey: profileQueryKeys.profile,
    queryFn: () => profileApi.get(),
  })
}

/**
 * Update profil → invalidasi cache + sinkronkan developerMode ke auth store
 * agar tool dev (Request/Response Log) muncul/hilang seketika.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKeys.profile, profile)
      const current = useAuthStore.getState().user
      if (current && current.developerMode !== profile.developerMode) {
        setUser({ ...current, developerMode: profile.developerMode })
      }
    },
  })
}