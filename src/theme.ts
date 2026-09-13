// theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    "html, body": {
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "'Lexend', 'Plus Jakarta Sans', sans-serif",
    },
    "button, input, optgroup, select, textarea": {
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
  },
  theme: {
    tokens: {
      colors: {
        primaryColor: { value: "#206CE1" },
        on_primaryColor: { value: "#FFFFFF" },
        secondaryColor: { value: "#F18729" },
        on_secondaryColor: { value: "#FFFFFF" },
        accentColor: { value: "#00A8E6" },
        backgrondColor: { value: "#FFFFFF" },
        backgrondColor2: { value: "#07052A" },
        on_backgroundColor: { value: "#242E3E" },
        on_containerColor: { value: "#474256" },
        successColor: { value: "#2DD4A5" },
        errorColor: { value: "#E43F40" },
        textFieldColor: { value: "#F9F9FB" },
        fieldTextColor: { value: "#BDBDBD" },
        orangeOthers: { value: "#FA9232" },
        cyanOthers: { value: "#018BEF" },
        purpleOthers: { value: "#AE3DD6" },
        greenOthers: { value: "#1FBA79" },
        faithYellow: { value: "#FFF9F3" },
        lightYellow: { value: "#FEEECC" },
        lightGrey: { value: "#EBEBF7" },
        mediumGrey: { value: "#464646" },
        greyOthers: { value: "#525071" },
        faintYellow: { value: "#FFF9F3" },
        slate: {
          50: { value: "#F8FAFC" },
          100: { value: "#F1F5F9" },
          200: { value: "#E2E8F0" },
          300: { value: "#CBD5E1" },
          400: { value: "#94A3B8" },
          500: { value: "#64748B" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1E293B" },
          900: { value: "#0F172A" },
          950: { value: "#020617" },
        },
        amber: {
          50: { value: "#FFFBEB" },
          100: { value: "#FEF3C7" },
          200: { value: "#FDE68A" },
          300: { value: "#FCD34D" },
          400: { value: "#FBBF24" },
          500: { value: "#F59E0B" },
          600: { value: "#D97706" },
          700: { value: "#B45309" },
          800: { value: "#92400E" },
          900: { value: "#78350F" },
        },
        emerald: {
          50: { value: "#ECFDF5" },
          100: { value: "#D1FAE5" },
          200: { value: "#A7F3D0" },
          300: { value: "#6EE7B7" },
          400: { value: "#34D399" },
          500: { value: "#10B981" },
          600: { value: "#059669" },
          700: { value: "#047857" },
          800: { value: "#065F46" },
          900: { value: "#064E3B" },
        },
        rose: {
          50: { value: "#FFF1F2" },
          100: { value: "#FFE4E6" },
          200: { value: "#FECDD3" },
          300: { value: "#FDA4AF" },
          400: { value: "#FB7185" },
          500: { value: "#F43F5E" },
          600: { value: "#E11D48" },
          700: { value: "#BE123C" },
          800: { value: "#9F1239" },
          900: { value: "#881337" },
        },
      },
      cursor: {
        button: { value: "pointer" },
      },
      fonts: {
        body: { value: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
        heading: { value: "'Lexend', 'Plus Jakarta Sans', sans-serif" },
      },
      animations: {
        shakeX: { value: "shakeX 1s ease-in-out infinite" },
      },
    },
    keyframes: {
      shakeX: {
        "0%, 100%": { transform: "translateX(-100%)" },
        "50%": { transform: "translateX(100%)" },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);
export default system;