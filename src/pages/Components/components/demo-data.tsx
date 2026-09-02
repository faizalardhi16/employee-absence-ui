import { EyeIcon } from "lucide-react"

import type { DataColumn } from "@/components/data/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SearchableSelectOption } from "@/components/form/searchable-select"

export interface Officer {
  id: number
  name: string
  rank: string
  unit: string
  serviceYears: number
  status: "Aktif" | "Tugas" | "Libur"
}

export const OFFICERS: Officer[] = [
  { id: 1, name: "Budi Santoso", rank: "Brigjen", unit: "Direktorat Reskrim", serviceYears: 24, status: "Aktif" },
  { id: 2, name: "Siti Rahayu", rank: "Kompol", unit: "Bidang Humas", serviceYears: 17, status: "Tugas" },
  { id: 3, name: "Andi Wijaya", rank: "Ajun", unit: "Polsek Pusat", serviceYears: 3, status: "Aktif" },
  { id: 4, name: "Dewi Lestari", rank: "Iptu", unit: "Satuan Lalu Lintas", serviceYears: 12, status: "Libur" },
  { id: 5, name: "Rizky Pratama", rank: "AKBP", unit: "Direktorat Narkoba", serviceYears: 15, status: "Aktif" },
  { id: 6, name: "Fitri Handayani", rank: "Iptu", unit: "Satuan Intelkam", serviceYears: 9, status: "Tugas" },
  { id: 7, name: "Agus Salim", rank: "Kompol", unit: "Direktorat Reskrim", serviceYears: 19, status: "Aktif" },
  { id: 8, name: "Maya Sari", rank: "Ajun", unit: "Bidang Humas", serviceYears: 5, status: "Libur" },
  { id: 9, name: "Hendra Gunawan", rank: "AKP", unit: "Satuan Lalu Lintas", serviceYears: 14, status: "Tugas" },
  { id: 10, name: "Ratna Dewi", rank: "Kompol", unit: "Direktorat Intelkam", serviceYears: 21, status: "Aktif" },
  { id: 11, name: "Fajar Nugroho", rank: "Iptu", unit: "Polsek Timur", serviceYears: 8, status: "Aktif" },
  { id: 12, name: "Lina Marlina", rank: "Ajun", unit: "Satuan Sabhara", serviceYears: 4, status: "Tugas" },
  { id: 13, name: "Yusuf Hidayat", rank: "AKBP", unit: "Direktorat Narkoba", serviceYears: 16, status: "Aktif" },
  { id: 14, name: "Nia Kurniawati", rank: "Iptu", unit: "Bidang Humas", serviceYears: 11, status: "Libur" },
  { id: 15, name: "Bambang Pamungkas", rank: "Kompol", unit: "Direktorat Reskrim", serviceYears: 22, status: "Aktif" },
  { id: 16, name: "Sari Wulandari", rank: "Ajun", unit: "Satuan Lalu Lintas", serviceYears: 6, status: "Tugas" },
  { id: 17, name: "Dimas Anggara", rank: "AKP", unit: "Direktorat Narkoba", serviceYears: 13, status: "Aktif" },
  { id: 18, name: "Putri Melati", rank: "Iptu", unit: "Polsek Pusat", serviceYears: 7, status: "Aktif" },
  { id: 19, name: "Rudi Hartono", rank: "Ajun", unit: "Satuan Sabhara", serviceYears: 2, status: "Tugas" },
  { id: 20, name: "Anisa Fitri", rank: "Kompol", unit: "Direktorat Intelkam", serviceYears: 18, status: "Aktif" },
  { id: 21, name: "Wahyu Kurniawan", rank: "Iptu", unit: "Bidang Humas", serviceYears: 10, status: "Libur" },
  { id: 22, name: "Tiara Ramadhani", rank: "Ajun", unit: "Polsek Timur", serviceYears: 5, status: "Aktif" },
  { id: 23, name: "Eko Prasetyo", rank: "AKP", unit: "Direktorat Reskrim", serviceYears: 15, status: "Tugas" },
  { id: 24, name: "Mila Anggraini", rank: "Kompol", unit: "Satuan Lalu Lintas", serviceYears: 20, status: "Aktif" },
]

export const STATUS_VARIANT: Record<Officer["status"], "default" | "secondary" | "outline"> = {
  Aktif: "default",
  Tugas: "secondary",
  Libur: "outline",
}

export const OFFICER_COLUMNS: DataColumn<Officer>[] = [
  {
    id: "name",
    header: "Nama",
    sticky: "left",
    className: "w-44",
    sortValue: (officer) => officer.name,
    cell: (officer) => <span className="font-medium">{officer.name}</span>,
  },
  {
    id: "rank",
    header: "Pangkat",
    sortValue: (officer) => officer.rank,
    cell: (officer) => officer.rank,
  },
  {
    id: "unit",
    header: "Kesatuan",
    sortValue: (officer) => officer.unit,
    cell: (officer) => officer.unit,
  },
  {
    id: "serviceYears",
    header: "Masa Bakti",
    className: "text-right tabular-nums",
    sortValue: (officer) => officer.serviceYears,
    cell: (officer) => `${officer.serviceYears} thn`,
  },
  {
    id: "status",
    header: "Status",
    sortValue: (officer) => officer.status,
    cell: (officer) => (
      <Badge variant={STATUS_VARIANT[officer.status]}>{officer.status}</Badge>
    ),
  },
  {
    id: "action",
    header: "",
    sticky: "right",
    className: "w-10",
    cell: () => (
      <Button variant="ghost" size="icon-xs" aria-label="Lihat detail">
        <EyeIcon aria-hidden />
      </Button>
    ),
  },
]

export const RANK_OPTIONS: SearchableSelectOption[] = [
  { value: "ajun", label: "Ajun", keywords: ["adjunct"] },
  { value: "iptu", label: "IPTU", keywords: ["inspektur"] },
  { value: "kompol", label: "Kompol", keywords: ["komisaris"] },
  { value: "brigjen", label: "Brigjen", keywords: ["brigadir jenderal"] },
]