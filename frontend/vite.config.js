import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {  // This is the context of the requests you want to proxy
        target: 'http://localhost:8000/api',  // The target server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')  // Optionally remove the /api prefix from the request URL
      }
    }
  }
})
