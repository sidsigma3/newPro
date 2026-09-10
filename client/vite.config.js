import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Vite only exposes prefixed vars to the browser bundle. `API_` is added so
  // API_BASE_URL works alongside the default VITE_ prefix — never put a secret
  // behind either prefix, it ends up in the public JS.
  envPrefix: ['VITE_', 'API_'],
  server: {
    port: 5173,
    // Keeps the browser on one origin, so the download request needs no CORS.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
