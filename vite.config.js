import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://backend-pdftool.onrender.com',
        changeOrigin: true,
      },
      '/outputs': {
        target: 'https://backend-pdftool.onrender.com',
        changeOrigin: true,
      },
      '/download': {
        target: 'https://backend-pdftool.onrender.com',
        changeOrigin: true,
      }
    }
  }
})

