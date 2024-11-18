import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths for assets
  build: {
    outDir: 'dist', // Default output directory
  
  },
});

