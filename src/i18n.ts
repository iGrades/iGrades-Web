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
import { translationsData } from "./locales/translationsData";

const savedLang = localStorage.getItem("appLanguage") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...translationEN, ...translationsData.en } },
    ha: { translation: { ...translationHA, ...translationsData.ha } },
    yo: { translation: { ...translationYO, ...translationsData.yo } },
    ig: { translation: { ...translationIG, ...translationsData.ig } },
    ak: { translation: { ...translationAK, ...translationsData.ak } },
    ff: { translation: { ...translationFF, ...translationsData.ff } },
    wo: { translation: { ...translationWO, ...translationsData.wo } },
    fr: { translation: { ...translationFR, ...translationsData.fr } },
    pt: { translation: { ...translationPT, ...translationsData.pt } }
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
