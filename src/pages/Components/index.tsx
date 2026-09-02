import {
  BellIcon,
  CheckIcon,
  DownloadIcon,
  Loader2Icon,
  MedalIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"

import { DataTable } from "@/components/data/data-table"
import { Pagination } from "@/components/data/pagination"
import { FileUpload } from "@/components/form/file-upload"
import { NumberField } from "@/components/form/number-field"
import { SearchableSelect } from "@/components/form/searchable-select"
import { TextField } from "@/components/form/text-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DemoRow } from "./components/demo-row"
import { DocSection } from "./components/doc-section"
import { FeedbackDialogDemos } from "./components/feedback-dialog-demos"
import { OFFICER_COLUMNS, OFFICERS, RANK_OPTIONS } from "./components/demo-data"

const TOAST_DEMO = "Form demo terkirim — lihat console untuk payload."

const SECTIONS = [
  { id: "button", label: "Button" },
  { id: "date-picker", label: "DatePicker" },
  { id: "card", label: "Card" },
  { id: "alert", label: "Alert" },
  { id: "dialog", label: "Dialog" },
  { id: "feedback-dialog", label: "Feedback Dialog" },
  { id: "form-field", label: "Form Field" },
  { id: "file-upload", label: "FileUpload" },
  { id: "data-table", label: "DataTable" },
  { id: "pagination", label: "Pagination" },
] as const

/** Dokumentasi interaktif seluruh komponen design system. */
export function ComponentsPage() {
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState<Date | null>(new Date())
  const [rangeDate, setRangeDate] = useState<Date | null>(null)
  const [alertVisible, setAlertVisible] = useState(true)
  const [textValue, setTextValue] = useState("")
  const [numberValue, setNumberValue] = useState<number | null>(null)
  const [rank, setRank] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [singleFile, setSingleFile] = useState<File[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const dateRange = useMemo(() => {
    const min = new Date()
    min.setMonth(min.getMonth() - 1)
    const max = new Date()
    max.setFullYear(max.getFullYear() + 1)
    return { min, max }
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.info(TOAST_DEMO)
    console.log("demo form payload:", { textValue, numberValue, rank })
  }

  const handleSimulateSave = () => {
    setSaving(true)
    window.setTimeout(() => setSaving(false), 1800)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="glass-panel rounded-sm p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Dokumentasi Komponen
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Referensi interaktif design system: Button, DatePicker, Card, Alert, Dialog,
          Form Field, dan DataTable — seluruhnya memakai design token dan animasi
          (tw-animate-css, hormati prefers-reduced-motion).
        </p>
      </section>

      {/* Navigasi section (sticky) */}
      <nav
        aria-label="Daftar komponen"
        className="sticky top-0 z-40 -mx-4 flex gap-2 overflow-x-auto border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="flex h-8 shrink-0 items-center rounded-sm border border-transparent px-3 text-sm font-medium text-muted-foreground transition-all duration-150 hover:border-border hover:bg-card hover:text-foreground"
          >
            {section.label}
          </a>
        ))}
      </nav>

      {/* Button */}
      <DocSection
        id="button"
        title="Button"
        description="Aksi utama & sekunder. Varian, ukuran, ikon, dan state loading/disabled dengan animasi hover."
      >
        <DemoRow label="Varian">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </DemoRow>
        <DemoRow label="Ukuran">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </DemoRow>
        <DemoRow label="Dengan ikon">
          <Button data-icon="inline-start">
            <DownloadIcon aria-hidden />
            Unduh
          </Button>
          <Button variant="outline" data-icon="inline-end">
            Tambah
            <PlusIcon aria-hidden />
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label="Tambah">
            <PlusIcon aria-hidden />
          </Button>
          <Button variant="outline" size="icon" aria-label="Tambah">
            <PlusIcon aria-hidden />
          </Button>
          <Button variant="outline" size="icon-lg" aria-label="Tambah">
            <PlusIcon aria-hidden />
          </Button>
        </DemoRow>
        <DemoRow label="State">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled outline
          </Button>
          <Button onClick={handleSimulateSave} disabled={saving}>
            {saving ? (
              <Loader2Icon className="animate-spin" aria-hidden />
            ) : null}
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DemoRow>
      </DocSection>

      {/* DatePicker */}
      <DocSection
        id="date-picker"
        title="DatePicker"
        description="Pilih tanggal via popover kalender (minggu mulai Senin, locale id-ID) dengan animasi masuk & efek pop pada hari terpilih."
      >
        <DemoRow label="Dasar">
          <div className="grid w-full max-w-72 gap-1.5">
            <DatePicker value={date} onValueChange={setDate} />
            <p className="text-xs text-muted-foreground">
              Dipilih: {date ? date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </DemoRow>
        <DemoRow label="Rentang min / max (1 bulan lalu s.d. 1 tahun depan)">
          <DatePicker
            className="max-w-72"
            value={rangeDate}
            onValueChange={setRangeDate}
            min={dateRange.min}
            max={dateRange.max}
            placeholder="Pilih dalam rentang"
          />
        </DemoRow>
        <DemoRow label="Disabled">
          <DatePicker className="max-w-72" value={new Date()} disabled />
        </DemoRow>
      </DocSection>

      {/* Card */}
      <DocSection
        id="card"
        title="Card"
        description="Wadah konten dengan efek hover lift, ukuran default & sm, aksi, dan footer."
      >
        <div className="my-4 flex flex-col gap-4">
          <DemoRow label="Default + footer">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Laporan Harian</CardTitle>
              <CardDescription>Ringkasan kegiatan patroli dan penanganan.</CardDescription>
            </CardHeader>
            <CardContent>
              Total 12 laporan masuk hari ini, 3 masih menunggu verifikasi pimpinan.
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" size="sm">Detail</Button>
              <Button size="sm">Lihat Laporan</Button>
            </CardFooter>
          </Card>
        </DemoRow>
        <DemoRow label="Ukuran sm + aksi">
          <Card size="sm" className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Personel Aktif</CardTitle>
              <CardDescription>Status kesiapan personel hari ini.</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon-xs" aria-label="Menu lain">
                  <MoreHorizontalIcon aria-hidden />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              48 personel siap bertugas dari 52 total.
            </CardContent>
          </Card>
        </DemoRow>
        </div>
      </DocSection>

      {/* Alert */}
      <DocSection
        id="alert"
        title="Alert"
        description="Notifikasi kontekstual (info, sukses, peringatan, error) dengan animasi masuk, varian warna design token, dan opsi dismiss."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Alert variant="info">
            <AlertTitle>Informasi</AlertTitle>
            <AlertDescription>
              Pemeliharaan sistem dijadwalkan Minggu pukul 02.00–04.00 WIB.
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle className="flex items-center gap-1.5">
              <CheckIcon className="size-3.5" aria-hidden />
              Berhasil disimpan
            </AlertTitle>
            <AlertDescription>Laporan harian berhasil dikirim ke server.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTitle>Perhatian</AlertTitle>
            <AlertDescription>
              Kuota penyimpanan hampir penuh (92%). Arsipkan berkas lama.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Gagal terhubung</AlertTitle>
            <AlertDescription>
              Server tidak merespons. Periksa koneksi Anda lalu coba lagi.
            </AlertDescription>
          </Alert>
        </div>
        <DemoRow label="Dismissible">
          {alertVisible ? (
            <Alert
              variant="default"
              onDismiss={() => setAlertVisible(false)}
              className="max-w-sm"
            >
              <AlertTitle>Notifikasi tersimpan</AlertTitle>
              <AlertDescription>
                Klik ikon X untuk menutup — alert memainkan animasi keluar.
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlertVisible(true)}
            >
              <BellIcon aria-hidden />
              Tampilkan lagi
            </Button>
          )}
        </DemoRow>
      </DocSection>

      {/* Dialog */}
      <DocSection
        id="dialog"
        title="Dialog"
        description="Modal dengan animasi fade, zoom, dan slide dari bawah; overlay blur. Fokus terkunci (Radix)."
      >
        <DemoRow label="Konfirmasi">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" data-icon="inline-start">
                <Trash2Icon aria-hidden />
                Hapus Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus laporan ini?</DialogTitle>
                <DialogDescription>
                  Tindakan ini permanen dan tidak bisa dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button variant="destructive">Hapus</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DemoRow>
        <DemoRow label="Form singkat">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" data-icon="inline-start">
                <PlusIcon aria-hidden />
                Catat Kunjungan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kunjungan Baru</DialogTitle>
                <DialogDescription>
                  Isi detail kunjungan pada formulir di bawah.
                </DialogDescription>
              </DialogHeader>
              <TextField
                id="visit-subject"
                name="subjek"
                label="Subjek"
                placeholder="Nama tamu / keperluan"
              />
              <TextField
                id="visit-notes"
                name="catatan"
                label="Catatan"
                placeholder="Catatan tambahan (opsional)"
              />
              <DialogFooter showCloseButton>
                <Button>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DemoRow>
      </DocSection>

      {/* Feedback Dialog */}
      <DocSection
        id="feedback-dialog"
        title="Feedback Dialog"
        description="Dialog status: success, warning, confirm, dan failed. Ikon dalam lingkaran berwarna; footer aksi di kanan; dialog terkunci saat memproses."
      >
        <FeedbackDialogDemos />
      </DocSection>

      {/* Form Field */}
      <DocSection
        id="form-field"
        title="Form Field"
        description="TextField, NumberField, dan SearchableSelect terkontrol dengan label, hint, dan error state."
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <TextField
            id="demo-text"
            name="namaLaporan"
            label="Nama Laporan"
            placeholder="Laporan harian..."
            hint="Teks bebas."
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
          />
          <NumberField
            id="demo-number"
            name="jumlahPersonel"
            label="Jumlah Personel"
            hint="Format ribuan otomatis."
            min={0}
            max={100_000}
            leftIcon={<UsersIcon className="size-4 text-muted-foreground/70" aria-hidden />}
            value={numberValue}
            onValueChange={setNumberValue}
          />
          <SearchableSelect
            id="demo-rank"
            label="Pangkat (searchable)"
            options={RANK_OPTIONS}
            value={rank}
            onValueChange={setRank}
            searchPlaceholder="Cari pangkat..."
            leftIcon={<MedalIcon className="size-4" aria-hidden />}
          />
          <div className="md:col-span-3">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DocSection>

      {/* FileUpload */}
      <DocSection
        id="file-upload"
        title="FileUpload"
        description="Unggah via klik atau drag & drop dengan validasi client-side: tipe, ukuran, dan jumlah file."
      >
        <DemoRow label="Gambar, maks 3 file × 2 MB">
          <FileUpload
            id="demo-upload"
            label="Lampiran Laporan"
            hint="PNG/JPG maks 2 MB, maksimal 3 file."
            accept={["image/png", "image/jpeg"]}
            maxSizeBytes={2 * 1024 * 1024}
            maxFiles={3}
            multiple
            value={uploadedFiles}
            onValueChange={setUploadedFiles}
            className="w-full max-w-lg"
          />
        </DemoRow>
        <DemoRow label="File apapun, satu file">
          <FileUpload
            id="demo-upload-single"
            label="Dokumen Pendukung"
            hint="Maks 5 MB (default)."
            value={singleFile}
            onValueChange={setSingleFile}
            className="w-full max-w-lg"
          />
        </DemoRow>
      </DocSection>

      {/* DataTable */}
      <DocSection
        id="data-table"
        title="DataTable"
        description="Kolom ter-typed dengan fitur opt-in: kolom sticky kiri/kanan saat scroll, sort di header, pencarian, dan pagination (semua client-side)."
      >
        <DataTable
          columns={OFFICER_COLUMNS}
          rows={OFFICERS}
          getRowId={(officer) => String(officer.id)}
          caption={`${OFFICERS.length} personel terdaftar`}
          enableSearch
          searchPlaceholder="Cari nama, pangkat, kesatuan..."
          enableSort
          initialSort={{ id: "name", direction: "asc" }}
          enablePagination
          pageSize={8}
        />
      </DocSection>

      {/* Pagination */}
      <DocSection
        id="pagination"
        title="Pagination"
        description="Navigasi halaman 1-based dengan ellipsis otomatis dan opsi ukuran halaman."
      >
        <DemoRow label="Dengan pemilih ukuran halaman">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={OFFICERS.length}
            onPageChange={setPage}
            pageSizeOptions={[5, 10, 25]}
            onPageSizeChange={(next) => {
              setPageSize(next)
              setPage(1)
            }}
            className="w-full"
          />
        </DemoRow>
        <DemoRow label="Tanpa pemilih ukuran halaman">
          <Pagination
            page={2}
            pageSize={10}
            totalItems={87}
            onPageChange={() => undefined}
            className="w-full"
          />
        </DemoRow>
      </DocSection>
    </div>
  )
}