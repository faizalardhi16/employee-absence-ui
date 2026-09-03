import { CircleAlertIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FieldWrapperProps {
  /** id input yang direferensikan label (wajib untuk aksesibilitas). */
  id: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/**
 * Kerangka field form yang dipakai semua komponen form (DRY):
 * label + slot input + pesan bantuan/pesan error.
 */
export function FieldWrapper({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      {label ? (
        <Label htmlFor={id} className="text-[13px] leading-none font-bold">
          {label}
          {required ? <span aria-hidden="true" className="ml-0.5 text-destructive">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1 text-xs text-destructive"
        >
          <CircleAlertIcon className="size-3 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
