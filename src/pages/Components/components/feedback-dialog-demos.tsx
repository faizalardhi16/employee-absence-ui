import { CircleAlertIcon, CircleCheckIcon, TriangleAlertIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  ConfirmDialog,
  FailedDialog,
  SuccessDialog,
  WarningDialog,
} from "@/components/ui/feedback-dialog"
import { DemoRow } from "./demo-row"

/** Demo interaktif empat varian Feedback Dialog (state lokal di sini saja). */
export function FeedbackDialogDemos() {
  const [successOpen, setSuccessOpen] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [failedOpen, setFailedOpen] = useState(false)

  return (
    <div className="grid gap-4">
      <DemoRow label="Success">
        <Button variant="outline" onClick={() => setSuccessOpen(true)} data-icon="inline-start">
          <CircleCheckIcon aria-hidden />
          Simpan Berhasil
        </Button>
        <SuccessDialog
          open={successOpen}
          onOpenChange={setSuccessOpen}
          title="Laporan disimpan"
          description="Perubahan pada laporan #A-1043 berhasil disimpan dan tercatat."
          onConfirm={() => setSuccessOpen(false)}
        />
      </DemoRow>

      <DemoRow label="Warning">
        <Button variant="outline" onClick={() => setWarningOpen(true)} data-icon="inline-start">
          <TriangleAlertIcon aria-hidden />
          Kapasitas Menipis
        </Button>
        <WarningDialog
          open={warningOpen}
          onOpenChange={setWarningOpen}
          title="Penyimpanan hampir penuh"
          description="Arsip bulan ini mencapai 92% kapasitas. Hapus berkas lama agar ruang tersedia."
          onConfirm={() => setWarningOpen(false)}
        />
      </DemoRow>

      <DemoRow label="Confirm">
        <Button variant="destructive" onClick={() => setConfirmOpen(true)} data-icon="inline-start">
          <Trash2Icon aria-hidden />
          Hapus Laporan
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Hapus laporan #A-1043?"
          description="Tindakan ini permanen dan tidak bisa dibatalkan."
          confirmLabel="Ya, Hapus"
          danger
          confirming={confirming}
          onConfirm={() => {
            setConfirming(true)
            // Simulasi aksi async; tutup setelah selesai.
            window.setTimeout(() => {
              setConfirming(false)
              setConfirmOpen(false)
            }, 900)
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </DemoRow>

      <DemoRow label="Failed">
        <Button variant="outline" onClick={() => setFailedOpen(true)} data-icon="inline-start">
          <CircleAlertIcon aria-hidden />
          Kirim Gagal
        </Button>
        <FailedDialog
          open={failedOpen}
          onOpenChange={setFailedOpen}
          title="Gagal mengirim laporan"
          description="Server tidak merespons. Periksa koneksi lalu coba lagi."
          onConfirm={() => setFailedOpen(false)}
        />
      </DemoRow>
    </div>
  )
}