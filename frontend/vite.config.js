import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
  optimizeDeps: {
    include: ['alpinejs']
  }
})