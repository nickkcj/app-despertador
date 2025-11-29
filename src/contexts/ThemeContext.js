import React, { createContext, useState, useContext } from 'react';

const LIGHT_THEME = {
  dark: false,
  background: '#F5F5F5',
  card: '#FFFFFF',
  primary: '#6200EE',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  success: '#00C853',
  warning: '#D32F2F',
  inputBg: '#E8E8E8',
  border: '#E0E0E0',
};

const DARK_THEME = {
  dark: true,
  background: '#121212',
  card: '#1E1E1E',
  primary: '#BB86FC',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  success: '#03DAC6',
  warning: '#CF6679',
  inputBg: '#2C2C2C',
  border: '#333333',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(prev => !prev);

  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
