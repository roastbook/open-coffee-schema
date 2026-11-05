import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://schema.roastbook.coffee",
  outDir: "../dist",
  trailingSlash: "always",
  build: { format: "directory" },
  // lib/ and docs/ live outside site/; Vite may read them.
  vite: { server: { fs: { allow: [".."] } } },
});
