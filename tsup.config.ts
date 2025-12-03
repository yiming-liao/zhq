import path from "node:path";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["export/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    outDir: "dist",
    treeshake: true,
    clean: true,
    esbuildOptions(options) {
      options.alias = { "@": path.resolve(__dirname, "src") };
    },
  },
]);
