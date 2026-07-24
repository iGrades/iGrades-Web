import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en/translation.json";
import translationHA from "./locales/ha/translation.json";
import translationYO from "./locales/yo/translation.json";
import translationIG from "./locales/ig/translation.json";
import translationAK from "./locales/ak/translation.json";
import translationFF from "./locales/ff/translation.json";
import translationWO from "./locales/wo/translation.json";
import translationFR from "./locales/fr/translation.json";
import translationPT from "./locales/pt/translation.json";

const savedLang = localStorage.getItem("appLanguage") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    ha: { translation: translationHA },
    yo: { translation: translationYO },
    ig: { translation: translationIG },
    ak: { translation: translationAK },
    ff: { translation: translationFF },
    wo: { translation: translationWO },
    fr: { translation: translationFR },
    pt: { translation: translationPT }
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
