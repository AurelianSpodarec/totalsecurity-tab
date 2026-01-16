import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { copyManifest } from "./vite/copy-manifest.js";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tsconfigPaths(), // Include tsconfig alias paths
    react(), // Add support for tsx/jsx files
    copyManifest(), // Copy across manifest.json and set version to package.json version
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
  publicDir: false // Disable automatic public directory copying
});
