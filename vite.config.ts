import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import { defineConfig } from 'vite'

/** Origin backend NestJS (nest-fastify-skeleton). Override via env BACKEND_ORIGIN. */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'http://localhost:3100'
const API_PROXY_PREFIX = '/api'

/**
 * Log ramah untuk kegagalan proxy (mis. backend belum dijalankan),
 * menggantikan stack AggregateError yang sulit dibaca.
 */
function logProxyError(code = '?', method = '?', url = '?'): void {
  const message =
    code === 'ECONNREFUSED'
      ? `backend tidak merespons di ${BACKEND_ORIGIN} - jalankan nest-fastify-skeleton`
      : `gagal meneruskan ${method} ${url}`
  console.warn(JSON.stringify({ level: 'warn', msg: `proxy ${API_PROXY_PREFIX}: ${message}`, code }))
}

export default defineConfig({
  plugins: [react()],
  css: {
    // Inline agar tidak bergantung pada auto-discovery postcss.config.* yang
    // tidak reliable di Vite 8; Tailwind diproses lewat jalur PostCSS stabil.
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      [API_PROXY_PREFIX]: {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (error, request) => {
            logProxyError((error as NodeJS.ErrnoException).code, request?.method, request?.url)
          })
        },
      },
    },
  },
})
