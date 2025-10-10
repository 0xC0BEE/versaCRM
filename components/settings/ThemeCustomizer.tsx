
import React from 'react';
// FIX: Corrected import path for useTheme.
import { useTheme } from '../../contexts/ThemeContext';
// FIX: Corrected the import path for types to be a valid relative path.
import { Theme } from '../../types';

const ThemeCustomizer: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div>
            <h3 className="text-lg font-semibold">Theme Settings</h3>
            <p className="text-sm text-text-secondary mb-4">Choose your preferred interface theme.</p>
            <div className="flex space-x-4">
                {(['light', 'dark', 'system'] as Theme[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-4 py-2 rounded-button font-medium capitalize transition-colors ${
                            theme === t 
                                ? 'bg-primary text-white' 
                                : 'bg-card-bg text-text-primary border border-border-subtle hover:bg-hover-bg'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeCustomizer;