import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
    dedupe: ["react", "react-dom", "@chakra-ui/react", "@chakra-ui/charts", "@emotion/react", "framer-motion"],
  },
});
