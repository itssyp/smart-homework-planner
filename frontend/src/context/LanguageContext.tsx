import { createContext } from 'react';

type LanguageContextType = {
  language: 'en' | 'hu' | 'ro';
  setLanguage: (language: 'en' | 'hu' | 'ro') => void;
  updateLanguageFromAuth: (newLanguage: 'en' | 'hu' | 'ro') => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  updateLanguageFromAuth: () => {},
});







