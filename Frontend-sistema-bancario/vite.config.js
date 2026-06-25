import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/v1/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/v1/cuentas': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/request_accounts': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/transactions': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/withdrawals': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/deposits': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/favorite': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/currency': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/services': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/v1/redeem_services': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/v1/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
