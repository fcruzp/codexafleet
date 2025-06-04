import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@headlessui/react', 'lucide-react', 'clsx', 'tailwind-merge'],
          'vendor-state': ['zustand', 'react-hook-form'],
          'vendor-utils': ['date-fns', 'uuid'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
          'vendor-notifications': ['react-hot-toast']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});
