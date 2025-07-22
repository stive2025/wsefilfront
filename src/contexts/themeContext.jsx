/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Valor por defecto
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar el tema desde localStorage al montar el componente
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.warn('Error accessing localStorage for theme:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Aplicar el tema al documento y guardarlo en localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.warn('Error saving theme to localStorage:', error);
      }
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};