import { api } from "@/lib/api"
import type { AttendanceRecord } from "@/types/attendance"

/**
 * Pemetaan endpoint kehadiran backend → fungsi typed.
 * SRP: hanya HTTP; tanpa logika state.
 */
export const attendanceApi = {
  /** Record kehadiran user yang login untuk hari ini. */
  async getToday(): Promise<AttendanceRecord[]> {
    const { data } = await api.get<AttendanceRecord[]>("/attendance/today")
    return data
  },

  /** Tutup (clock out) record kehadiran yang masih terbuka. */
  async clockOut(recordId: string): Promise<AttendanceRecord> {
    const { data } = await api.patch<AttendanceRecord>(
      `/attendance/${recordId}/clock-out`,
    )
    return data
  },
}
