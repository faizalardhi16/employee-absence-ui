import { Loader2Icon, MailIcon } from "lucide-react"
import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"

import { BrandLogo } from "@/components/layout/brand-logo"
import { TextField } from "@/components/form/text-field"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useLogin } from "@/features/auth/use-auth"
import { PasswordField } from "@/features/auth/components/password-field"
import { FormError } from "@/features/auth/components/form-error"
import { WelcomePage } from "@/features/auth/welcome-page"
import { toApiError } from "@/lib/api-error"
import { useAuthStore } from "@/stores/auth.store"
import { BrandPanel, FeaturePill } from "./components/brand-panel"
import type { AuthUser } from "@/types/auth"

const HOME_PATH = "/"
const PASSWORD_MIN_LENGTH = 6 // samakan dengan MinLength(6) di backend
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ERROR_INVALID_EMAIL = "Format email tidak valid."
const ERROR_SHORT_PASSWORD = `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`

interface LocationState {
  from?: string
}

export function LoginPage() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [welcomeUser, setWelcomeUser] = useState<AuthUser | null>(null)

  const loginMutation = useLogin({
    onSuccess: (loggedInUser) => {
      // Halaman sambutan (Welcome to Internal Workspace) yang menangani
      // animasi progress lalu navigasi ke workspace.
      setWelcomeUser(loggedInUser)
    },
  })

  // Halaman sambutan berjalan duluan (sebelum redirect "sudah login"),
  // karena useLogin mengisi store user begitu login berhasil.
  if (welcomeUser) {
    return (
      <WelcomePage
        user={welcomeUser}
        destination={(location.state as LocationState | null)?.from ?? HOME_PATH}
      />
    )
  }

  // Sudah login (mis. back dari halaman terproteksi) → langsung masuk aplikasi.
  if (user) return <Navigate to={HOME_PATH} replace />

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

    setValidationError(null)
    loginMutation.mutate({ email, password })
  }

  const apiErrorMessage = loginMutation.isError ? toApiError(loginMutation.error).message : null

  return (
    <div className="page-transition grid min-h-dvh motion-reduce:animate-none lg:grid-cols-[1.08fr_0.92fr]">
      <BrandPanel />
      <main className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-xl">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-8 p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="lg:hidden">
                    <BrandLogo />
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    Secure access
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    Masuk ke pusat operasi.
                  </h1>
                  <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
                    Gunakan akun internal untuk mengakses dashboard, data, dan panel administrasi.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

                <PasswordField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword((prev) => !prev)}
                />

                {validationError ? <FormError message={validationError} /> : null}
                {apiErrorMessage ? <FormError message={apiErrorMessage} /> : null}

                <Button type="submit" disabled={loginMutation.isPending} className="mt-2 w-full">
                  {loginMutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>

              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <FeaturePill title="RBAC" description="Akses berbasis peran" />
                <FeaturePill title="Audit" description="Jejak aktivitas jelas" />
                <FeaturePill title="Session" description="HttpOnly cookie" />
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Daftar di sini
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}