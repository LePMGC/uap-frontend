// /var/www/html/uap-frontend/src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      sidebar: {
        system: "System",
        profile: "Profile",
        logout: "Logout",
        language: "Language",
      },
      languages: {
        en: "English",
        fr: "Français",
        es: "Español",
      },
    },
  },
  fr: {
    translation: {
      sidebar: {
        system: "Système",
        profile: "Profil",
        logout: "Déconnexion",
        language: "Langue",
      },
      languages: {
        en: "English",
        fr: "Français",
        es: "Español",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
