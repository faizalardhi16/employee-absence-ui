import { useLocation, useOutlet } from "react-router-dom"

import { cn } from "@/lib/utils"

interface PageTransitionProps {
  className?: string
}

export function PageTransition({ className }: PageTransitionProps) {
  const outlet = useOutlet()
  const location = useLocation()

  return (
    <div
      key={location.pathname + location.search}
      className={cn("page-transition motion-reduce:animate-none", className)}
    >
      {outlet}
    </div>
  )
}

