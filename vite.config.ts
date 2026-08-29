import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/fjernvarme-card.ts",
      name: "FjernvarmeCard",
      formats: ["es"],
      fileName: () => "ha-fjernvarme-card.js"
    },
    outDir: ".",
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
