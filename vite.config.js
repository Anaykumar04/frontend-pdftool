import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'google-oauth': ['@react-oauth/google'],
          'pdf-lib': ['pdf-lib'],
          'axios': ['axios'],
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

