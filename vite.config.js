import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "src/index.html",
    },
  },
  plugins: [
    viteSingleFile(),
    viteStaticCopy({
      targets: [
        {
          src: "apps-script/*",
          dest: "./",
        },
      ],
    }),
  ],
});
