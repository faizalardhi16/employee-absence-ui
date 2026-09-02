import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { Toaster } from "@/components/ui/sonner"
import { ensureCsrfToken } from "@/lib/csrf"
import App from "./App.tsx"
import "./index.css"

// Prime token CSRF sejak awal (fire-and-forget) agar cookie + cache siap
// sebelum request pertama yang mengubah state. Interceptor tetap self-healing
// (fetch ulang) bila ini gagal, mis. backend belum jalan saat load.
void ensureCsrfToken().catch(() => undefined)

const RETRY_COUNT = 1
const STALE_TIME_MS = 30_000

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: RETRY_COUNT,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME_MS,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-center" />
    </QueryClientProvider>
  </StrictMode>,
)

