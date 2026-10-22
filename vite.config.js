import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Services are bound to loopback only (security policy: never bind 0.0.0.0).
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 4173 },
  test: { environment: 'node' },
})
