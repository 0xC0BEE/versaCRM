import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Theme, CustomTheme, ThemeContextType } from '../types';
import { hexToRgb } from '../utils/color';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

// Helper function to generate a monochromatic palette from a single base color.
const generateShades = (hex: string): Record<string, string> | null => {
    const base = hexToRgb(hex);
    if (!base) return null;

    const shades: Record<string, string> = {};
    const factors: Record<string, number> = {
        '50': 0.95, '100': 0.9, '200': 0.75, '300': 0.6, '400': 0.4,
        '500': 0, '600': -0.1, '700': -0.2, '800': -0.3, '900': -0.4, '950': -0.5
    };

    for (const [key, factor] of Object.entries(factors)) {
        let r, g, b;
        if (factor > 0) { // Mix with white
            r = Math.round(base.r + (255 - base.r) * factor);
            g = Math.round(base.g + (255 - base.g) * factor);
            b = Math.round(base.b + (255 - base.b) * factor);
        } else { // Mix with black
            r = Math.round(base.r * (1 + factor));
            g = Math.round(base.g * (1 + factor));
            b = Math.round(base.b * (1 + factor));
        }
        shades[key] = `${r} ${g} ${b}`;
    }
    return shades;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('theme', 'system');
    const [customThemes, setCustomThemes] = useLocalStorage<CustomTheme[]>('customThemes', []);
    const [activeCustomThemeId, setActiveCustomThemeId] = useLocalStorage<string | null>('activeCustomThemeId', null);

    // Apply standard light/dark theme
    useEffect(() => {
        if (activeCustomThemeId) return; // Don't apply standard theme if a custom one is active

        const root = window.document.documentElement;
        const isDark =
            storedTheme === 'dark' ||
            (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
    }, [storedTheme, activeCustomThemeId]);

    // Apply custom theme by injecting a style tag
    useEffect(() => {
        const styleId = 'custom-theme-styles';
        let styleTag = document.getElementById(styleId);

        if (activeCustomThemeId) {
            const theme = customThemes.find(t => t.id === activeCustomThemeId);
            if (theme) {
                if (!styleTag) {
                    styleTag = document.createElement('style');
                    styleTag.id = styleId;
                    document.head.appendChild(styleTag);
                }
                
                const primaryShades = generateShades(theme.colors.primary);
                const bgRgb = hexToRgb(theme.colors.background);
                const cardRgb = hexToRgb(theme.colors.card);
                const textRgb = hexToRgb(theme.colors.text);
                const borderRgb = hexToRgb(theme.colors.border);
                
                document.documentElement.classList.add('dark');
                
                if (primaryShades && bgRgb && cardRgb && textRgb && borderRgb) {
                     styleTag.innerHTML = `
                        :root {
                            ${Object.entries(primaryShades).map(([key, value]) => `--color-primary-${key}: ${value};`).join('\n')}
                            
                            --color-dark-bg: ${bgRgb.r} ${bgRgb.g} ${bgRgb.b};
                            --color-dark-card: ${cardRgb.r} ${cardRgb.g} ${cardRgb.b};
                            --color-dark-text: ${textRgb.r} ${textRgb.g} ${textRgb.b};
                            --color-dark-border: ${borderRgb.r} ${borderRgb.g} ${borderRgb.b};
                        }
                    `;
                }
            }
        } else {
            // If no custom theme, remove the style tag
            if (styleTag) {
                styleTag.remove();
            }
        }
    }, [activeCustomThemeId, customThemes]);


    const handleSetTheme = (newTheme: Theme) => {
        setStoredTheme(newTheme);
        setActiveCustomThemeId(null); // Deactivate custom theme when a standard one is chosen
    };
    
    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (storedTheme === 'system') {
                // This will re-trigger the main theme effect
                 setStoredTheme('system');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [storedTheme]);
    
    // Custom theme management
    const addCustomTheme = (theme: CustomTheme) => setCustomThemes(prev => [...prev, theme]);
    const updateCustomTheme = (theme: CustomTheme) => setCustomThemes(prev => prev.map(t => t.id === theme.id ? theme : t));
    const deleteCustomTheme = (themeId: string) => {
        if (activeCustomThemeId === themeId) setActiveCustomThemeId(null);
        setCustomThemes(prev => prev.filter(t => t.id !== themeId));
    };
    const applyCustomTheme = (themeId: string | null) => setActiveCustomThemeId(themeId);

    const value: ThemeContextType = useMemo(() => ({
        theme: storedTheme,
        setTheme: handleSetTheme,
        customThemes,
        activeCustomThemeId,
        addCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
        applyCustomTheme,
    }), [storedTheme, customThemes, activeCustomThemeId]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        {/* FIX: Corrected typo in closing tag from Theme-Context.Provider to ThemeContext.Provider */}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
