import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/utils/index.ts",
  ],
  format: ["esm"],
  sourcemap: true,
  minify: false,
  target: "esnext",
  outDir: "dist",
  treeshake: true,
})
