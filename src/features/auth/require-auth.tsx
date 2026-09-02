import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { PageLoader } from "@/components/ui/loading"
import { useMe } from "@/features/auth/use-auth"
import { useAuthStore } from "@/stores/auth.store"

const LOGIN_PATH = "/login"

/**
 * Route guard: verifikasi session via GET /auth/me sebelum me-render shell.
 * Loading → PageLoader; 401/error → redirect login sambil menyimpan tujuan awal.
 * Hasil /me juga disinkronkan ke auth store agar UI (topbar) selalu segar.
 */
export function RequireAuth() {
  const location = useLocation()
  const meQuery = useMe()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data)
  }, [meQuery.data, setUser])

  if (meQuery.isPending) {
    return (
      <PageLoader
        label="Memeriksa sesi…"
        description="Verifikasi autentikasi ke server internal."
      />
    )
  }

  if (meQuery.isError) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
