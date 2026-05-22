import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { Theme, themes } from '../lib/theme';

export function ThemeToggle() {
  const { currentTheme, setTheme, toggleTheme } = useThemeStore();
  const themeOrder: Theme[] = ['light', 'dark-navy', 'pure-black'];

  return (
    <div className="relative group z-50">
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 rounded-full 
                 bg-surface hover:bg-surface/80 transition-all duration-300
                 border border-border
                 shadow-sm hover:shadow-md active:scale-95"
        aria-label="Toggle theme"
        title={`Current: ${themes[currentTheme].label}. Click to cycle themes`}
      >
        {currentTheme === 'light' && (
          <Sun className="w-5 h-5 text-text-primary" />
        )}
        {currentTheme === 'dark-navy' && (
          <Moon className="w-5 h-5 text-text-primary" />
        )}
        {currentTheme === 'pure-black' && (
          <Sparkles className="w-5 h-5 text-text-primary" />
        )}
      </button>
      
      {/* Theme selector dropdown */}
      <div className="absolute top-full right-0 mt-2 w-48 py-2 
                      bg-surface border border-border rounded-xl shadow-2xl
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-300 origin-top-right">
        {themeOrder.map((theme) => (
          <button
            key={theme}
            onClick={() => setTheme(theme)}
            className={`w-full px-4 py-3 flex items-center justify-between
                       hover:bg-text-secondary/10 transition-colors duration-200
                       ${currentTheme === theme ? 'bg-text-secondary/5' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-border" 
                   style={{ backgroundColor: themes[theme].background }} />
              <span className="text-text-primary font-medium text-sm">
                {themes[theme].label}
              </span>
            </div>
            {currentTheme === theme && (
              <div className="w-2 h-2 rounded-full bg-accent" />
            )}
          </button>
        ))}
        
        <div className="px-4 py-2 border-t border-border mt-2">
          <p className="text-xs text-text-muted">
            {themes[currentTheme].description}
          </p>
        </div>
      </div>
    </div>
  );
}
