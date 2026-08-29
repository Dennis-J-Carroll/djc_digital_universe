import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: "convergence.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "convergence[extname]",
      },
    },
  },
});
