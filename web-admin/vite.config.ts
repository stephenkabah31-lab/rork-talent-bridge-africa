import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_", "EXPO_PUBLIC_"]);
  const backendUrl = env.EXPO_PUBLIC_RORK_FUNCTIONS_URL || "https://hire-me-africa-backend.rork.app";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
    // Expose both VITE_* (Vite default) and EXPO_PUBLIC_* (Rork's cross-platform
    // public-env convention, written by tools like getOrCreateAuthConfig).
    envPrefix: ["VITE_", "EXPO_PUBLIC_"],
  };
});
