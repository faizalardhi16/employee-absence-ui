import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const EXIT_ANIMATION_MS = 150

const alertVariants = cva(
  "group/alert relative w-full rounded-sm border p-4 text-sm motion-reduce:animate-none",
  {
    variants: {
      variant: {
        default: "border-border/70 bg-card/80 text-foreground backdrop-blur-xl",
        info: "border-ring/25 bg-ring/10 text-foreground",
        success: "border-chart-2/30 bg-chart-2/10 text-foreground",
        warning: "border-chart-3/40 bg-chart-3/10 text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const ALERT_ICONS: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, LucideIcon | null> = {
  default: null,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  destructive: CircleAlertIcon,
}

export interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  /** Render tombol tutup; dipanggil setelah animasi keluar selesai. */
  onDismiss?: () => void
}

function Alert({
  className,
  variant = "default",
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const Icon = ALERT_ICONS[variant ?? "default"]
  const [closing, setClosing] = React.useState(false)

  const dismiss = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => onDismiss?.(), EXIT_ANIMATION_MS)
  }

  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role={variant === "destructive" ? "alert" : undefined}
      className={cn(
        alertVariants({ variant }),
        "flex items-start gap-3",
        closing
          ? "animate-out fade-out-0 slide-out-to-top-1 duration-150 ease-in"
          : "animate-in fade-in-0 slide-in-from-top-1 duration-200",
        className
      )}
      {...props}
    >
      {Icon ? (
        <Icon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground/80 group-data-[variant=destructive]/alert:text-destructive"
          aria-hidden
        />
      ) : null}
      <div className="grid min-w-0 flex-1 gap-1">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup notifikasi"
          className="-m-1 rounded p-1 text-muted-foreground/70 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 group-data-[variant=destructive]/alert:hover:bg-destructive/10 group-data-[variant=destructive]/alert:hover:text-destructive"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-heading text-sm leading-snug font-medium", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm leading-relaxed text-muted-foreground group-data-[variant=destructive]/alert:text-destructive/90",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }