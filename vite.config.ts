import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap') || id.includes('@gsap/')) return 'gsap';
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/motion')) return 'motion';
          if (id.includes('node_modules/lenis')) return 'lenis';
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
