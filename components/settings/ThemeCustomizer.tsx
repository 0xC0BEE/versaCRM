import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../types';

const ThemeCustomizer: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div>
            <h3 className="text-lg font-semibold">Theme Settings</h3>
            <p className="text-sm text-gray-500 mb-4">Choose your preferred interface theme.</p>
            <div className="flex space-x-4">
                {(['light', 'dark', 'system'] as Theme[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-4 py-2 rounded-md font-medium capitalize ${
                            theme === t ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
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
