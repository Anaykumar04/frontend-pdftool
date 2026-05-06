import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'charts'
          }
          if (id.includes('node_modules/@react-oauth')) {
            return 'google-oauth'
          }
          if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/pdfjs-dist')) {
            return 'pdf-lib'
          }
          if (id.includes('node_modules/axios')) {
            return 'axios'
          }
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        }
      }
    }
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

