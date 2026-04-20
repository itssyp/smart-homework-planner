import { type ReactNode, useState, useCallback, useEffect, useMemo } from "react";
import { classicTheme } from "../themes/classicTheme";
import { darkTheme } from "../themes/darkTheme";
import { lightTheme } from "../themes/lightTheme";
import { ThemeContext, type AppTheme } from "./ThemeContext";
import { ThemeProvider } from "@mui/material/styles";

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage, fallback to 'light' if not found
  const [theme, setTheme] = useState<AppTheme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'light';
  });

  // Function to update the theme (typically triggered from an auth change)
  const updateThemeFromAuth = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme);
  }, []);

  // Update localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, updateThemeFromAuth }), [theme, updateThemeFromAuth]);

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider
        theme={
          {
            light: lightTheme,
            dark: darkTheme,
            classic: classicTheme,
          }[theme]
        }
      >
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
