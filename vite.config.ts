import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",
  appType: "spa",
  server: {
    port: 80,
  }
});
