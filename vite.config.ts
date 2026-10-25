import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const getEnv = (key: string) =>
    process.env[key] || env[key] || process.env[`VITE_${key}`] || env[`VITE_${key}`] || "";

  return {
    plugins: [react(), tsconfigPaths()],
    envPrefix: ["VITE_", "SUPABASE_", "ENC_", "HCAPTCHA_", "FLUTTERWAVE_"],
    define: {
      "import.meta.env.SUPABASE_URL": JSON.stringify(getEnv("SUPABASE_URL")),
      "import.meta.env.SUPABASE_ANON_KEY": JSON.stringify(getEnv("SUPABASE_ANON_KEY")),
      "import.meta.env.ENC_KEY": JSON.stringify(getEnv("ENC_KEY")),
      "import.meta.env.HCAPTCHA_SITE_KEY": JSON.stringify(getEnv("HCAPTCHA_SITE_KEY")),
      "import.meta.env.FLUTTERWAVE_PUBLIC_KEY": JSON.stringify(getEnv("FLUTTERWAVE_PUBLIC_KEY")),
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
      dedupe: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@chakra-ui/react",
        "@chakra-ui/charts",
        "@emotion/react",
        "framer-motion",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-router-dom",
        "react-markdown",
        "remark-gfm",
        "remark-math",
        "rehype-katex",
        "katex",
        "@chakra-ui/react",
        "react-icons/io5",
        "react-icons/pi",
        "zustand",
      ],
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("pdfjs-dist") || id.includes("jspdf")) {
                return "vendor-pdf";
              }
              if (
                id.includes("katex") ||
                id.includes("rehype-katex") ||
                id.includes("remark-math") ||
                id.includes("remark-gfm")
              ) {
                return "vendor-math";
              }
              if (
                id.includes("recharts") ||
                id.includes("@chakra-ui/charts") ||
                id.includes("d3-")
              ) {
                return "vendor-charts";
              }
              if (id.includes("@supabase")) {
                return "vendor-supabase";
              }
              if (
                id.includes("@chakra-ui") ||
                id.includes("@emotion") ||
                id.includes("framer-motion")
              ) {
                return "vendor-ui";
              }
              if (id.includes("react-icons")) {
                return "vendor-icons";
              }
            }
          },
        },
      },
    },
  };
});
