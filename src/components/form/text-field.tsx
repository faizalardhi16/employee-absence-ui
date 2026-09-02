import type { ReactNode } from "react"
import type { ComponentProps } from "react"

import { FieldWrapper } from "@/components/form/field-wrapper"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type NativeInputProps = Omit<ComponentProps<"input">, "type">

export interface TextFieldProps extends NativeInputProps {
  /** Hanya tipe teks; untuk angka pakai NumberField. */
  type?: "text" | "email" | "password" | "search" | "tel" | "url"
  /** Wajib eksplisit agar asosiasi label-input selalu valid. */
  id: string
  label?: string
  hint?: string
  error?: string
  /** Ikon di sisi kiri input (mis. MailIcon). */
  leftIcon?: ReactNode
  /**
   * Slot interaktif di sisi kanan (mis. tombol show/hide password).
   * Gunakan `InputGroupButton` dari ui/input-group agar konsisten.
   */
  trailing?: ReactNode
}

/** Input teks satu baris + label/error/hint terintegrasi + slot ikon. */
export function TextField({
  id,
  type = "text",
  label,
  hint,
  error,
  required,
  leftIcon,
  trailing,
  className,
  ...props
}: TextFieldProps) {
  const fieldId = id

  return (
    <FieldWrapper id={fieldId} label={label} hint={hint} error={error} required={required}>
      <InputGroup
        className={cn(
          "h-9 rounded-sm shadow-xs transition-[color,box-shadow,border-color] duration-200",
          "hover:border-foreground/25",
          error && "border-destructive/60 bg-destructive/[0.04]",
          className,
        )}
      >
        {leftIcon ? (
          <InputGroupAddon align="inline-start" className="pl-2.5 text-muted-foreground/70">
            {leftIcon}
          </InputGroupAddon>
        ) : null}

        <InputGroupInput
          id={fieldId}
          name={props.name ?? fieldId}
          type={type}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />

        {trailing ? (
          <InputGroupAddon align="inline-end" className="pr-1">
            {trailing}
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </FieldWrapper>
  )
}
