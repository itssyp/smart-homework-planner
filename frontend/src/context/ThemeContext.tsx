import { createContext } from 'react';

type ThemeContextType = {
  theme: 'light' | 'dark' | 'classic';
  setTheme: (theme: 'light' | 'dark' | 'classic') => void;
  updateThemeFromAuth: (newTheme: 'light' | 'dark' | 'classic') => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
