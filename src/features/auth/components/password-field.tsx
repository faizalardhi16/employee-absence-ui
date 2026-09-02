import { EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react"

import { TextField } from "@/components/form/text-field"
import { InputGroupButton } from "@/components/ui/input-group"

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  showPassword: boolean
  onToggleVisibility: () => void
  autoComplete?: string
}

/** Field password dengan toggle tampil/sembunyi — dipakai Login & Register. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  autoComplete = "current-password",
}: PasswordFieldProps) {
  return (
    <TextField
      id={id}
      name={id}
      type={showPassword ? "text" : "password"}
      label={label}
      placeholder="••••••••"
      autoComplete={autoComplete}
      required
      value={value}
      onChange={(event) => onChange(event.target.value)}
      leftIcon={<KeyRoundIcon className="size-4" aria-hidden />}
      trailing={
        <InputGroupButton
          size="icon-sm"
          variant="ghost"
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          onClick={onToggleVisibility}
        >
          {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </InputGroupButton>
      }
    />
  )
}