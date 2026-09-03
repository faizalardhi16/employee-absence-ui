import {
  ArrowLeftIcon,
  FileTextIcon,
  FileUpIcon,
  InfoIcon,
  MapPinIcon,
  UserRoundIcon,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { DetailLayout, DetailSection } from "@/components/layout/detail-layout"
import type { DetailSegment } from "@/components/layout/detail-layout"
import { SearchableSelect } from "@/components/form/searchable-select"
import type { SearchableSelectOption } from "@/components/form/searchable-select"
import { TextField } from "@/components/form/text-field"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"

const TOAST_SUBMIT_SUCCESS = "Detail laporan berhasil disimpan."

const SEGMENTS: DetailSegment[] = [
  { id: "informasi", label: "Informasi Umum", icon: InfoIcon },
  { id: "kronologi", label: "Kronologi", icon: FileTextIcon },
  { id: "pelapor", label: "Data Pelapor", icon: UserRoundIcon },
  { id: "lampiran", label: "Lampiran", icon: FileUpIcon },
]

const CATEGORY_OPTIONS: SearchableSelectOption[] = [
  { value: "patroli", label: "Patroli", keywords: ["ronda", "keliling"] },
  { value: "laka", label: "Laka Lalu Lintas", keywords: ["kecelakaan"] },
  { value: "pengaduan", label: "Pengaduan", keywords: ["aduan", "keluhan"] },
  { value: "penyelidikan", label: "Penyelidikan", keywords: ["sidak"] },
  { value: "razia", label: "Razia Gabungan", keywords: ["operasi"] },
]

const UNIT_OPTIONS: SearchableSelectOption[] = [
  { value: "reskrim", label: "Satuan Reskrim" },
  { value: "narkoba", label: "Satuan Narkoba" },
  { value: "lalin", label: "Satuan Lalu Lintas" },
  { value: "intelkam", label: "Satuan Intelkam" },
  { value: "sabhara", label: "Satuan Sabhara" },
]

/** Contoh halaman detail memakai DetailLayout (segmen kiri + header + form + footer submit). */
export function DetailDemoPage() {
  const navigate = useNavigate()

  const [category, setCategory] = useState<string | null>("patroli")
  const [unit, setUnit] = useState<string | null>(null)
  const [date, setDate] = useState<Date | null>(new Date())
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)
    // Simulasi panggilan API — ganti dengan mutation nyata pada implementasi.
    window.setTimeout(() => {
      setSubmitting(false)
      toast.success(TOAST_SUBMIT_SUCCESS)
    }, 900)
  }

  return (
    <DetailLayout
      segments={SEGMENTS}
      header={{
        eyebrow: "Detail / Laporan",
        title: "Laporan #A-1043",
        description:
          "Lengkapi seluruh segmen di bawah ini. Navigasi segmen di kiri membantu melompat antar bagian form.",
        actions: (
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeftIcon className="size-4" aria-hidden />
            Kembali
          </Button>
        ),
      }}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Simpan Laporan"
      footerHint="Pastikan semua data wajib terisi sebelum menyimpan."
      onCancel={() => navigate("/")}
    >
      <DetailSection id="informasi" title="Informasi Umum" icon={InfoIcon} description="Identitas dasar laporan dan penanggung jawab.">
        <div className="grid gap-4 sm:grid-cols-2">
          <SearchableSelect
            id="category"
            label="Kategori"
            options={CATEGORY_OPTIONS}
            value={category}
            onValueChange={setCategory}
            placeholder="Pilih kategori..."
            searchPlaceholder="Cari kategori..."
            emptyMessage="Kategori tidak ditemukan."
            required
            leftIcon={<MapPinIcon className="size-4" aria-hidden />}
          />
          <SearchableSelect
            id="unit"
            label="Kesatuan Penangan"
            options={UNIT_OPTIONS}
            value={unit}
            onValueChange={setUnit}
            placeholder="Pilih kesatuan..."
            searchPlaceholder="Cari kesatuan..."
            emptyMessage="Kesatuan tidak ditemukan."
            required
          />
          <TextField
            id="report-number"
            name="reportNumber"
            type="text"
            label="Nomor Laporan"
            placeholder="A-1043"
            defaultValue="A-1043"
            disabled
          />
          <div className="grid gap-2">
            <label htmlFor="report-date" className="text-sm font-bold">
              Tanggal Kejadian
            </label>
            <DatePicker
              value={date}
              onValueChange={setDate}
              placeholder="Pilih tanggal..."
            />
          </div>
          <TextField
            id="officer-name"
            name="officerName"
            type="text"
            label="Petugas Penangan"
            placeholder="Nama petugas yang menangani"
            required
          />
          <TextField
            id="priority"
            name="priority"
            type="text"
            label="Prioritas"
            placeholder="Tinggi / Sedang / Rendah"
          />
        </div>
      </DetailSection>

      <DetailSection id="kronologi" title="Kronologi" icon={FileTextIcon} description="Uraian singkat dan lokasi kejadian.">
        <div className="grid gap-4">
          <TextField
            id="location"
            name="location"
            type="text"
            label="Lokasi Kejadian"
            placeholder="Jl. Sudirman No. 12, Jakarta Pusat"
            required
          />
          <div className="grid gap-2">
            <label htmlFor="chronology" className="text-sm font-bold">
              Uraian Kejadian
            </label>
            <Textarea
              id="chronology"
              name="chronology"
              placeholder="Tuliskan kronologi kejadian secara runtut..."
              rows={6}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="action" className="text-sm font-bold">
              Tindakan yang Diambil
            </label>
            <Textarea
              id="action"
              name="action"
              placeholder="Langkah yang sudah dilakukan petugas di lapangan..."
              rows={4}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="witness"
              name="witness"
              type="text"
              label="Saksi di Lokasi"
              placeholder="Nama saksi yang dapat dihubungi"
            />
            <TextField
              id="evidence"
              name="evidence"
              type="text"
              label="Barang Bukti"
              placeholder="Barang bukti yang diamankan"
            />
            <TextField
              id="victim-count"
              name="victimCount"
              type="text"
              label="Jumlah Korban"
              placeholder="Jumlah korban terdampak"
            />
            <TextField
              id="loss"
              name="loss"
              type="text"
              label="Perkiraan Kerugian"
              placeholder="Estimasi nilai kerugian"
            />
          </div>
        </div>
      </DetailSection>

      <DetailSection id="pelapor" title="Data Pelapor" icon={UserRoundIcon} description="Identitas pihak yang melaporkan kejadian.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="reporter-name"
            name="reporterName"
            type="text"
            label="Nama Pelapor"
            placeholder="Nama lengkap pelapor"
            required
          />
          <TextField
            id="reporter-phone"
            name="reporterPhone"
            type="tel"
            label="Nomor Telepon"
            placeholder="08xx-xxxx-xxxx"
            required
          />
          <TextField
            id="reporter-id"
            name="reporterId"
            type="text"
            label="Nomor Identitas"
            placeholder="NIK / Nomor KTP"
          />
          <TextField
            id="reporter-address"
            name="reporterAddress"
            type="text"
            label="Alamat"
            placeholder="Alamat tempat tinggal pelapor"
          />
        </div>
      </DetailSection>

      <DetailSection id="lampiran" title="Lampiran" icon={FileUpIcon} description="Berkas pendukung laporan (opsional).">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="attachment-name"
            name="attachmentName"
            type="text"
            label="Nama Berkas"
            placeholder="mis. foto_tkp_01.jpg"
          />
          <TextField
            id="attachment-note"
            name="attachmentNote"
            type="text"
            label="Keterangan"
            placeholder="Keterangan singkat berkas"
          />
          <TextField
            id="attachment-type"
            name="attachmentType"
            type="text"
            label="Jenis Berkas"
            placeholder="Foto / Video / Dokumen"
          />
          <TextField
            id="attachment-status"
            name="attachmentStatus"
            type="text"
            label="Status Berkas"
            placeholder="Asli / Salinan"
          />
          <TextField
            id="attachment-uploader"
            name="attachmentUploader"
            type="text"
            label="Diupload Oleh"
            placeholder="Nama petugas pengunggah"
          />
          <TextField
            id="attachment-date"
            name="attachmentDate"
            type="text"
            label="Tanggal Upload"
            placeholder="mis. 23-08-2026"
          />
          <TextField
            id="attachment-verified"
            name="attachmentVerified"
            type="text"
            label="Verifikasi"
            placeholder="Belum / Terverifikasi"
          />
        </div>
      </DetailSection>
    </DetailLayout>
  )
}