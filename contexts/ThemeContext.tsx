import React, { createContext, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
// FIX: Corrected import path for types.
import { Theme, CustomTheme, ThemeContextType } from '../types';
import { hexToRgb, shadeColor } from '../utils/color';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

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
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;

        if (activeCustomThemeId) {
            const theme = customThemes.find(t => t.id === activeCustomThemeId);
            if (theme) {
                if (!styleTag) {
                    styleTag = document.createElement('style');
                    styleTag.id = styleId;
                    document.head.appendChild(styleTag);
                }
                
                const bgRgb = hexToRgb(theme.colors.background);
                const cardRgb = hexToRgb(theme.colors.card);
                const textRgb = hexToRgb(theme.colors.text);
                const textHeadingRgb = hexToRgb(theme.colors.textHeading);
                const borderRgb = hexToRgb(theme.colors.border);
                const primaryRgb = hexToRgb(theme.colors.primary);

                if (!bgRgb || !cardRgb || !textRgb || !borderRgb || !primaryRgb || !textHeadingRgb) {
                    console.error("Invalid hex color found in custom theme:", theme);
                    if (styleTag) styleTag.remove(); // Clean up if colors are bad
                    return;
                }
                
                const primaryHoverRgb = hexToRgb(shadeColor(theme.colors.primary, -15));
                const primaryActiveRgb = hexToRgb(shadeColor(theme.colors.primary, -25));
                
                // Derive secondary text color by mixing text with background
                const textSecondaryR = Math.round(textRgb.r * 0.7 + bgRgb.r * 0.3);
                const textSecondaryG = Math.round(textRgb.g * 0.7 + bgRgb.g * 0.3);
                const textSecondaryB = Math.round(textRgb.b * 0.7 + bgRgb.b * 0.3);

                // Ensure custom themes are always applied over a dark base
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                
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
                        
                        /* Legacy variable for charts */
                        --color-accent-blue: ${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b};
                    }
                `;
            }
        } else {
            // If no custom theme, remove the style tag
            if (styleTag) {
                styleTag.remove();
            }
        }
    }, [activeCustomThemeId, customThemes]);

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
    }, [storedTheme, setStoredTheme]);

    // All functions provided by the context are wrapped in useCallback to ensure they have a stable identity.
    const setTheme = useCallback((newTheme: Theme) => {
        setStoredTheme(newTheme);
        setActiveCustomThemeId(null); // Deactivate custom theme when a standard one is chosen
    }, [setStoredTheme, setActiveCustomThemeId]);
    
    const addCustomTheme = useCallback((theme: CustomTheme) => setCustomThemes(prev => [...prev, theme]), [setCustomThemes]);
    
    const updateCustomTheme = useCallback((theme: CustomTheme) => setCustomThemes(prev => prev.map(t => t.id === theme.id ? theme : t)), [setCustomThemes]);
    
    const deleteCustomTheme = useCallback((themeId: string) => {
        setActiveCustomThemeId(currentId => (currentId === themeId ? null : currentId));
        setCustomThemes(prev => prev.filter(t => t.id !== themeId));
    }, [setActiveCustomThemeId, setCustomThemes]);
    
    const applyCustomTheme = useCallback((themeId: string | null) => setActiveCustomThemeId(themeId), [setActiveCustomThemeId]);

    // The value object is memoized and now includes the stable functions in its dependency array.
    const value: ThemeContextType = useMemo(() => ({
        theme: storedTheme,
        setTheme,
        customThemes,
        activeCustomThemeId,
        addCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
        applyCustomTheme,
    }), [storedTheme, setTheme, customThemes, activeCustomThemeId, addCustomTheme, updateCustomTheme, deleteCustomTheme, applyCustomTheme]);

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