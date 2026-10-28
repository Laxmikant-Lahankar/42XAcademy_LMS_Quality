import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The backend only allows this origin (CORS); fail instead of silently moving to 5174.
  server: { port: 5173, strictPort: true },
})
