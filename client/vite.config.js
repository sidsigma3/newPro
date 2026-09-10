import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Keeps the browser on one origin, so the download request needs no CORS.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
