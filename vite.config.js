import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { copyManifest } from "./vite/copy-manifest.js";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    copyManifest(),
    tailwindcss()
  ],
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      input: {
        background: resolve("apps/background/background.ts"),
        side_panel: resolve("apps/side_panel/index.html")
      },
      output: {
        entryFileNames: "apps/[name]/[name].min.js",
        format: "es"
      }
    }
  },
  publicDir: false
});
