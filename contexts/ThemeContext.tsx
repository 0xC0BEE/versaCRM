import React, { createContext, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Theme, CustomTheme, ThemeContextType } from '../types';
import { hexToRgb, shadeColor } from '../utils/color';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useLocalStorage<Theme>('theme', 'system');
    const [customThemes, setCustomThemes] = useLocalStorage<CustomTheme[]>('customThemes', []);
    const [activeCustomThemeId, setActiveCustomThemeId] = useLocalStorage<string | null>('activeCustomThemeId', null);

    useEffect(() => {
        const root = window.document.documentElement;
        const styleId = 'custom-theme-styles';
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
        
        // Always clean up previous custom styles
        if (styleTag) {
            styleTag.remove();
        }

        // 1. Handle custom themes first, as they override everything.
        if (activeCustomThemeId) {
            const customTheme = customThemes.find(t => t.id === activeCustomThemeId);
            if (customTheme) {
                styleTag = document.createElement('style');
                styleTag.id = styleId;
                document.head.appendChild(styleTag);
                
                const bgRgb = hexToRgb(customTheme.colors.background);
                const cardRgb = hexToRgb(customTheme.colors.card);
                const textRgb = hexToRgb(customTheme.colors.text);
                const textHeadingRgb = hexToRgb(customTheme.colors.textHeading);
                const borderRgb = hexToRgb(customTheme.colors.border);
                const primaryRgb = hexToRgb(customTheme.colors.primary);

                if (bgRgb && cardRgb && textRgb && borderRgb && primaryRgb && textHeadingRgb) {
                    const primaryHoverRgb = hexToRgb(shadeColor(customTheme.colors.primary, -15));
                    const primaryActiveRgb = hexToRgb(shadeColor(customTheme.colors.primary, -25));
                    
                    const textSecondaryR = Math.round(textRgb.r * 0.7 + bgRgb.r * 0.3);
                    const textSecondaryG = Math.round(textRgb.g * 0.7 + bgRgb.g * 0.3);
                    const textSecondaryB = Math.round(textRgb.b * 0.7 + bgRgb.b * 0.3);
                    
                    root.classList.add('dark'); // Custom themes are always dark-based
                    
                    styleTag.innerHTML = `
                        .dark {
                            --bg-primary: ${bgRgb.r} ${bgRgb.g} ${bgRgb.b};
                            --card-bg: ${cardRgb.r} ${cardRgb.g} ${cardRgb.b};
                            --text-primary: ${textRgb.r} ${textRgb.g} ${textRgb.b};
                            --text-heading: ${textHeadingRgb.r} ${textHeadingRgb.g} ${textHeadingRgb.b};
                            --text-secondary: ${textSecondaryR} ${textSecondaryG} ${textSecondaryB};
                            --border-subtle: ${borderRgb.r} ${borderRgb.g} ${borderRgb.b};
                            --hover-bg: ${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b};
                            --primary: ${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b};
                            --primary-hover: ${primaryHoverRgb!.r} ${primaryHoverRgb!.g} ${primaryHoverRgb!.b};
                            --primary-active: ${primaryActiveRgb!.r} ${primaryActiveRgb!.g} ${primaryActiveRgb!.b};
                            --color-accent-blue: ${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b};
                        }
                    `;
                }
                // Early exit: if a custom theme is active, we don't need to handle standard themes.
                return;
            }
        }

        // 2. Handle standard themes (light, dark, system).
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyStandardTheme = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            root.classList.toggle('dark', isDark);
        };

        applyStandardTheme(); // Apply on initial render and when theme or custom theme ID changes.

        // 3. Set up listener for system changes.
        const handleSystemThemeChange = () => {
            if (theme === 'system') {
                applyStandardTheme();
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);

        // 4. Cleanup listener on unmount or when dependencies change.
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [theme, customThemes, activeCustomThemeId]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        setActiveCustomThemeId(null); // Deactivate any custom theme when a standard one is chosen
    }, [setThemeState, setActiveCustomThemeId]);
    
    const applyCustomTheme = useCallback((themeId: string | null) => {
        setActiveCustomThemeId(themeId);
    }, [setActiveCustomThemeId]);

    const addCustomTheme = useCallback((newTheme: CustomTheme) => setCustomThemes(prev => [...prev, newTheme]), [setCustomThemes]);
    
    const updateCustomTheme = useCallback((updatedTheme: CustomTheme) => setCustomThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t)), [setCustomThemes]);
    
    const deleteCustomTheme = useCallback((themeId: string) => {
        if (activeCustomThemeId === themeId) {
            applyCustomTheme(null);
        }
        setCustomThemes(prev => prev.filter(t => t.id !== themeId));
    }, [setCustomThemes, activeCustomThemeId, applyCustomTheme]);

    const value: ThemeContextType = useMemo(() => ({
        theme,
        setTheme,
        customThemes,
        activeCustomThemeId,
        addCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
        applyCustomTheme,
    }), [theme, setTheme, customThemes, activeCustomThemeId, addCustomTheme, updateCustomTheme, deleteCustomTheme, applyCustomTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
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
