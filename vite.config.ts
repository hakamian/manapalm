
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');
    
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        chunkSizeWarningLimit: 500, // Reduced to catch large chunks
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                  return 'vendor-react';
                }
                if (id.includes('@google/genai')) {
                  return 'vendor-ai';
                }
                if (id.includes('pdfjs-dist') || id.includes('jspdf')) {
                  return 'vendor-pdf';
                }
                if (id.includes('@supabase')) {
                  return 'vendor-db';
                }
                return 'vendor-utils';
              }
            }
          }
        }
      }
    };
});
