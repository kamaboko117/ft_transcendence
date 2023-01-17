import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// https://vitejs.dev/config/

import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    },
    host: true,
    port: 8080,
    hmr: {
      port: 5174
    }
  },  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
})