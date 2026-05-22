import { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme, getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  useEffect(() => {
    const root = document.documentElement;
    
    // Helper to flatten and set properties
    const setProperties = (obj: any, prefix: string = '--color') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`${prefix}-${key}`, value);
        } else if (typeof value === 'object' && value !== null) {
          setProperties(value, `${prefix}-${key}`);
        }
      });
    };

    setProperties(colors);
    
    // Set data-theme attribute for potential CSS selectors
    root.setAttribute('data-theme', currentTheme);
    
    // Force background color on body to prevent white flashes
    document.body.style.backgroundColor = colors.background;
    
  }, [currentTheme, colors]);

  return <>{children}</>;
}
