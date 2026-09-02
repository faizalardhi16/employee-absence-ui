import { CircleCheckIcon, InfoIcon, OctagonXIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"
import type { ToasterProps } from "sonner"
import { Toaster as Sonner } from "sonner"

/**
 * Toaster global aplikasi. Theme di-pin ke "system" karena starter kit ini
 * belum punya theme provider; ganti prop `theme` saat dark mode ditambahkan.
 */
const AppToaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { AppToaster as Toaster }
