import { createBrowserRouter } from "react-router-dom"

import { AppShell } from "@/components/layout/app-shell"
import type { RouteHandle } from "@/components/layout/app-shell"
import { RequireAuth } from "@/features/auth/require-auth"
import { AccessControlPage } from "@/pages/AccessControl"
import { ComponentsPage } from "@/pages/Components"
import { DashboardPage } from "@/pages/Dashboard"
import { DetailDemoPage } from "@/pages/DetailDemo"
import { LoginPage } from "@/pages/Login"
import { NotFoundPage } from "@/pages/NotFound"
import { ProfilePage } from "@/pages/Profile"
import { RegisterPage } from "@/pages/Register"
import { RouteErrorPage } from "@/pages/RouteError"

export const LOGIN_PATH = "/login"

/** Marker halaman detail: footer shell disembunyikan (AppShell membaca ini). */
const DETAIL_PAGE_HANDLE: RouteHandle = { hideFooter: true }

/**
 * Peta routing aplikasi.
 * - /login & /register: publik
 * - RequireAuth membungkus AppShell → semua halaman dalam shell terproteksi
 * - halaman detail memakai handle { hideFooter: true } → footer shell dihilangkan
 * - errorElement di tiap level: crash UI terisolasi per route, bukan blank screen
 */
export const router = createBrowserRouter([
  {
    path: LOGIN_PATH,
    element: <LoginPage />,
    ErrorBoundary: RouteErrorPage,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    ErrorBoundary: RouteErrorPage,
  },
  {
    element: <RequireAuth />,
    ErrorBoundary: RouteErrorPage,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/components", element: <ComponentsPage /> },
          { path: "/akses", element: <AccessControlPage /> },
          { path: "/profil", element: <ProfilePage /> },
          {
            path: "/detail/demo",
            element: <DetailDemoPage />,
            handle: DETAIL_PAGE_HANDLE,
          },
        ],
        ErrorBoundary: RouteErrorPage,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
    ErrorBoundary: RouteErrorPage,
  },
])
