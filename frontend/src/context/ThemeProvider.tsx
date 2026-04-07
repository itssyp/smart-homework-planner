import { type ReactNode, useState, useCallback, useEffect, useMemo } from "react";
import { classicTheme } from "../themes/classicTheme";
import { darkTheme } from "../themes/darkTheme";
import { lightTheme } from "../themes/lightTheme";
import { ThemeContext } from "./ThemeContext";
import { ThemeProvider } from "@mui/material/styles";

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage, fallback to 'light' if not found
  const [theme, setTheme] = useState<'light' | 'dark' | 'classic'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark' | 'classic') || 'light';
  });

  // Function to update the theme (typically triggered from an auth change)
  const updateThemeFromAuth = useCallback((newTheme: 'light' | 'dark' | 'classic') => {
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
