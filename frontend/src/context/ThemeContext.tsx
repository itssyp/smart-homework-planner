import { createContext } from 'react';

export type AppTheme = 'light' | 'dark';

type ThemeContextType = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  updateThemeFromAuth: (newTheme: AppTheme) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
