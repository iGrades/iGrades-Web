import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
     exclude: ["onnxruntime-web"],
   },
  server: {
    host: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
