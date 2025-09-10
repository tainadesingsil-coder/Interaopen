import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: [
      // LocalTunnel domains
      'loca.lt',
      // TryCloudflare quick tunnels
      'trycloudflare.com',
      // Wildcards for generated subdomains
      '*.loca.lt',
      '*.trycloudflare.com',
    ],
  },
  preview: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: [
      'loca.lt',
      'trycloudflare.com',
      '*.loca.lt',
      '*.trycloudflare.com',
      'croatia-cloud-ruling-talking.trycloudflare.com',
    ],
  },
})
