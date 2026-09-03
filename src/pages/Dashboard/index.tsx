import {
  CheckCircle2Icon,
  FileCheck2Icon,
  FileTextIcon,
  GaugeIcon,
  Loader2Icon,
  LockIcon,
  LogInIcon,
  LogOutIcon,
  MoonStarIcon,
  RefreshCwIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ActivityFeed } from "./components/activity-feed"
import type { ActivityItem } from "./components/activity-feed"
import { AreaChart } from "./components/area-chart"
import { BarChart } from "./components/bar-chart"
import { DonutChart } from "./components/donut-chart"
import { KpiCard } from "./components/kpi-card"
import type { KpiCardProps } from "./components/kpi-card"
import { InfoBox, SessionStatus } from "./components/info-box"
import { DataTable } from "@/components/data/data-table"
import type { DataColumn } from "@/components/data/data-table"
import { usePermissions } from "@/features/auth/use-auth"
import { ClockInConfirmDialog } from "@/features/attendance/components/clock-in-confirm-dialog"
import { attendanceApi } from "@/features/attendance/attendance.api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/auth.store"
import { toApiError } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import { getTodayRecord, clockIn as apiClockIn, autoCloseRecord } from "@/lib/api"
import { toWibDisplay } from "@/lib/time"
import type { AttendanceRecord, EmployeeAttendanceRecord } from "@/types/attendance"

type Period = "Hari Ini" | "7 Hari" | "30 Hari"

const PERIODS: Period[] = ["Hari Ini", "7 Hari", "30 Hari"]

// ---------- Data deterministik (seed tetap → konsisten antar render) ----------

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

function dateLabel(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function buildSeries(days: number, seed: number, base: number, variance: number) {
  const rand = seededRandom(seed)
  const labels: string[] = []
  const values: number[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    labels.push(dateLabel(offset))
    values.push(Math.round(base + rand() * variance))
  }
  return { labels, values }
}

function buildHourlySeries() {
  const rand = seededRandom(2026)
  const labels: string[] = []
  const values: number[] = []
  for (let hour = 0; hour < 24; hour += 1) {
    labels.push(`${String(hour).padStart(2, "0")}.00`)
    values.push(Math.round(4 + rand() * 8 + (hour < 6 || hour > 21 ? 1 : 4)))
  }
  return { labels, values }
}

const SERIES: Record<Period, { labels: string[]; values: number[] }> = {
  "Hari Ini": buildHourlySeries(),
  "7 Hari": buildSeries(7, 42, 95, 60),
  "30 Hari": buildSeries(30, 1337, 88, 70),
}

const REPORT_STATUS = [
  { label: "Selesai", value: 124, colorClass: "stroke-chart-2" },
  { label: "Diproses", value: 86, colorClass: "stroke-chart-1" },
  { label: "Menunggu", value: 34, colorClass: "stroke-chart-3" },
  { label: "Ditolak", value: 12, colorClass: "stroke-destructive" },
]

const UNIT_REPORTS = [
  { label: "Reskrim", value: 84 },
  { label: "Narkoba", value: 62 },
  { label: "Lalin", value: 47 },
  { label: "Intelkam", value: 39 },
  { label: "Sabhara", value: 28 },
  { label: "Humas", value: 21 },
]

const ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    icon: FileCheck2Icon,
    title: "Laporan #A-1042 disahkan",
    description: "Laporan patroli malam disetujui oleh Kompol S. Rahayu.",
    time: "2 mnt lalu",
    tone: "primary",
  },
  {
    id: "a2",
    icon: UserPlusIcon,
    title: "Personel baru ditugaskan",
    description: "3 personel ditambahkan ke Satuan Lalu Lintas.",
    time: "18 mnt lalu",
    tone: "cyan",
  },
  {
    id: "a3",
    icon: TriangleAlertIcon,
    title: "Peringatan: kuota penyimpanan",
    description: "Arsip bulan lalu mencapai 92% kapasitas.",
    time: "1 jam lalu",
    tone: "amber",
  },
  {
    id: "a4",
    icon: CheckCircle2Icon,
    title: "Verifikasi otomatis selesai",
    description: "12 laporan diverifikasi oleh sistem tanpa intervensi.",
    time: "2 jam lalu",
    tone: "cyan",
  },
  {
    id: "a5",
    icon: MoonStarIcon,
    title: "Shift malam dimulai",
    description: "Pergantian shift pukul 22.00 WIB — 48 personel bertugas.",
    time: "3 jam lalu",
    tone: "primary",
  },
  {
    id: "a6",
    icon: LockIcon,
    title: "Percobaan akses diblokir",
    description: "3 percobaan login gagal dari alamat IP asing.",
    time: "4 jam lalu",
    tone: "rose",
  },
]

const KPI_PER_PERIOD: Record<Period, KpiCardProps[]> = {
  "Hari Ini": [
    { label: "Laporan Masuk", value: 142, delta: 12, icon: FileTextIcon, tone: "primary", hint: "Sejak tengah malam" },
    { label: "Kasus Aktif", value: 23, delta: -4, icon: ScaleIcon, tone: "amber", hint: "Di seluruh unit" },
    { label: "Personel Bertugas", value: 486, delta: 3, icon: UsersIcon, tone: "cyan", hint: "Dari 512 total" },
    { label: "Tingkat Respons", value: 94, suffix: "%", delta: 2, icon: GaugeIcon, tone: "rose", hint: "Target 90%" },
  ],
  "7 Hari": [
    { label: "Laporan Masuk", value: 843, delta: 8, icon: FileTextIcon, tone: "primary", hint: "Rata-rata 120/hari" },
    { label: "Kasus Aktif", value: 151, delta: -11, icon: ScaleIcon, tone: "amber", hint: "Penurunan 11%" },
    { label: "Personel Bertugas", value: 1210, delta: 5, icon: UsersIcon, tone: "cyan", hint: "Rata-rata harian" },
    { label: "Tingkat Respons", value: 91, suffix: "%", delta: -1, icon: GaugeIcon, tone: "rose", hint: "Target 90%" },
  ],
  "30 Hari": [
    { label: "Laporan Masuk", value: 3120, delta: 15, icon: FileTextIcon, tone: "primary", hint: "Rata-rata 104/hari" },
    { label: "Kasus Aktif", value: 587, delta: 6, icon: ScaleIcon, tone: "amber", hint: "Termasuk 32 kasus baru" },
    { label: "Personel Bertugas", value: 3420, delta: 2, icon: UsersIcon, tone: "cyan", hint: "Rata-rata harian" },
    { label: "Tingkat Respons", value: 88, suffix: "%", delta: -3, icon: GaugeIcon, tone: "rose", hint: "Target 90%" },
  ],
}

// ---------- Laporan terbaru ----------

type ReportStatus = "Selesai" | "Diproses" | "Menunggu" | "Ditolak"

interface RecentReport {
  id: string
  title: string
  category: string
  status: ReportStatus
  date: string
}

const REPORT_STATUS_VARIANT: Record<ReportStatus, "default" | "secondary" | "outline" | "destructive"> = {
  Selesai: "default",
  Diproses: "secondary",
  Menunggu: "outline",
  Ditolak: "destructive",
}

const RECENT_REPORTS: RecentReport[] = [
  { id: "A-1042", title: "Patroli malam kawasan Pasar Baru", category: "Patroli", status: "Selesai", date: "2026-08-23 06:10" },
  { id: "A-1041", title: "Penanganan laka tunggal Jl. Sudirman", category: "Laka", status: "Diproses", date: "2026-08-23 05:42" },
  { id: "A-1040", title: "Pengaduan kebisingan warga RT 05", category: "Pengaduan", status: "Menunggu", date: "2026-08-22 21:30" },
  { id: "A-1039", title: "Penyelidikan kasus pencurian toko elektronik", category: "Penyelidikan", status: "Diproses", date: "2026-08-22 19:05" },
  { id: "A-1038", title: "Razia gabungan keamanan lalu lintas", category: "Razia", status: "Selesai", date: "2026-08-22 15:20" },
  { id: "A-1037", title: "Laporan kehilangan dokumen penting", category: "Pengaduan", status: "Ditolak", date: "2026-08-22 11:48" },
  { id: "A-1036", title: "Pengamanan kegiatan masyarakat", category: "Pengamanan", status: "Selesai", date: "2026-08-22 09:15" },
  { id: "A-1035", title: "Penertiban parkir liar kawasan pasar", category: "Penertiban", status: "Menunggu", date: "2026-08-21 16:40" },
]

const REPORT_COLUMNS: DataColumn<RecentReport>[] = [
  {
    id: "id",
    header: "No.",
    className: "w-20 font-mono text-[11px] text-muted-foreground",
    sortValue: (report) => report.id,
    cell: (report) => report.id,
  },
  {
    id: "title",
    header: "Judul",
    sortValue: (report) => report.title,
    cell: (report) => <span className="font-medium">{report.title}</span>,
  },
  {
    id: "category",
    header: "Kategori",
    sortValue: (report) => report.category,
    cell: (report) => report.category,
  },
  {
    id: "status",
    header: "Status",
    sortValue: (report) => report.status,
    cell: (report) => (
      <Badge variant={REPORT_STATUS_VARIANT[report.status]}>{report.status}</Badge>
    ),
  },
  {
    id: "date",
    header: "Waktu",
    className: "text-right tabular-nums",
    sortValue: (report) => report.date,
    cell: (report) => report.date,
  },
]

// ---------- Helpers UI ----------

function useCurrentTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

// ---------- Clock in/out (attendance) ----------

const ATTENDANCE_QUERY_KEY = ["attendance", "today"] as const

const NO_OPEN_RECORD_MESSAGE =
  "Belum ada catatan kehadiran yang sedang terbuka untuk hari ini. Clock out dibatalkan."
const TOAST_CLOCK_OUT_SUCCESS = "Clock out berhasil. Sampai jumpa!"
const TOAST_CLOCK_IN_SUCCESS = "Clock in berhasil. Selamat bekerja!"
const OPEN_RECORD_TODAY_MESSAGE = "You already have an open attendance record today"
const ALREADY_CLOCKED_IN_MESSAGE = "Already clocked in"
const INVALID_CLOCK_IN_TIMESTAMP_MESSAGE =
  "Invalid clock-in timestamp received from system. No record was created."

/** Record kehadiran yang masih terbuka (sudah clock in, belum clock out). */
function findOpenRecord(records: AttendanceRecord[]): AttendanceRecord | null {
  return (
    records.find((record) => record.clockIn !== null && record.clockOut === null) ??
    null
  )
}

/** Apakah record milik hari ini (membandingkan tanggal, bukan jam)? */
function isRecordFromToday(record: AttendanceRecord | null | undefined): boolean {
  if (!record || !record.date) return false
  const [year, month, day] = record.date.split("-").map(Number)
  if ([year, month, day].some(Number.isNaN)) return false
  const today = new Date()
  return (
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate()
  )
}

/** Status clock berdasarkan record hari ini: CLOCKED_IN bila ada record terbuka hari ini. */
function getClockStatus(openRecord: AttendanceRecord | null): "CLOCKED_IN" | "CLOCKED_OUT" {
  return openRecord && isRecordFromToday(openRecord) ? "CLOCKED_IN" : "CLOCKED_OUT"
}

/** Timestamp clock-in dari record dianggap valid bila ada & tanggalnya valid. */
function isValidClockInTimestamp(iso: string | null | undefined): iso is string {
  return typeof iso === "string" && iso.length > 0 && !Number.isNaN(new Date(iso).getTime())
}

/**
 * Hook clock in/out: validasi sebelum clock in (cek record terbuka hari ini atau hari sebelumnya),
 * auto-close record hari sebelumnya jika ada, dan clock out untuk record hari ini.
 * Loading & error dikelola lewat state react-query.
 */
function useClock() {
  const queryClient = useQueryClient()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const clockInSubmittingRef = useRef(false)

  const todayQuery = useQuery({
    queryKey: ATTENDANCE_QUERY_KEY,
    queryFn: () => attendanceApi.getToday(),
  })

  const records = todayQuery.data ?? []
  const openRecord = findOpenRecord(records)
  const clockStatus = getClockStatus(openRecord)

  /** Record yang ditampilkan: record terbuka bila ada, jika tidak yang terakhir. */
  const todayRecord =
    openRecord ?? (records.length > 0 ? records[records.length - 1] : null)

  const clockInMutation = useMutation({
    mutationFn: async (confirmedAt: Date) => {
      const todayRecords = await getTodayRecord()
      const openRecordToday = findOpenRecord(todayRecords)

      if (openRecordToday) {
        const recordDate = new Date(openRecordToday.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate())

        if (recordDateOnly.getTime() === today.getTime()) {
          throw new Error(OPEN_RECORD_TODAY_MESSAGE)
        }

        const autoCloseTime = new Date()
        autoCloseTime.setUTCHours(16, 59, 59, 0)
        const autoCloseISO = autoCloseTime.toISOString()
        await autoCloseRecord(openRecordToday.id, autoCloseISO)
      }

      const newRecord = await apiClockIn(confirmedAt.toISOString())

      // Timestamp sistem hilang/tidak valid => error, tidak ada yang dicatat.
      if (!newRecord || !isValidClockInTimestamp(newRecord.clockIn)) {
        throw new Error(INVALID_CLOCK_IN_TIMESTAMP_MESSAGE)
      }

      return newRecord
    },
    onSuccess: (newRecord) => {
      queryClient.setQueryData<AttendanceRecord[]>(
        ATTENDANCE_QUERY_KEY,
        (current = []) => [...current, newRecord],
      )
      setValidationError(null)
      setConfirmOpen(false)
      clockInSubmittingRef.current = false
      toast.success(TOAST_CLOCK_IN_SUCCESS)
    },
    onError: (error) => {
      const message = toApiError(error).message
      setValidationError(message)
      setConfirmOpen(false)
      clockInSubmittingRef.current = false
      toast.error(message)
    },
  })

  const clockOutMutation = useMutation({
    mutationFn: (recordId: string) => attendanceApi.clockOut(recordId),
    onSuccess: (closedRecord) => {
      queryClient.setQueryData<AttendanceRecord[]>(
        ATTENDANCE_QUERY_KEY,
        (current = []) =>
          current.map((record) =>
            record.id === closedRecord.id ? closedRecord : record,
          ),
      )
      setValidationError(null)
      toast.success(TOAST_CLOCK_OUT_SUCCESS)
    },
    onError: (error) => {
      const message = toApiError(error).message
      setValidationError(message)
      toast.error(message)
    },
  })

  const clockIn = () => {
    setValidationError(null)

    // Status CLOCKED_IN: blokir tanpa membuka modal, tampilkan pesan inline.
    if (clockStatus === "CLOCKED_IN") {
      setValidationError(ALREADY_CLOCKED_IN_MESSAGE)
      return
    }

    // Status CLOCKED_OUT (termasuk tanpa catatan): buka modal konfirmasi.
    // State tunggal menjamin klik ganda hanya menghasilkan satu modal.
    setConfirmOpen(true)
  }

  /** Confirm dari modal: catat timestamp tepat saat klik, lalu rekam clock-in. */
  const confirmClockIn = () => {
    // Klik berulang (synchronous / sangat cepat) => abaikan: satu record.
    if (clockInSubmittingRef.current || clockInMutation.isPending) return
    clockInSubmittingRef.current = true
    setValidationError(null)
    setConfirmOpen(false)
    clockInMutation.mutate(new Date())
  }

  const clockOut = () => {
    setValidationError(null)

    if (!openRecord) {
      setValidationError(NO_OPEN_RECORD_MESSAGE)
      toast.error(NO_OPEN_RECORD_MESSAGE)
      return false
    }

    clockOutMutation.mutate(openRecord.id)
    return true
  }

  const isLoading = todayQuery.isPending
  const isClockInPending = clockInMutation.isPending
  const isClockOutPending = clockOutMutation.isPending
  const loadError = todayQuery.error ? toApiError(todayQuery.error).message : null

  return {
    todayRecord,
    openRecord,
    clockStatus,
    confirmOpen,
    setConfirmOpen,
    isLoading,
    isClockInPending,
    isClockOutPending,
    isPending: isLoading || isClockInPending || isClockOutPending,
    error: loadError ?? validationError,
    clockIn,
    confirmClockIn,
    clockOut,
  }
}

function greetingFor(hour: number): string {
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 19) return "Selamat sore"
  return "Selamat malam"
}

function displayName(email: string | undefined): string {
  if (!email) return "Petugas"
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

// ---------- Catatan kehadiran (waktu selesai dalam WIB) ----------

/** Format timestamp UTC menjadi HH:mm:ss di zona waktu Asia/Jakarta (WIB, UTC+7). */
function formatWibTime(iso: string | null): string {
  if (!iso) return "-"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

/** Normalisasi tanggal (string atau Date) menjadi YYYY-MM-DD untuk parameter API. */
function toDateString(date: string | Date): string {
  if (date instanceof Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  return date
}

/**
 * Ambil catatan Clock In/Clock Out seluruh karyawan pada tanggal tertentu dan
 * format seluruh timestamp ke zona waktu Asia/Jakarta (WIB) via Intl.DateTimeFormat.
 * Loading & error state dikelola oleh React Query.
 */
export function useAttendanceData(date: string | Date) {
  const dateParam = toDateString(date)

  const query = useQuery({
    queryKey: ["attendance", "date", dateParam],
    queryFn: () => attendanceApi.getByDate(dateParam),
  })

  const data: EmployeeAttendanceRecord[] = (query.data ?? []).map((record) => ({
    ...record,
    clockIn: formatWibTime(record.clockIn),
    clockOut: formatWibTime(record.clockOut),
  }))

  return {
    data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error ? toApiError(query.error).message : null,
  }
}

/** Ringkasan catatan kehadiran hari ini; menampilkan waktu selesai (clock out) dalam WIB. */
function AttendanceRecordCard({
  record,
  isPending,
}: {
  record: AttendanceRecord | null
  isPending: boolean
}) {
  const isClosed = record !== null && record.clockOut !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheckIcon className="size-4 text-primary" aria-hidden />
          Catatan Kehadiran Hari Ini
        </CardTitle>
        <CardDescription>
          Waktu clock in & clock out dikonversi ke zona waktu Asia/Jakarta (WIB).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isPending ? (
          <Skeleton className="h-16 w-full" />
        ) : !record || record.clockIn === null ? (
          <p className="text-sm text-muted-foreground">
            Belum ada catatan kehadiran untuk hari ini.
          </p>
        ) : (
          <>
            <p
              role="status"
              className="flex items-start gap-2 rounded-sm border border-chart-2/30 bg-chart-2/10 px-3 py-2 text-sm font-medium text-chart-2"
            >
              <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="break-words tabular-nums">
                Clocked in at: {toWibDisplay(record.clockIn)}
              </span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {isClosed ? (
                <InfoBox
                  label="Clock Out — Selesai (WIB)"
                  value={toWibDisplay(record.clockOut ?? record.clockIn)}
                />
              ) : (
                <InfoBox label="Status" value="Sedang berlangsung" />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Dashboard interaktif: KPI beranimasi, grafik periodik, umpan aktivitas. */
const REFRESH_INTERVAL_MS = 30_000

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const permissionsQuery = usePermissions()
  const now = useCurrentTime()
  const { todayRecord, openRecord, isPending, isClockInPending, error: clockError, clockIn, confirmClockIn, confirmOpen, setConfirmOpen, clockOut } = useClock()
  const [period, setPeriod] = useState<Period>("7 Hari")
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const queryClient = useQueryClient()
  const attendanceData = useAttendanceData(selectedDate)

  const refreshData = useCallback(() => {
    const dateParam = toDateString(selectedDate)
    queryClient.invalidateQueries({ queryKey: ["attendance", "date", dateParam] })
  }, [queryClient, selectedDate])

  useEffect(() => {
    const intervalId = window.setInterval(refreshData, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [refreshData])

  const series = SERIES[period]
  const kpis = KPI_PER_PERIOD[period]
  const activePeriodIndex = PERIODS.indexOf(period)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <section className="glass-panel rounded-md p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              Control center
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              {greetingFor(now.getHours())}, {displayName(user?.email)}.
            </h1>
            <p className="text-sm text-muted-foreground">
              {now.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              ·{" "}
              <time className="tabular-nums">
                {now.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                WIB
              </time>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex w-full items-end gap-2 sm:w-72">
              <div className="flex-1">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Tanggal
                </label>
                <DatePicker
                  value={selectedDate}
                  onValueChange={(date) => {
                    if (date) setSelectedDate(date)
                  }}
                  max={new Date()}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={refreshData}
                disabled={attendanceData.isLoading}
                aria-label="Refresh data"
              >
                {attendanceData.isLoading ? (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                ) : (
                  <RefreshCwIcon className="size-4" aria-hidden />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-chart-2/30 bg-chart-2/10 px-3 py-1 text-[11px] font-bold text-chart-2">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-chart-2" />
                </span>
                Live
              </span>
              <span className="hidden rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] font-bold text-muted-foreground sm:inline-flex">
                API · 42 ms
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={clockIn}
                disabled={isPending}
                aria-label="Clock In"
              >
                {isClockInPending ? (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                ) : (
                  <LogInIcon className="size-4" aria-hidden />
                )}
                Clock In
              </Button>
              <Button
                type="button"
                size="sm"
                variant={openRecord ? "default" : "outline"}
                disabled={isPending || !openRecord}
                onClick={clockOut}
              >
                {isPending ? (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                ) : (
                  <LogOutIcon className="size-4" aria-hidden />
                )}
                Clock Out
              </Button>
            </div>
            {clockError ? (
              <p role="alert" className="max-w-xs text-right text-xs text-destructive">
                {clockError}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Konfirmasi clock-in: cegah clock-in tak sengaja */}
      <ClockInConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmClockIn}
        confirming={isClockInPending}
      />

      {/* Catatan kehadiran hari ini (waktu selesai dalam WIB) */}
      <AttendanceRecordCard record={todayRecord} isPending={isPending} />

      {/* Pemilih periode + KPI */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold">Ringkasan {period.toLowerCase()}</p>
        <div
          role="group"
          aria-label="Pilih periode"
          className="relative grid grid-cols-3 rounded-md border border-border/70 bg-card/80 p-1 backdrop-blur-xl"
        >
          <span
            aria-hidden
            className="absolute inset-y-1 z-0 rounded-sm bg-primary shadow-[0_6px_16px_rgba(37,99,235,0.25)] transition-transform duration-200 ease-out"
            style={{ width: "calc(33.333% - 4px)", transform: `translateX(${activePeriodIndex * 100}%)` }}
          />
          {PERIODS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              aria-pressed={option === period}
              className={cn(
                "relative z-10 h-8 rounded-sm px-3 text-xs font-bold transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                option === period
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Grafik utama */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Laporan Masuk — {period.toLowerCase()}</CardTitle>
            <CardDescription>
              Jumlah laporan per {period === "Hari Ini" ? "jam" : "hari"}; arahkan kursor untuk detail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart values={series.values} labels={series.labels} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Laporan</CardTitle>
            <CardDescription>Distribusi 256 laporan bulan berjalan.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart segments={REPORT_STATUS} centerLabel="Total" />
          </CardContent>
        </Card>
      </div>

      {/* Analitik kedua */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Laporan per Kesatuan</CardTitle>
            <CardDescription>7 hari terakhir; hover untuk nilai.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={UNIT_REPORTS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
            <CardDescription>Peristiwa terakhir dari seluruh sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={ACTIVITIES} />
          </CardContent>
        </Card>
      </div>

      {/* Tabel + sesi */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Laporan Terbaru</CardTitle>
            <CardDescription>Daftar laporan masuk; kolom bisa diurutkan & dicari.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={REPORT_COLUMNS}
              rows={RECENT_REPORTS}
              getRowId={(report) => report.id}
              enableSearch
              searchPlaceholder="Cari laporan..."
              enableSort
              enablePagination
              pageSize={5}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheckIcon className="size-4 text-primary" aria-hidden />
              Sesi & Hak Akses
            </CardTitle>
            <CardDescription>Status session aktif dari cookie.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <InfoBox label="Email" value={user?.email ?? "-"} />
              <InfoBox label="User ID" value={String(user?.userId ?? "-")} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Peran
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(user?.roles ?? []).map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Hak akses (permission)
              </p>
              <div className="mt-1.5 flex min-h-7 flex-wrap content-start gap-1.5">
                {permissionsQuery.isPending ? (
                  <>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </>
                ) : permissionsQuery.isError ? (
                  <p className="text-xs text-destructive">Gagal memuat permission.</p>
                ) : permissionsQuery.data.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Tidak ada permission khusus.</p>
                ) : (
                  permissionsQuery.data.slice(0, 8).map((permission) => (
                    <Badge key={permission} variant="outline" className="font-mono text-[11px]">
                      {permission}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <SessionStatus />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}