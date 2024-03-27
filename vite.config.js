// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/extension.js"),
      formats: ["cjs"],
      // the proper extensions will be added
      fileName: "extension",
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      // external: ["vscode", "path", "fs", "esbuild", "./packer", "jsdom"],
    },
  },
  resolve: {
    alias: {
      "@modules": resolve(__dirname, "modules"),
    },
  },
});
