import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/read': {
        target: 'http://localhost:5001', // Read replica
        changeOrigin: true,
      },
      '/api/write': {
        target: 'http://localhost:5000', // Primary DB
        changeOrigin: true,
      },
    },
  },
})
