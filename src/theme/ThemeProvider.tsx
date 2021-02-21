import React, { createContext, useEffect, useState, useContext } from 'react';
import { getInitialColorMode } from './BlockingSetInitialColorMode';

export enum Themes {
  AUTO = 'auto',
  DARK = 'dark',
  LIGHT = 'light',
}

const ThemeContext = createContext({
  setDarkMode: () => {},
  setLightMode: () => {},
  setAutoMode: () => {},
  themeName: Themes.AUTO,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState(Themes.AUTO);

  useEffect(function didMount() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', onThemeChange);

    const themePreference = window.localStorage.getItem('data-expo-theme');

    if (themePreference === Themes.LIGHT || themePreference === Themes.DARK) {
      setThemeName(themePreference);
    } else {
      setThemeName(Themes.AUTO);
    }

    return function unMount() {
      mediaQuery.removeEventListener('change', onThemeChange);
    };
  }, []);

  function setDocumentTheme(themeName: Themes) {
    if ([Themes.LIGHT, Themes.DARK].includes(themeName)) {
      document.documentElement.setAttribute('data-expo-theme', themeName);
    }
  }

  function onThemeChange(event: MediaQueryListEvent | MediaQueryList) {
    const themePreference = window.localStorage.getItem('data-expo-theme');

    if (!themePreference) {
      if (event.matches) {
        setDocumentTheme(Themes.DARK);
      } else {
        setDocumentTheme(Themes.LIGHT);
      }
    }
  }

  function setDarkMode() {
    (process as any).browser &&
      window.localStorage.setItem('data-expo-theme', Themes.DARK);
    setDocumentTheme(Themes.DARK);
    setThemeName(Themes.DARK);
  }

  function setLightMode() {
    (process as any).browser &&
      window.localStorage.setItem('data-expo-theme', Themes.LIGHT);
    setDocumentTheme(Themes.LIGHT);
    setThemeName(Themes.LIGHT);
  }

  function setAutoMode() {
    (process as any).browser &&
      window.localStorage.removeItem('data-expo-theme');

    const themeName = getInitialColorMode() as Themes;
    setDocumentTheme(themeName);
    setThemeName(Themes.AUTO);
  }

  return (
    <ThemeContext.Provider
      value={{
        setDarkMode,
        setLightMode,
        setAutoMode,
        themeName,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}