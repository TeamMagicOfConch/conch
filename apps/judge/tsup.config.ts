import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["netlify/functions/judge.ts"],
  format: ["cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "netlify/functions",
  external: ["@netlify/functions"],
  noExternal: [/^@toon-format/],
  esbuildOptions(options) {
    options.bundle = true;
    options.platform = "node";
    options.target = "node20";
  },
});

