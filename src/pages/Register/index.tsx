import { KeyRoundIcon, Loader2Icon, MailIcon, UserRoundIcon } from "lucide-react"
import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"

import { BrandLogo } from "@/components/layout/brand-logo"
import { TextField } from "@/components/form/text-field"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRegister } from "@/features/auth/use-auth"
import { PasswordField } from "@/features/auth/components/password-field"
import { FormError } from "@/features/auth/components/form-error"
import { toApiError } from "@/lib/api-error"
import { useAuthStore } from "@/stores/auth.store"
import { RegisterPanel } from "./components/register-panel"

const PASSWORD_MIN_LENGTH = 6 // samakan dengan MinLength(6) di backend
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ERROR_INVALID_EMAIL = "Format email tidak valid."
const ERROR_SHORT_PASSWORD = `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`
const ERROR_PASSWORD_MISMATCH = "Konfirmasi password tidak sama."

/** Registrasi akun baru: role default USER, lalu diarahkan ke halaman login. */
export function RegisterPage() {
  const user = useAuthStore((s) => s.user)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const registerMutation = useRegister()

  // Sudah login → tidak perlu mendaftar lagi.
  if (user) return <Navigate to="/" replace />

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!EMAIL_PATTERN.test(email)) {
      setValidationError(ERROR_INVALID_EMAIL)
      return
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setValidationError(ERROR_SHORT_PASSWORD)
      return
    }
    if (password !== confirmPassword) {
      setValidationError(ERROR_PASSWORD_MISMATCH)
      return
    }

    setValidationError(null)
    registerMutation.mutate({ email, password, name: name.trim() || undefined })
  }

  const apiErrorMessage = registerMutation.isError
    ? toApiError(registerMutation.error).message
    : null

  return (
    <div className="page-transition grid min-h-dvh motion-reduce:animate-none lg:grid-cols-[1.08fr_0.92fr]">
      <RegisterPanel />
      <main className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-xl">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-6 p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="lg:hidden">
                    <BrandLogo />
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    Daftar akun baru
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    Bergabung ke pusat operasi.
                  </h1>
                  <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
                    Buat akun internal Anda. Peran awal adalah USER; administrator
                    dapat menyesuaikan hak akses setelahnya.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <TextField
                  id="name"
                  name="name"
                  type="text"
                  label="Nama lengkap"
                  placeholder="Budi Santoso"
                  autoComplete="name"
                  leftIcon={<UserRoundIcon className="size-4" aria-hidden />}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />

                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="nama@police.go.id"
                  autoComplete="email"
                  required
                  leftIcon={<MailIcon className="size-4" aria-hidden />}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <PasswordField
                    id="password"
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((prev) => !prev)}
                    autoComplete="new-password"
                  />
                  <TextField
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    label="Konfirmasi"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    leftIcon={<KeyRoundIcon className="size-4" aria-hidden />}
                  />
                </div>

                {validationError ? <FormError message={validationError} /> : null}
                {apiErrorMessage ? <FormError message={apiErrorMessage} /> : null}

                <Button type="submit" disabled={registerMutation.isPending} className="mt-2 w-full">
                  {registerMutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  ) : (
                    "Buat akun"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}