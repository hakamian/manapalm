
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');
    
    return {
      // Use the repo name for production base (GitHub Pages), but root for dev (localhost)
      base: mode === 'production' ? '/nakhlestan-ma-na---grove-of-meaning/' : '/',
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
        chunkSizeWarningLimit: 1600, // Increased limit to suppress warnings for large AI libs
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ai-vendor': ['@google/genai'],
              'pdf-vendor': ['pdfjs-dist', 'jspdf'],
              'db-vendor': ['@supabase/supabase-js'],
              'ui-vendor': ['react-markdown', 'remark-gfm']
            }
          }
        }
      }
    };
});
