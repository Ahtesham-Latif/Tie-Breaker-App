import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
// @ts-ignore: Node types not explicitly installed
import path from 'path';
// @ts-ignore: Node types not explicitly installed
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      testTimeout: 30000,
      hookTimeout: 30000,
      teardownTimeout: 30000,
      isolate: false,
      threads: true,
      maxThreads: 1,
      minThreads: 1,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});