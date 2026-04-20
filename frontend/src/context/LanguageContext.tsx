import { createContext } from 'react';

type LanguageContextType = {
  language: 'en';
  setLanguage: (language: 'en') => void;
  updateLanguageFromAuth: (newLanguage: 'en') => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  updateLanguageFromAuth: () => {},
});







