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
      dedupe: ["react", "react-dom", "@chakra-ui/react", "@chakra-ui/charts", "@emotion/react", "framer-motion"],
    },
  };
});
