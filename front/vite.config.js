import { defineConfig } from "vite";

export default defineConfig({
  // Uncomment to use JSX:
  // esbuild: {
  //   jsx: "transform",
  //   jsxFactory: "m",
  //   jsxFragment: "'['",
  // },
  base: process.env.IS_DEV !== "true" ? "./" : "/",
  build: {
    minify: false,
    outDir: "../dist",
  },
});
