import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { Page, Industry, IndustryConfig, FilterCondition, FeatureFlag, TourStep, UserAction, AiTip } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { industryConfigs } from '../config/industryConfig';
import { featureFlags as defaultFlags } from '../config/featureFlags';
import { AnyContact } from '../types';
import { adminTourSteps, teamTourSteps } from '../config/tourConfig';
import { GoogleGenAI, Type } from '@google/genai';

interface AppContextType {
    // Page navigation
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    initialRecordLink: { page: Page; recordId?: string } | null;
    setInitialRecordLink: (link: { page: Page; recordId?: string } | null) => void;

    // Industry config
    currentIndustry: Industry;
    setCurrentIndustry: (industry: Industry) => void;
    industryConfig: IndustryConfig;

    // Custom Objects
    currentCustomObjectDefId: string | null;
    setCurrentCustomObjectDefId: (id: string | null) => void;

    // Filters
    contactFilters: FilterCondition[];
    setContactFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>;

    // Dashboard
    dashboardDateRange: { start: Date; end: Date };
    setDashboardDateRange: React.Dispatch<React.SetStateAction<{ start: Date; end: Date }>>;
    currentDashboardId: string;
    setCurrentDashboardId: (id: string) => void;
    
    // Modals & Interaction
    isCallModalOpen: boolean;
    setIsCallModalOpen: (isOpen: boolean) => void;
    callContact: AnyContact | null;
    setCallContact: (contact: AnyContact | null) => void;
    isLiveCopilotOpen: boolean;
    setIsLiveCopilotOpen: (isOpen: boolean) => void;

    // Reports
    reportToEditId: string | null;
    setReportToEditId: (id: string | null) => void;
    
    // Feature Flags & Environment
    isFeatureEnabled: (featureId: string) => boolean;
    currentEnvironment: string;
    setCurrentEnvironment: (env: string) => void;
    simulatedDate: Date;
    setSimulatedDate: (date: Date) => void;
    
    // FIX: Add properties for deep-linking to KB articles
    initialKbArticleId: string | null;
    setInitialKbArticleId: (id: string | null) => void;

    // Sidebar State
    openSections: Record<string, boolean>;
    setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

    // Guided Tour
    isTourOpen: boolean;
    startTour: (tourType: 'admin' | 'team') => void;
    closeTour: () => void;
    tourStep: number;
    setTourStep: (step: number) => void;
    tourConfig: TourStep[] | null;
    openSidebarSection: (section: string) => void;

    // AI Tips Engine
    actionsLog: UserAction[];
    logUserAction: (type: string, payload: any) => void;
    activeAiTip: AiTip | null;
    setActiveAiTip: React.Dispatch<React.SetStateAction<AiTip | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useLocalStorage<Page>('page', 'Dashboard');
    const [currentIndustry, setCurrentIndustry] = useLocalStorage<Industry>('industry', 'Health');
    const [contactFilters, setContactFilters] = useLocalStorage<FilterCondition[]>('contact-filters', []);
    const [dashboardDateRange, setDashboardDateRange] = useState(() => ({ 
        start: new Date(new Date().setDate(new Date().getDate() - 30)), 
        end: new Date() 
    }));
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callContact, setCallContact] = useState<AnyContact | null>(null);
    const [isLiveCopilotOpen, setIsLiveCopilotOpen] = useState(false);
    const [currentCustomObjectDefId, setCurrentCustomObjectDefId] = useLocalStorage<string | null>('current-custom-object-def-id', null);
    const [reportToEditId, setReportToEditId] = useState<string | null>(null);
    const [currentEnvironment, setCurrentEnvironment] = useLocalStorage<string>('currentEnvironment', 'production');
    
    const [simulatedDateString, setSimulatedDateString] = useLocalStorage('simulatedDate', new Date().toISOString());

    const [currentDashboardId, setCurrentDashboardId] = useLocalStorage<string>('current-dashboard-id', 'dash_default');
    const [initialRecordLink, setInitialRecordLink] = useState<{ page: Page; recordId?: string } | null>(null);
    const [initialKbArticleId, setInitialKbArticleId] = useState<string | null>(null);

    // Sidebar State
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({ Core: true }));

    // Guided Tour State
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [tourConfig, setTourConfig] = useState<TourStep[] | null>(null);

    // AI Tips Engine State
    const [actionsLog, setActionsLog] = useLocalStorage<UserAction[]>('user-actions-log', []);
    const [activeAiTip, setActiveAiTip] = useLocalStorage<AiTip | null>('active-ai-tip', null);

    const logUserAction = useCallback((type: string, payload: any) => {
        const newAction: UserAction = { type, payload, timestamp: new Date().toISOString() };
        // Keep the log from getting too big
        setActionsLog(prev => [newAction, ...prev.slice(0, 19)]);
    }, [setActionsLog]);

    const industryConfig = useMemo(() => industryConfigs[currentIndustry] || industryConfigs.Generic, [currentIndustry]);
    
    const featureFlags = useMemo(() => {
        const storedSettings = localStorage.getItem('organizationSettings');
        if (storedSettings) {
            try {
                const settings = JSON.parse(storedSettings);
                return settings.featureFlags || {};
            } catch (e) {
                return {};
            }
        }
        return {};
    }, []);

    const isFeatureEnabled = useCallback((featureId: string) => {
        const defaultFlag = defaultFlags.find(f => f.id === featureId);
        return featureFlags[featureId] ?? defaultFlag?.isEnabled ?? false;
    }, [featureFlags]);
    
    const startTour = useCallback((tourType: 'admin' | 'team') => {
        const config = tourType === 'admin' ? adminTourSteps : teamTourSteps;
        setTourConfig(config);
        setTourStep(0);
        
        const firstStep = config[0];
        if (firstStep.page) {
            setCurrentPage(firstStep.page);
        }
        if (firstStep.openSection) {
            setOpenSections(prev => ({ ...prev, [firstStep.openSection!]: true }));
        }

        setIsTourOpen(true);
    }, [setCurrentPage, setOpenSections]);

    const closeTour = useCallback(() => {
        setIsTourOpen(false);
        setTourConfig(null);
        setTourStep(0);
    }, []);
    
    const openSidebarSection = useCallback((section: string) => {
        setOpenSections(prev => ({...prev, [section]: true }));
    }, [setOpenSections]);

    const handleSetCurrentIndustry = useCallback((industry: Industry) => {
        setCurrentIndustry(industry);
    }, [setCurrentIndustry]);
    
    const handleSetCurrentEnvironment = useCallback((env: string) => {
        setCurrentEnvironment(env);
        window.location.reload(); // Reload is still needed for sandbox environment switching
    }, [setCurrentEnvironment]);

    const memoizedSimulatedDate = useMemo(() => new Date(simulatedDateString), [simulatedDateString]);
    const setSimulatedDate = useCallback((date: Date) => {
        setSimulatedDateString(date.toISOString());
    }, [setSimulatedDateString]);

    const value: AppContextType = useMemo(() => ({
        currentPage,
        setCurrentPage,
        currentIndustry,
        setCurrentIndustry: handleSetCurrentIndustry,
        industryConfig,
        contactFilters,
        setContactFilters,
        dashboardDateRange,
        setDashboardDateRange,
        isCallModalOpen,
        setIsCallModalOpen,
        callContact,
        setCallContact,
        isLiveCopilotOpen,
        setIsLiveCopilotOpen,
        currentCustomObjectDefId,
        setCurrentCustomObjectDefId,
        reportToEditId,
        setReportToEditId,
        isFeatureEnabled,
        currentEnvironment,
        setCurrentEnvironment: handleSetCurrentEnvironment,
        simulatedDate: memoizedSimulatedDate,
        setSimulatedDate,
        currentDashboardId,
        setCurrentDashboardId,
        initialRecordLink,
        setInitialRecordLink,
        initialKbArticleId,
        setInitialKbArticleId,
        // Sidebar
        openSections,
        setOpenSections,
        // Guided Tour
        isTourOpen,
        startTour,
        closeTour,
        tourStep,
        setTourStep,
        tourConfig,
        openSidebarSection,
        // AI Tips
        actionsLog,
        logUserAction,
        activeAiTip,
        setActiveAiTip,
    // FIX: Removed stable state setters from the useMemo dependency array. React guarantees that state setter functions have a stable identity and do not need to be included in dependency arrays. Their inclusion was causing a build error.
    }), [
        currentPage,
        currentIndustry,
        handleSetCurrentIndustry,
        industryConfig,
        contactFilters,
        dashboardDateRange,
        isCallModalOpen,
        callContact,
        isLiveCopilotOpen,
        currentCustomObjectDefId,
        reportToEditId,
        isFeatureEnabled,
        currentEnvironment,
        handleSetCurrentEnvironment,
        memoizedSimulatedDate,
        setSimulatedDate,
        currentDashboardId,
        initialRecordLink,
        initialKbArticleId,
        openSections,
        isTourOpen,
        startTour,
        closeTour,
        tourStep,
        tourConfig,
        openSidebarSection,
        actionsLog,
        logUserAction,
        activeAiTip,
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