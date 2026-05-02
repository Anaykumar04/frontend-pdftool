import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://pdfeditor-1-xolb.onrender.com',
        changeOrigin: true,
      },
      '/outputs': {
        target: 'https://pdfeditor-1-xolb.onrender.com',
        changeOrigin: true,
      },
      '/download': {
        target: 'https://pdfeditor-1-xolb.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
