import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"
import { useRouteError } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ERROR_TITLE, toApiError } from "@/lib/api-error"
import { logger } from "@/lib/logger"

/**
 * Fallback error boundary untuk route React Router.
 * Error API dinormalisasi via toApiError: kegagalan koneksi → pesan jaringan,
 * error tak dikenal → pesan fallback generik.
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const apiError = toApiError(error)

  logger.error("route render failed", {
    error: apiError.message,
  })

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-sm bg-destructive/10">
        <TriangleAlertIcon className="size-6 text-destructive" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold">{ERROR_TITLE}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {apiError.message}. Coba muat ulang; jika berlanjut, periksa console untuk detail
        teknis.
      </p>
      <Button onClick={() => window.location.reload()} variant="outline">
        <RotateCcwIcon aria-hidden /> Muat ulang
      </Button>
    </div>
  )
}
