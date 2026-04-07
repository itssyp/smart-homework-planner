import React, { type ReactNode, useState, useCallback, useEffect } from "react";
import { LanguageContext } from "./LanguageContext";
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadLanguageResources = (language: 'en' | 'hu' | 'ro') => {
  switch (language) {
    default:
      return import('../locales/en.json');
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
});


export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'hu' | 'ro'>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as 'en' | 'hu' | 'ro') || 'en';
  });

  const updateLanguageFromAuth = useCallback((newLanguage: 'en' | 'hu' | 'ro') => {
    setLanguage(newLanguage);
  }, []);

  useEffect(() => {
    if (language) {
      loadLanguageResources(language).then((resources) => {
        i18n.addResourceBundle(language, 'translation', resources, true, true);
        i18n.changeLanguage(language);
      });

      localStorage.setItem('language', language);
    }
  }, [language]);

  const value = React.useMemo(
    () => ({ language, setLanguage, updateLanguageFromAuth }),
    [language, updateLanguageFromAuth],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}