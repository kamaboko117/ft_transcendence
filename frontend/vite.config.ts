import { defineConfig } from 'vite'
import { readFileSync } from 'fs';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    },
    https: {
      key: readFileSync('/etc/nginx/certificate.key'),
      cert: readFileSync('/etc/nginx/certificate.crt'),
    },
    host: true,
    port: 5173,
    hmr: {
      port: 5174, protocol: 'wss'
    }
  }
})