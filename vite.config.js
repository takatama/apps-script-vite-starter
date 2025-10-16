import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: resolve(__dirname, "src/index.html"),
    },
  },
  plugins: [
    viteSingleFile(),
    viteStaticCopy({
      targets: [
        {
          src: "../apps-script/*",
          dest: "./",
        },
      ],
    }),
  ],
});
