import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { AppContextType, Industry, Page, IndustryConfig, FilterCondition, AnyContact, Sandbox } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// FIX: Changed to default import for apiClient.
import apiClient from '../services/apiClient';
import { industryConfigs as fallbackConfigs } from '../config/industryConfig';
import { useData } from './DataContext';
import { featureFlags as defaultFlags } from '../config/featureFlags';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const { authenticatedUser } = useAuth();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useLocalStorage<Page>('page', 'Dashboard');
    const [currentIndustry, setCurrentIndustry] = useLocalStorage<Industry>('industry', 'Health');
    const [currentEnvironment, _setCurrentEnvironment] = useLocalStorage<string>('currentEnvironment', 'production');
    const [contactFilters, setContactFilters] = useState<FilterCondition[]>([]);
    const [simulatedDate, setSimulatedDate] = useState(new Date());
    const [reportToEditId, setReportToEditId] = useState<string | null>(null);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callContact, setCallContact] = useState<AnyContact | null>(null);
    const [initialKbArticleId, setInitialKbArticleId] = useState<string | null>(null);
    const [currentCustomObjectDefId, setCurrentCustomObjectDefId] = useState<string | null>(null);
    const [isLiveCopilotOpen, setIsLiveCopilotOpen] = useState(false);
    
    const { organizationSettingsQuery } = useData();
    const { data: orgSettings } = organizationSettingsQuery;

    const { data: sandboxes = [] } = useQuery<Sandbox[]>({
        queryKey: ['sandboxes', authenticatedUser?.organizationId],
        queryFn: () => apiClient.getSandboxes(authenticatedUser!.organizationId),
        enabled: !!authenticatedUser,
    });
    
    // When the user logs out, reset the page to Dashboard and environment to production.
    useEffect(() => {
        if (!authenticatedUser) {
            setCurrentPage('Dashboard');
            _setCurrentEnvironment('production');
        }
    }, [authenticatedUser, setCurrentPage, _setCurrentEnvironment]);

    const setCurrentEnvironment = useCallback((env: string) => {
        _setCurrentEnvironment(env);
        queryClient.invalidateQueries();
    }, [_setCurrentEnvironment, queryClient]);

    const { data } = useQuery<IndustryConfig | null>({
        queryKey: ['industryConfig', currentIndustry],
        queryFn: () => apiClient.getIndustryConfig(currentIndustry),
    });

    const industryConfig = data || fallbackConfigs[currentIndustry];
    
    const isFeatureEnabled = useCallback((flagId: string): boolean => {
        // Default to the flag's default state
        const defaultState = defaultFlags.find(f => f.id === flagId)?.isEnabled || false;
        // Org settings override the default
        return orgSettings?.featureFlags?.[flagId] ?? defaultState;
    }, [orgSettings]);


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
        initialKbArticleId,
        setInitialKbArticleId,
        currentCustomObjectDefId,
        setCurrentCustomObjectDefId,
        currentEnvironment,
        setCurrentEnvironment,
        sandboxes: sandboxes || [],
        isFeatureEnabled,
        isLiveCopilotOpen,
        setIsLiveCopilotOpen,
    }), [
        currentPage, setCurrentPage, currentIndustry, setCurrentIndustry, industryConfig, 
        contactFilters, setContactFilters, simulatedDate, setSimulatedDate, reportToEditId, 
        setReportToEditId, isCallModalOpen, setIsCallModalOpen, callContact, setCallContact, 
        initialKbArticleId, setInitialKbArticleId, currentCustomObjectDefId, 
        setCurrentCustomObjectDefId, currentEnvironment, setCurrentEnvironment, sandboxes, isFeatureEnabled,
        isLiveCopilotOpen, setIsLiveCopilotOpen
    ]);

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