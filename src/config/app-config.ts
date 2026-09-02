/** Sumber konfigurasi runtime aplikasi — satu pintu, mudah di-override via .env. */
const env = import.meta.env

export const appConfig = {
  /** Base URL API backend. Default pakai proxy dev Vite (`/api` → localhost:3000). */
  apiBaseUrl: env.VITE_API_BASE_URL ?? "/api",
  appName: "Police UI",
} as const
