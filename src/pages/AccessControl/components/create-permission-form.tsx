import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"

import { TextField } from "@/components/form/text-field"
import { Button } from "@/components/ui/button"
import {
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useCreatePermission } from "@/features/access-control/use-access-control"
import { toApiError } from "@/lib/api-error"
import type { CreatePermissionInput } from "@/types/access-control"

const PERMISSION_CODE_PATTERN = /^[a-z0-9]+(?:[:._-][a-z0-9]+)*$/

const ERROR_CODE_REQUIRED = "Kode permission wajib diisi."
const ERROR_CODE_FORMAT =
  "Kode hanya huruf kecil, angka, dan pemisah : . _ - (mis. laporan:approve)."
const ERROR_NAME_REQUIRED = "Nama permission wajib diisi."
const TOAST_PERMISSION_CREATED = "Permission berhasil ditambahkan."

/** Form tambah permission baru (di dalam dialog). */
export function CreatePermissionForm({ onDone }: { onDone: () => void }) {
  const createPermission = useCreatePermission()

  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!code.trim()) {
      setValidationError(ERROR_CODE_REQUIRED)
      return
    }
    if (!PERMISSION_CODE_PATTERN.test(code)) {
      setValidationError(ERROR_CODE_FORMAT)
      return
    }
    if (!name.trim()) {
      setValidationError(ERROR_NAME_REQUIRED)
      return
    }

    setValidationError(null)
    createPermission.mutate(
      { code: code.trim(), name: name.trim(), description: description.trim() || undefined } as CreatePermissionInput,
      {
        onSuccess: () => {
          toast.success(TOAST_PERMISSION_CREATED)
          onDone()
        },
      }
    )
  }

  const apiErrorMessage = createPermission.isError
    ? toApiError(createPermission.error).message
    : null

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <TextField
        id="permission-code"
        name="code"
        type="text"
        label="Kode"
        placeholder="laporan:approve"
        required
        autoFocus
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <TextField
        id="permission-name"
        name="name"
        type="text"
        label="Nama"
        placeholder="Approve Laporan"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="grid gap-2">
        <label htmlFor="permission-description" className="text-sm font-bold">
          Deskripsi
        </label>
        <Textarea
          id="permission-description"
          name="description"
          placeholder="Menjelaskan kegunaan permission ini (opsional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {validationError ? (
        <p role="alert" className="text-xs text-destructive">
          {validationError}
        </p>
      ) : null}
      {apiErrorMessage ? (
        <p role="alert" className="text-xs text-destructive">
          {apiErrorMessage}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="submit" disabled={createPermission.isPending}>
          {createPermission.isPending ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : (
            "Simpan"
          )}
        </Button>
        <DialogTrigger asChild>
          <Button variant="outline" type="button">
            Batal
          </Button>
        </DialogTrigger>
      </DialogFooter>
    </form>
  )
}