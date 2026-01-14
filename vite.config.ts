import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://145.223.30.23:3512',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://145.223.30.23:3512',
        ws: true,
      },
    },
  },
})
