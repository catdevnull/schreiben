import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import svg from "@poppanator/sveltekit-svg";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    svg({
      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            // by default svgo removes the viewBox which prevents svg icons from scaling
            // not a good idea! https://github.com/svg/svgo/pull/1461
            params: { overrides: { removeViewBox: false } },
          },
        ],
      },
    }),
    // lo necesitamos para crypto.subtle para nanoid
    basicSsl(),
  ],
});
