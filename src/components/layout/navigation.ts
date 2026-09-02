import {
  FileTextIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavLeafItem {
  label: string
  to: string
  /** Item non-aktif (placeholder modul yang belum dibangun). */
  disabled?: boolean
  /** Badge kecil di samping label, mis. "Segera". */
  badge?: string
}

/** Data navigasi sidebar - tambah menu/submenu cukup lewat konfigurasi ini. */
export interface NavItem {
  label: string
  icon: LucideIcon
  to?: string
  children?: NavLeafItem[]
  disabled?: boolean
  badge?: string
}

/** Menu utama (aktif). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboardIcon },
  {
    label: "Modul",
    icon: FolderKanbanIcon,
    children: [
      { label: "Dokumentasi Komponen", to: "/components" },
      { label: "Akses & Izin", to: "/akses" },
      { label: "Detail (Demo)", to: "/detail/demo" },
      { label: "Data Laporan", to: "/laporan", disabled: true, badge: "Segera" },
      { label: "Personel", to: "/personel", disabled: true, badge: "Segera" },
    ],
  },
  { label: "Profil", to: "/profil", icon: UserRoundIcon },
]

/** Menu sekunder (placeholder modul yang belum tersedia). */
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: "Pengaturan", to: "/pengaturan", icon: SettingsIcon, disabled: true, badge: "Segera" },
  { label: "Arsip", to: "/arsip", icon: FileTextIcon, disabled: true, badge: "Segera" },
]