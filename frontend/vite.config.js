import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin requests in dev (avoids CORS); backend must run on 8000
      "/query": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/generate-insight": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/explain-query": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/connect-db": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
})
