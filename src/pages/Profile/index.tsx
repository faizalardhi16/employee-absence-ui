import {
  CameraIcon,
  CheckIcon,
  MapPinIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { FileUpload } from "@/components/form/file-upload"
import { TextField } from "@/components/form/text-field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useProfile, useUpdateProfile } from "@/features/profile/use-profile"
import { toApiError } from "@/lib/api-error"
import { cn } from "@/lib/utils"

/** Baca file gambar menjadi data URL untuk preview & penyimpanan. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"))
    reader.readAsDataURL(file)
  })
}

/** Form edit profil: foto, nama, alamat, negara, kota, dan Developer Mode. */
export function ProfilePage() {
  const profileQuery = useProfile()
  const updateProfile = useUpdateProfile()

  const [name, setName] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [address, setAddress] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [developerMode, setDeveloperMode] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)

  const profile = profileQuery.data

  // Isi form dari profil server saat data pertama tiba / berubah.
  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? "")
    setPhoto(profile.photo)
    setAddress(profile.address ?? "")
    setCountry(profile.country ?? "")
    setCity(profile.city ?? "")
    setDeveloperMode(profile.developerMode)
  }, [profile])

  const dirty = useMemo(() => {
    if (!profile) return false
    return (
      name !== (profile.name ?? "") ||
      photo !== profile.photo ||
      address !== (profile.address ?? "") ||
      country !== (profile.country ?? "") ||
      city !== (profile.city ?? "") ||
      developerMode !== profile.developerMode
    )
  }, [profile, name, photo, address, country, city, developerMode])

  const handleFiles = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setPhotoBusy(true)
    try {
      setPhoto(await readAsDataUrl(file))
    } catch {
      toast.error("Gagal memuat foto. Coba file gambar lain.")
    } finally {
      setPhotoBusy(false)
    }
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        name,
        photo,
        address: address.trim() === "" ? null : address.trim(),
        country: country.trim() === "" ? null : country.trim(),
        city: city.trim() === "" ? null : city.trim(),
        developerMode,
      })
      toast.success("Profil berhasil diperbarui")
    } catch (error) {
      toast.error(toApiError(error).message)
    }
  }

  const initials = (profile?.name || profile?.email || "U").slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col gap-5">
      <section className="glass-panel rounded-md p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Akun
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Profil
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola data diri dan preferensi akun Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{profile?.email ?? "…"}</Badge>
            {developerMode ? (
              <Badge variant="outline" className="border-chart-1/40 text-chart-1">
                Developer Mode ON
              </Badge>
            ) : null}
          </div>
        </div>
      </section>

      {profileQuery.isPending ? (
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : profileQuery.isError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              {toApiError(profileQuery.error).message}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Foto profil */}
          <Card className="self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CameraIcon className="size-4 text-primary" aria-hidden />
                Foto Profil
              </CardTitle>
              <CardDescription>
                Gambar persegi direkomendasikan. Foto disimpan sebagai data URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar size="lg" className="size-28">
                {photo ? (
                  <AvatarImage src={photo} alt="Foto profil" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary/15 to-accent/20 text-2xl font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("profile-photo")?.click()}
                  disabled={photoBusy}
                >
                  <CameraIcon className="size-3.5" aria-hidden />
                  {photoBusy ? "Memuat…" : "Ubah Foto"}
                </Button>
                {photo ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPhoto(null)}
                    aria-label="Hapus foto profil"
                  >
                    <Trash2Icon className="size-3.5" aria-hidden />
                    Hapus
                  </Button>
                ) : null}
              </div>
              <FileUpload
                id="profile-photo"
                label="Pilih file gambar"
                accept={["image/*"]}
                maxSizeBytes={3 * 1024 * 1024}
                value={[]}
                onValueChange={(files) => void handleFiles(files)}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Data profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRoundIcon className="size-4 text-primary" aria-hidden />
                Data Diri
              </CardTitle>
              <CardDescription>
                Perubahan disimpan setelah menekan tombol Simpan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <TextField
                id="profile-name"
                label="Nama"
                placeholder="Nama lengkap Anda"
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                leftIcon={<UserRoundIcon className="size-4" aria-hidden />}
              />

              <TextField
                id="profile-address"
                label="Alamat"
                placeholder="Alamat tempat tinggal"
                maxLength={255}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                leftIcon={<MapPinIcon className="size-4" aria-hidden />}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="profile-country"
                  label="Negara"
                  placeholder="Indonesia"
                  maxLength={100}
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                />
                <TextField
                  id="profile-city"
                  label="Kota"
                  placeholder="Jakarta"
                  maxLength={100}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </div>

              <div
                className={cn(
                  "flex items-start justify-between gap-4 rounded-sm border p-4",
                  developerMode
                    ? "border-chart-1/40 bg-chart-1/5"
                    : "border-border/70 bg-muted/30",
                )}
              >
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        developerMode ? "bg-chart-1" : "bg-muted-foreground/40",
                      )}
                      aria-hidden
                    />
                    Developer Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mengaktifkan inspektor Request/Response Log di pojok kanan
                    bawah layar (untuk debugging API).
                  </p>
                </div>
                <Switch
                  checked={developerMode}
                  onCheckedChange={setDeveloperMode}
                  aria-label="Aktifkan Developer Mode"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!dirty || updateProfile.isPending || photoBusy}
                >
                  {updateProfile.isPending ? (
                    "Menyimpan…"
                  ) : (
                    <>
                      <CheckIcon className="size-4" aria-hidden />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}