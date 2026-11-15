import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/appStore';

export const colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    primary: '#3B82F6',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    primary: '#3B82F6',
    border: '#334155',
    error: '#EF4444',
    success: '#10B981',
  },
};

type ThemeContextType = {
  theme: 'light' | 'dark';
  colors: typeof colors.light;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useAppStore();
  const systemTheme = useColorScheme();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const themeColors = colors[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors: themeColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
