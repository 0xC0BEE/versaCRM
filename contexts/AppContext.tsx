import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
// FIX: Corrected import path for types.
import { AppContextType, Industry, Page, IndustryConfig, FilterCondition } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { industryConfigs as fallbackConfigs } from '../config/industryConfig';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const { authenticatedUser } = useAuth();
    const [currentPage, setCurrentPage] = useLocalStorage<Page>('page', 'Dashboard');
    const [currentIndustry, setCurrentIndustry] = useLocalStorage<Industry>('industry', 'Health');
    const [contactFilters, setContactFilters] = useState<FilterCondition[]>([]);
    
    // When the user logs out, reset the page to Dashboard.
    useEffect(() => {
        if (!authenticatedUser) {
            setCurrentPage('Dashboard');
        }
    }, [authenticatedUser, setCurrentPage]);

    const { data: industryConfig = fallbackConfigs[currentIndustry] } = useQuery<IndustryConfig>({
        queryKey: ['industryConfig', currentIndustry],
        queryFn: () => apiClient.getIndustryConfig(currentIndustry),
    });

    const value: AppContextType = useMemo(() => ({
        currentPage,
        setCurrentPage,
        currentIndustry,
        setCurrentIndustry,
        industryConfig,
        contactFilters,
        setContactFilters,
    }), [currentPage, setCurrentPage, currentIndustry, setCurrentIndustry, industryConfig, contactFilters, setContactFilters]);

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