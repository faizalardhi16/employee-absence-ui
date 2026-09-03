import {
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react"
import { useRef, useState } from "react"
import type { DragEvent } from "react"

import { FieldWrapper } from "@/components/form/field-wrapper"
import { cn } from "@/lib/utils"

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/** Kunci unik per file (nama + ukuran + waktu modifikasi). */
function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / 1024 ** index
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ${units[index]}`
}

/** Ikon sesuai tipe file (gambar / dokumen teks-pdf / lainnya). */
function FileTypeIcon({ file }: { file: File }) {
  if (file.type.startsWith("image/")) {
    return <FileImageIcon className="size-4 text-chart-1" aria-hidden />
  }
  if (
    file.type.startsWith("text/") ||
    file.type === "application/pdf" ||
    file.type.includes("document")
  ) {
    return <FileTextIcon className="size-4 text-chart-2" aria-hidden />
  }
  return <FileIcon className="size-4 text-muted-foreground" aria-hidden />
}

function matchesAccept(file: File, accept: string[]): boolean {
  return accept.some((pattern) => {
    const normalized = pattern.trim().toLowerCase()
    if (normalized.endsWith("/*")) {
      return file.type.startsWith(normalized.slice(0, -1))
    }
    return file.type.toLowerCase() === normalized
  })
}

export interface FileUploadProps {
  /** id yang direferensikan label (wajib untuk aksesibilitas). */
  id: string
  label?: string
  hint?: string
  /** Pesan error dari luar (mis. validasi form). */
  error?: string
  required?: boolean
  value: File[]
  onValueChange: (files: File[]) => void
  /** Daftar MIME type yang diizinkan, mis. ["image/*", "application/pdf"]. */
  accept?: string[]
  multiple?: boolean
  maxSizeBytes?: number
  maxFiles?: number
  disabled?: boolean
  className?: string
}

/**
 * FileUpload — unggah file via klik atau drag & drop.
 * Validasi client-side: tipe (accept), ukuran (maxSizeBytes), dan jumlah
 * (maxFiles); file ditolak ditampilkan dengan pesan per-file. Styling memakai
 * design token; area drop beranimasi saat di-hover/drag.
 */
export function FileUpload({
  id,
  label,
  hint,
  error,
  required = false,
  value,
  onValueChange,
  accept,
  multiple = false,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  maxFiles,
  disabled = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})
  const [overflowMessage, setOverflowMessage] = useState<string | null>(null)

  const addFiles = (incoming: File[]) => {
    if (disabled || incoming.length === 0) return

    setOverflowMessage(null)
    const errors: Record<string, string> = {}
    let allowed = incoming

    if (maxFiles !== undefined) {
      const remaining = Math.max(0, maxFiles - value.length)
      if (incoming.length > remaining) {
        setOverflowMessage(
          `Maksimal ${maxFiles} file. ${incoming.length - remaining} file diabaikan.`
        )
      }
      allowed = incoming.slice(0, remaining)
    }
    if (!multiple) {
      allowed = allowed.slice(0, 1)
    }

    const accepted: File[] = []
    for (const file of allowed) {
      const key = fileKey(file)
      if (accept && accept.length > 0 && !matchesAccept(file, accept)) {
        errors[key] = `Tipe "${file.type || "tidak dikenal"}" tidak didukung.`
        continue
      }
      if (file.size > maxSizeBytes) {
        errors[key] = `Ukuran melebihi batas ${formatBytes(maxSizeBytes)}.`
        continue
      }
      accepted.push(file)
    }

    setFileErrors((prev) => ({ ...prev, ...errors }))
    if (accepted.length > 0) {
      onValueChange(multiple ? [...value, ...accepted] : [accepted[0]])
    }
  }

  const removeFile = (key: string) => {
    onValueChange(value.filter((file) => fileKey(file) !== key))
    setFileErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    addFiles(Array.from(event.dataTransfer.files))
  }

  const acceptLabel = accept?.join(", ")

  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={label ?? "Unggah file"}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openPicker()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border px-4 py-8 text-center outline-none transition-all duration-200",
          "hover:border-ring/60 hover:bg-ring/5",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          dragging && "scale-[1.01] border-ring bg-ring/10",
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary animate-in fade-in-0 zoom-in-90 duration-200">
          <UploadCloudIcon className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-bold">Tarik &amp; letakkan file di sini</p>
        <p className="text-xs text-muted-foreground">
          atau{" "}
          <span className="font-medium text-primary underline underline-offset-2">
            klik untuk memilih
          </span>
          {multiple ? " (bisa lebih dari satu)" : null}
        </p>
        {acceptLabel ? (
          <p className="text-[11px] text-muted-foreground">
            Format: {acceptLabel} · maks {formatBytes(maxSizeBytes)}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Maks {formatBytes(maxSizeBytes)} per file
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept?.join(",")}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []))
          event.target.value = ""
        }}
      />

      {value.length > 0 ? (
        <ul className="grid gap-1.5">
          {value.map((file) => {
            const key = fileKey(file)
            const fileError = fileErrors[key]
            return (
              <li
                key={key}
                className={cn(
                  "flex items-center gap-2 rounded-sm border px-2.5 py-2 animate-in fade-in-0 slide-in-from-top-1 duration-150",
                  fileError
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border/70 bg-background/50"
                )}
              >
                <FileTypeIcon file={file} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{file.name}</p>
                  <p
                    className={cn(
                      "text-[11px]",
                      fileError ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {fileError ?? formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(key)}
                  aria-label={`Hapus ${file.name}`}
                  className="-m-1 rounded p-1 text-muted-foreground/70 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-3.5" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {overflowMessage ? (
        <p role="alert" className="text-xs text-destructive">
          {overflowMessage}
        </p>
      ) : null}
    </FieldWrapper>
  )
}