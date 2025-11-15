import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", ".expo"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/types/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@api": resolve(__dirname, "packages/api/dist/index.d.ts"),
      "@api/*": resolve(__dirname, "packages/api/src/*"),
      "@conch/*": resolve(__dirname, "apps/conch/*"),
      "@admin/*": resolve(__dirname, "apps/admin/*"),
    },
  },
});

