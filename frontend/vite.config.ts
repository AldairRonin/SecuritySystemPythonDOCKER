import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    basicSsl({
      domains: ['localhost', '127.0.0.1', '192.168.1.69'],
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,

    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },

      '/qr-codes': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },

      '/guardian-students': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },

      '/students': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },

      '/verification-requests': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },

      '/users': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },

      '/access-logs': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});