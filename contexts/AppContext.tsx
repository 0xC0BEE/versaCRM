import React, { createContext, useState, ReactNode, useContext, useMemo } from 'react';
// FIX: Added IndustryConfig to import.
import { AppContextType, Industry, Page, IndustryConfig } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
// FIX: Imported industryConfigs to derive the current config.
import { industryConfigs } from '../config/industryConfig';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [currentIndustry, setCurrentIndustry] = useLocalStorage<Industry>('industry', 'Generic');
    const [currentPage, setCurrentPage] = useLocalStorage<Page>('page', 'Dashboard');

    // FIX: Derive and provide the full industryConfig object.
    const industryConfig = useMemo(
        () => industryConfigs[currentIndustry] || industryConfigs.Generic,
        [currentIndustry]
    );

    const value: AppContextType = {
        currentIndustry,
        setCurrentIndustry,
        currentPage,
        setCurrentPage,
        industryConfig,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
