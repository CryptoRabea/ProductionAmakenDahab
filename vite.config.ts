import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite automatically exposes environment variables prefixed with VITE_
// No need to manually expose them through define
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
