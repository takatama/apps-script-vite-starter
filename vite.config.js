import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
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
