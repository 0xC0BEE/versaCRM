import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
// FIX: Corrected import path for types.
import { AppContextType, Industry, Page, IndustryConfig, FilterCondition, AnyContact } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected import path for apiClient from a file path to a relative module path.
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
    const [simulatedDate, setSimulatedDate] = useState(new Date());
    const [reportToEditId, setReportToEditId] = useState<string | null>(null);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callContact, setCallContact] = useState<AnyContact | null>(null);
    
    // When the user logs out, reset the page to Dashboard.
    useEffect(() => {
        if (!authenticatedUser) {
            setCurrentPage('Dashboard');
        }
    }, [authenticatedUser, setCurrentPage]);

    const { data } = useQuery<IndustryConfig | null>({
        queryKey: ['industryConfig', currentIndustry],
        queryFn: () => apiClient.getIndustryConfig(currentIndustry),
    });

    // If the API returns null (as it's designed to), or if data is loading (undefined),
    // we must ensure we fall back to our local configuration.
    const industryConfig = data || fallbackConfigs[currentIndustry];


    const value: AppContextType = useMemo(() => ({
        currentPage,
        setCurrentPage,
        currentIndustry,
        setCurrentIndustry,
        industryConfig,
        contactFilters,
        setContactFilters,
        simulatedDate,
        setSimulatedDate,
        reportToEditId,
        setReportToEditId,
        isCallModalOpen,
        setIsCallModalOpen,
        callContact,
        setCallContact,
    }), [currentPage, setCurrentPage, currentIndustry, setCurrentIndustry, industryConfig, contactFilters, setContactFilters, simulatedDate, setSimulatedDate, reportToEditId, setReportToEditId, isCallModalOpen, setIsCallModalOpen, callContact, setCallContact]);

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