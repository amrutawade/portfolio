import { defineConfig } from "vite";

// Relative base ("./") makes the build work on GitHub Pages regardless of the
// repository name (e.g. https://amrutawade.github.io/portfolio/) as well as at
// a custom domain root, without hardcoding the repo path.
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    outDir: "dist",
  },
});
