import { ArrowLeftIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-7xl font-bold tracking-tighter text-primary">404</p>
      <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Halaman yang Anda tuju tidak ada atau sudah dipindahkan.
      </p>
      <Button asChild variant="outline">
        <Link to="/">
          <ArrowLeftIcon aria-hidden /> Kembali ke Dashboard
        </Link>
      </Button>
    </div>
  )
}
