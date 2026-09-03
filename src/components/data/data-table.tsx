import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"

import { Pagination } from "@/components/data/pagination"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type SortDirection = "asc" | "desc"

/** Definisi kolom — render diserahkan ke pemanggil (OCP tanpa memodifikasi tabel). */
export interface DataColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  /** Kolom "dipaku" ke kiri/kanan saat scroll horizontal (harus punya lebar tetap). */
  sticky?: "left" | "right"
  /** Nilai untuk sorting kolom; tanpa ini kolom tidak ikut di-sort. */
  sortValue?: (row: T) => string | number | Date | null | undefined
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  emptyMessage?: string
  caption?: string
  className?: string

  // ---- Fitur opsional (opt-in) ----
  /** Aktifkan klik header untuk sort (kolom harus punya sortValue). */
  enableSort?: boolean
  initialSort?: { id: string; direction: SortDirection }
  /** Aktifkan toolbar pencarian client-side. */
  enableSearch?: boolean
  searchPlaceholder?: string
  /** Proyeksi teks yang dicari per baris; default JSON seluruh baris. */
  searchValue?: (row: T) => string
  /** Aktifkan pagination client-side. */
  enablePagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
}

const LOADING_ROW_COUNT = 5
const LOADING_CELL_WIDTH = "w-full max-w-32"
const PAGE_SIZE_DEFAULT = 10

/** Bayangan tepi saat kolom sticky agar terlihat "menumpuk" di atas konten. */
function stickyCellClasses(sticky?: "left" | "right"): string {
  if (sticky === "left") {
    return "sticky left-0 z-10 bg-inherit shadow-[8px_0_12px_-8px_rgba(15,23,42,0.28)]"
  }
  if (sticky === "right") {
    return "sticky right-0 z-10 bg-inherit shadow-[-8px_0_12px_-8px_rgba(15,23,42,0.28)]"
  }
  return ""
}

function compareValues(
  a: string | number | Date | null | undefined,
  b: string | number | Date | null | undefined
): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a).localeCompare(String(b), "id", {
    numeric: true,
    sensitivity: "base",
  })
}

/**
 * DataTable — tabel generik ter-typed dengan state loading & kosong bawaan,
 * plus fitur opt-in: kolom sticky kiri/kanan, sort, pencarian, dan pagination
 * (semuanya client-side). SOLID: tiap fitur punya fungsi kecil yang mandiri.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  emptyMessage = "Tidak ada data.",
  caption,
  className,
  enableSort = false,
  initialSort,
  enableSearch = false,
  searchPlaceholder = "Cari...",
  searchValue,
  enablePagination = false,
  pageSize: pageSizeProp = PAGE_SIZE_DEFAULT,
  pageSizeOptions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<{ id: string; direction: SortDirection } | null>(
    initialSort ?? null
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeProp)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const toggleSort = (columnId: string) => {
    setPage(1)
    setSort((prev) => {
      if (prev?.id !== columnId) return { id: columnId, direction: "asc" }
      if (prev.direction === "asc") return { id: columnId, direction: "desc" }
      return null
    })
  }

  // ---- Pencarian ----
  const query = search.trim().toLowerCase()
  const searched = query
    ? rows.filter((row) =>
        (searchValue ? searchValue(row) : JSON.stringify(row))
          .toLowerCase()
          .includes(query)
      )
    : rows

  // ---- Sorting ----
  const sorted = sort
    ? [...searched].sort((a, b) => {
        const column = columns.find((candidate) => candidate.id === sort.id)
        const result = compareValues(
          column?.sortValue?.(a),
          column?.sortValue?.(b)
        )
        return sort.direction === "asc" ? result : -result
      })
    : searched

  // ---- Pagination ----
  const totalPages = enablePagination
    ? Math.max(1, Math.ceil(sorted.length / pageSize))
    : 1
  const safePage = Math.min(page, totalPages)
  const paged = enablePagination
    ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize)
    : sorted

  const columnCount = columns.length

  return (
    <div className={cn("w-full rounded-sm border", className)}>
      {enableSearch ? (
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
          <div className="relative w-full max-w-64">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-8 pl-8"
            />
          </div>
          {searched.length !== rows.length ? (
            <p className="text-xs whitespace-nowrap text-muted-foreground">
              Menampilkan {searched.length} dari {rows.length} data
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <Table>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => {
                const sortable =
                  enableSort && typeof column.sortValue === "function"
                const isSorted = sort?.id === column.id
                return (
                  <TableHead
                    key={column.id}
                    aria-sort={
                      sortable && isSorted
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : sortable
                          ? "none"
                          : undefined
                    }
                    className={cn(stickyCellClasses(column.sticky), column.className)}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        aria-label={`Urutkan berdasarkan ${column.header}`}
                        className="group -m-1 inline-flex items-center gap-1 rounded p-1 font-bold outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                      >
                        {column.header}
                        {isSorted ? (
                          sort.direction === "asc" ? (
                            <ArrowUpIcon
                              className="size-3.5 text-primary"
                              aria-hidden
                            />
                          ) : (
                            <ArrowDownIcon
                              className="size-3.5 text-primary"
                              aria-hidden
                            />
                          )
                        ) : (
                          <ChevronsUpDownIcon
                            className="size-3.5 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground"
                            aria-hidden
                          />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingRows columnCount={columnCount} />
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row) => (
                <TableRow key={getRowId(row)} data-state="idle">
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        stickyCellClasses(column.sticky),
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination ? (
        <div className="border-t border-border/60 px-3 py-2.5">
          <Pagination
            page={safePage}
            pageSize={pageSize}
            totalItems={sorted.length}
            onPageChange={setPage}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize)
              setPage(1)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

function LoadingRows({ columnCount }: { columnCount: number }) {
  return Array.from({ length: LOADING_ROW_COUNT }, (_, rowIndex) => (
    <TableRow key={`loading-${rowIndex}`}>
      {Array.from({ length: columnCount }, (_, columnIndex) => (
        <TableCell key={`cell-${rowIndex}-${columnIndex}`}>
          <Skeleton className={LOADING_CELL_WIDTH} />
        </TableCell>
      ))}
    </TableRow>
  ))
}