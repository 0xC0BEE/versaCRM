import React from 'react';
import ThemeCustomizer from './ThemeCustomizer';
import ThemeBuilder from './ThemeBuilder';

const AppearanceSettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <ThemeCustomizer />
            <div className="border-t border-border-subtle pt-8">
                <ThemeBuilder />
            </div>
        </div>
    );
};

export default AppearanceSettings;
