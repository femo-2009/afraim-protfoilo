import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    cloudflare({
      configPath: "./wrangler.jsonc",
      viteEnvironment: { name: "worker" },
    }),
    {
      name: "fix-worker-manifest",
      enforce: "post",
      closeBundle() {
        const serverDir = path.resolve(__dirname, "dist/server/assets");
        const workerDir = path.resolve(__dirname, "dist/worker/assets");
        if (!fs.existsSync(serverDir) || !fs.existsSync(workerDir)) return;

        const ssrManifest = fs.readdirSync(serverDir).find((f) =>
          f.startsWith("_tanstack-start-manifest")
        );
        const workerManifest = fs.readdirSync(workerDir).find((f) =>
          f.startsWith("_tanstack-start-manifest")
        );

        if (ssrManifest && workerManifest) {
          fs.copyFileSync(
            path.join(serverDir, ssrManifest),
            path.join(workerDir, workerManifest)
          );
          console.log(
            `\n✓ Replaced Worker dev manifest with SSR production manifest\n`
          );
        }
      },
    },
  ],
});
