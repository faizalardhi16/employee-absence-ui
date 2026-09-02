import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { authApi } from "@/features/auth/auth.api"
import { useAuthStore } from "@/stores/auth.store"
import type { AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth"

/** Kunci cache React Query untuk domain auth — terpusat agar konsisten. */
export const authQueryKeys = {
  me: ["auth", "me"] as const,
  permissions: ["auth", "permissions"] as const,
}

const TOAST_LOGOUT_FAILED = "Gagal keluar. Coba lagi."

interface LoginHookOptions {
  onSuccess?: (user: AuthUser) => void
}

/**
 * Hook login: panggil API → isi snapshot store + cache `me` → UI langsung tahu user.
 * onError sengaja TIDAK menampilkan toast di sini; form login yang memutuskan
 * cara menampilkan error (validasi inline).
 */
export function useLogin(options?: LoginHookOptions) {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(authQueryKeys.me, user)
      options?.onSuccess?.(user)
    },
  })
}

interface LogoutHookOptions {
  /** Dipanggil setelah cookie dihapus server & store dibersihkan. */
  onSuccess?: () => void
}

/**
 * Hook logout: hapus cookie (server), bersihkan store + seluruh cache query,
 * lalu redirect ke halaman login (yang memainkan animasi masuk).
 */
export function useLogout(options?: LogoutHookOptions) {
  const clearUser = useAuthStore((s) => s.clearUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser()
      queryClient.removeQueries()
      void navigate("/login", { replace: true })
      options?.onSuccess?.()
    },
    onError: () => {
      toast.error(TOAST_LOGOUT_FAILED)
    },
  })
}

/**
 * Validasi session via GET /auth/me.
 * Dipakai route guard sebagai sumber kebenaran status login.
 */
export function useMe() {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: () => authApi.me(),
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: authQueryKeys.permissions,
    queryFn: () => authApi.permissions(),
    staleTime: Infinity,
  })
}

/**
 * Hook register: buat akun → arahkan ke halaman login dengan toast sukses.
 * Login tetap manual agar pengguna sadar kredensialnya.
 */
export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: () => {
      toast.success("Akun berhasil dibuat. Silakan masuk.")
      void navigate("/login", { replace: true })
    },
  })
}
