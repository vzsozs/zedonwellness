import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(fileURLToPath(new URL(".", import.meta.url)), "./src") },
  },
  test: {
    environment: "node",
    // Only the pure logic modules — no DB, no React rendering. These are the
    // functions where a silent mistake is expensive (prices, shipping bands,
    // CSV round-trips) and where a test needs no infrastructure to be useful.
    include: ["src/**/*.test.ts"],
  },
});
