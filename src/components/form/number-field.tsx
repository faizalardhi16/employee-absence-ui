import { useState } from "react"
import type { ComponentProps, FocusEvent, ReactNode } from "react"

import { FieldWrapper } from "@/components/form/field-wrapper"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export interface NumberFieldProps
  extends Omit<ComponentProps<"input">, "type" | "value" | "onChange" | "defaultValue"> {
  /** Wajib eksplisit agar asosiasi label-input selalu valid. */
  id: string
  value?: number | null
  /** Terima `null` saat input kosong — menghindari NaN di form state. */
  onValueChange?: (value: number | null) => void
  /** Format tampilan ribuan (mis. 1.234) saat input tidak sedang difokuskan. */
  formatOnBlur?: boolean
  locale?: string
  label?: string
  hint?: string
  error?: string
  /** Ikon di sisi kiri input. */
  leftIcon?: ReactNode
}

const DEFAULT_LOCALE = "id-ID"
const DECIMAL_SEPARATOR = ","

function parseNumericInput(raw: string): number | null {
  const normalized = raw.replaceAll(DECIMAL_SEPARATOR, ".").trim()
  if (normalized === "") return null
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? null : parsed
}

interface BlurEvent extends FocusEvent<HTMLInputElement> {}

/** Teks sementara milik user, beserta nilai `value` yang sedang berlaku saat itu. */
interface Draft {
  boundValue: number | null
  text: string
}

/**
 * Input angka terkontrol dengan semantik angka (bukan string):
 * bebas mengetik sementara fokus, nilai di-commit ke onValueChange sebagai number|null.
 */
export function NumberField({
  id,
  value = null,
  onValueChange,
  formatOnBlur = true,
  locale = DEFAULT_LOCALE,
  label,
  hint,
  error,
  required,
  leftIcon,
  className,
  onBlur,
  ...props
}: NumberFieldProps) {
  const fieldId = id
  const [draft, setDraft] = useState<Draft | null>(null)

  // Draft hanya berlaku selama masih mengikat nilai yang sama;
  // jika value berubah dari luar (mis. reset form), draft otomatis usang.
  const isDraftActive = draft !== null && draft.boundValue === value

  const displayed = isDraftActive
    ? draft.text
    : value !== null && formatOnBlur
      ? new Intl.NumberFormat(locale).format(value)
      : (value?.toString() ?? "")

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
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          value={displayed}
          onChange={(event) => {
            setDraft({ boundValue: value, text: event.target.value })
            onValueChange?.(parseNumericInput(event.target.value))
          }}
          onBlur={(event) => {
            const committed = parseNumericInput(event.target.value)
            if (committed !== null) {
              onValueChange?.(committed)
              setDraft(null)
            }
            onBlur?.(event as BlurEvent)
          }}
          {...props}
        />
      </InputGroup>
    </FieldWrapper>
  )
}
