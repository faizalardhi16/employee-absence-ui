/** Kontrak domain attendance — mirror dari AttendanceRecordDto backend NestJS. */
export interface AttendanceRecord {
  /** ID unik record kehadiran. */
  id: string
  /** ID user pemilik record. */
  userId: number
  /** Tanggal kehadiran (YYYY-MM-DD). */
  date: string
  /** Waktu clock-in (ISO) — null bila user belum masuk hari itu. */
  clockIn: string | null
  /** Waktu clock-out (ISO) — null berarti record masih terbuka (belum clock out). */
  clockOut: string | null
}

/** Catatan kehadiran seluruh karyawan per tanggal — mirror dari DTO backend. */
export interface EmployeeAttendanceRecord {
  /** ID unik record kehadiran. */
  id: string
  /** ID user pemilik record. */
  userId: number
  /** Nama lengkap karyawan pemilik record. */
  employeeName: string
  /** Tanggal kehadiran (YYYY-MM-DD). */
  date: string
  /** Waktu clock-in (ISO) — null bila karyawan belum clock in. */
  clockIn: string | null
  /** Waktu clock-out (ISO) — null berarti record masih terbuka (belum clock out). */
  clockOut: string | null
}
