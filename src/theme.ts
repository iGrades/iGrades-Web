// theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
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
      },
      cursor: {
        button: { value: "pointer" },
      },
      fonts: {
        body: { value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
        heading: { value: "'Space Grotesk Variable', sans-serif;" },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);
export default system;