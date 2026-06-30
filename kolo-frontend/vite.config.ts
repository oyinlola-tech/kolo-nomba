import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Ensure SPA fallback for all routes in dev
  appType: 'spa',

  // File types to support raw imports.
  assetsInclude: ['**/*.svg'],

  build: {
    // Output to dist (standard for deployment)
    outDir: 'dist',
    // Generate sourcemaps only for non-production builds
    sourcemap: process.env.NODE_ENV !== 'production',
    // Enable chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
        },
      },
    },
  },
})
