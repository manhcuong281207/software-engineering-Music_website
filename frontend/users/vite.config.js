import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '#': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Chuyển tiếp toàn bộ /api/* tới API Gateway (port 8686)
      '/api': {
        target: 'http://localhost:8686',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
