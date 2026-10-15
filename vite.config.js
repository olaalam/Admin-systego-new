import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/admin-login',
  envPrefix: 'VITE_',
  server: {
    proxy: {
      '/plesk-proxy': {
        target: 'https://62.84.185.153:8443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/plesk-proxy/, ''),
      },
    },
  },
})
