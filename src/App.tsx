import { RouterProvider } from "react-router-dom"

import { RequestResponseLog } from "@/components/dev/request-response-log"
import { router } from "@/routes"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Dev tools — hanya dirender bila user yang login punya Developer Mode
 * aktif (UAR_USERS.DEVELOPER_MODE = true, dibaca live dari /auth/me).
 */
function DeveloperTools() {
  const developerMode = useAuthStore((s) => s.user?.developerMode ?? false)
  return developerMode ? <RequestResponseLog /> : null
}

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      {/* Inspektor request/response — hanya untuk user dengan Developer Mode. */}
      <DeveloperTools />
    </>
  )
}

export default App