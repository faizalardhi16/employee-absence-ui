import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PaginationProps {
  /** Halaman aktif (1-based). */
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  /** Opsi ukuran halaman; tampil hanya bila onPageSizeChange juga diberikan. */
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  /** Jumlah nomor halaman di kiri/kanan halaman aktif (sebelum ellipsis). */
  siblingCount?: number
  className?: string
}

const PAGE_SIZE_OPTIONS_DEFAULT: number[] = [5, 10, 25, 50]

/** Total halaman untuk jumlah item & ukuran halaman tertentu (min 1). */
export function pageCount(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

/**
 * Susun nomor halaman yang ditampilkan: halaman pertama & terakhir selalu
 * tampil; sisanya dibatasi siblingCount + ellipsis saat celah terlalu lebar.
 */
function getPageItems(
  current: number,
  total: number,
  siblingCount: number
): (number | "ellipsis")[] {
  if (total <= siblingCount * 2 + 5) {
    return range(1, total)
  }
  const left = Math.max(current - siblingCount, 2)
  const right = Math.min(current + siblingCount, total - 1)

  const items: (number | "ellipsis")[] = [1]
  if (left > 2) items.push("ellipsis")
  items.push(...range(left, right))
  if (right < total - 1) items.push("ellipsis")
  items.push(total)
  return items
}

/**
 * Pagination — navigasi halaman (1-based) dengan ellipsis otomatis dan
 * opsi ukuran halaman. Styling memakai design token & animasi hover Button.
 */
export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS_DEFAULT,
  onPageSizeChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const totalPages = pageCount(totalItems, pageSize)
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, totalItems)

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <p className="text-xs whitespace-nowrap text-muted-foreground">
        Menampilkan{" "}
        <span className="font-medium text-foreground">
          {startItem}–{endItem}
        </span>{" "}
        dari{" "}
        <span className="font-medium text-foreground">{totalItems}</span> data
      </p>

      <div className="flex flex-wrap items-center gap-1">
        {onPageSizeChange ? (
          <label className="mr-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            Baris per halaman
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-sm border border-input bg-transparent px-1.5 text-xs text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <Button
          variant="outline"
          size="icon-xs"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon aria-hidden />
        </Button>

        {getPageItems(safePage, totalPages, siblingCount).map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-6 items-center justify-center text-sm text-muted-foreground select-none"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              size="xs"
              variant={item === safePage ? "default" : "outline"}
              onClick={() => onPageChange(item)}
              aria-current={item === safePage ? "page" : undefined}
              aria-label={`Halaman ${item}`}
            >
              {item}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon-xs"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </div>
    </div>
  )
}