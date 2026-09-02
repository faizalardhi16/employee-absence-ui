import { Check, ChevronsUpDown, SearchX, X } from "lucide-react"
import { useState } from "react"
import type { MouseEvent, ReactNode } from "react"

import { FieldWrapper } from "@/components/form/field-wrapper"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface SearchableSelectOption {
  value: string
  label: string
  /** Kata kunci tambahan untuk pencarian (tidak ditampilkan). */
  keywords?: string[]
  disabled?: boolean
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string | null
  onValueChange: (value: string | null) => void
  id: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearable?: boolean
  disabled?: boolean
  /** Ikon di sisi kiri trigger (mis. ikon kategori). */
  leftIcon?: ReactNode
  className?: string
}

const DEFAULT_PLACEHOLDER = "Pilih..."
const DEFAULT_SEARCH_PLACEHOLDER = "Cari..."
const DEFAULT_EMPTY_MESSAGE = "Tidak ada hasil."

/** Petunjuk pintasan keyboard di dasar popover. */
function ShortcutHints() {
  return (
    <div className="flex items-center gap-2.5 border-t border-border/70 bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd> navigasi
      </span>
      <Separator orientation="vertical" className="!h-3" />
      <span className="flex items-center gap-1">
        <Kbd>↵</Kbd> pilih
      </span>
      <span className="ml-auto flex items-center gap-1">
        <Kbd>esc</Kbd> tutup
      </span>
    </div>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="pointer-events-none inline-flex h-4 min-w-4 select-none items-center justify-center rounded border bg-background px-1 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  )
}

/**
 * Select dengan pencarian (combobox): Popover + Command (cmdk).
 * Keyboard nav & filter teks disediakan cmdk; komponen ini mengurus
 * kontrak value/label dan tampilan trigger.
 */
export function SearchableSelect({
  options,
  value,
  onValueChange,
  id,
  label,
  hint,
  error,
  required,
  placeholder = DEFAULT_PLACEHOLDER,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  clearable = true,
  disabled = false,
  leftIcon,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onValueChange(null)
  }

  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative group/select">
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-invalid={Boolean(error) || undefined}
              disabled={disabled}
              className={cn(
                "group h-9 w-full justify-between gap-2 px-3 font-normal shadow-xs",
                "transition-[color,box-shadow,border-color] duration-200 hover:border-foreground/25",
                "data-[state=open]:border-ring data-[state=open]:ring-4 data-[state=open]:ring-ring/15",
                !selected && !leftIcon && "text-muted-foreground",
                error && "border-destructive/60",
                className,
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {leftIcon ? (
                  <span className="shrink-0 text-muted-foreground/70">{leftIcon}</span>
                ) : null}
                <span className="truncate">{selected?.label ?? placeholder}</span>
              </span>
              <ChevronsUpDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                  "group-data-[state=open]:rotate-180 group-data-[state=open]:text-foreground",
                )}
              />
            </Button>
          </PopoverTrigger>

          {clearable && selected && !disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Bersihkan pilihan"
              onClick={handleClear}
              tabIndex={-1}
              className="absolute inset-y-0 right-7 my-auto size-5 rounded-sm p-0 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            >
              <X className="size-3" />
            </Button>
          ) : null}
        </div>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-(--radix-popover-trigger-width) overflow-hidden rounded-sm p-0 shadow-lg shadow-black/5"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList className="max-h-64 py-1 scroll-py-1">
              <CommandEmpty className="flex flex-col items-center gap-1.5 py-8 text-center text-sm text-muted-foreground">
                <SearchX className="size-5 opacity-50" aria-hidden />
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup className="px-1">
                {options.map((option) => {
                  const isSelected = option.value === value
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${(option.keywords ?? []).join(" ")}`}
                      disabled={option.disabled}
                      onSelect={() => {
                        onValueChange(isSelected ? null : option.value)
                        setOpen(false)
                      }}
                      keywords={option.keywords}
                      className={cn(
                        "rounded-sm gap-2 px-2 py-1.5",
                        isSelected && "bg-accent text-accent-foreground",
                      )}
                    >
                      <Check
                        className={cn(
                          "size-4 shrink-0 text-primary transition-opacity",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
            <ShortcutHints />
          </Command>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  )
}
