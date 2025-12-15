import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Create a safe process.env object with only necessary keys
  // This prevents exposing sensitive system environment variables (like Path) which causes Vercel/Vite build errors
  const safeEnv = {
    API_KEY: env.API_KEY,
    NODE_ENV: mode,
    ...Object.fromEntries(
      Object.entries(env).filter(([key]) => key.startsWith('VITE_'))
    )
  };

  return {
    plugins: [react()],
    // Define global constants replacement
    define: {
      'process.env': JSON.stringify(safeEnv)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});