import { defineConfig } from "tsup"

export default defineConfig({
  format: ["cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  outDir: "./netlify/functions",
  external: ["@netlify/functions"],
  noExternal: [/^@toon-format/],
  platform: "node",
  target: "node20",
  bundle: true,
})

