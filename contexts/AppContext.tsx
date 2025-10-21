import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { Page, Industry, IndustryConfig, FilterCondition, FeatureFlag, TourStep, UserAction, AiTip } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { industryConfigs } from '../config/industryConfig';
import { featureFlags as defaultFlags } from '../config/featureFlags';
import { AnyContact } from '../types';

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
    setSimulatedDate: React.Dispatch<React.SetStateAction<Date>>;
    
    // FIX: Add properties for deep-linking to KB articles
    initialKbArticleId: string | null;
    setInitialKbArticleId: (id: string | null) => void;

    // Guided Tour
    isTourOpen: boolean;
    startTour: (tour: TourStep[]) => void;
    closeTour: () => void;
    tourStep: number;
    setTourStep: React.Dispatch<React.SetStateAction<number>>;
    tourConfig: TourStep[] | null;
    openSidebarSection: (sectionName: string) => void;
    openSections: Record<string, boolean>;
    setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

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
    const [dashboardDateRange, setDashboardDateRange] = useState({ start: new Date(new Date().setDate(new Date().getDate() - 30)), end: new Date() });
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callContact, setCallContact] = useState<AnyContact | null>(null);
    const [isLiveCopilotOpen, setIsLiveCopilotOpen] = useState(false);
    const [currentCustomObjectDefId, setCurrentCustomObjectDefId] = useLocalStorage<string | null>('current-custom-object-def-id', null);
    const [reportToEditId, setReportToEditId] = useState<string | null>(null);
    const [currentEnvironment, setCurrentEnvironment] = useLocalStorage<string>('currentEnvironment', 'production');
    const [simulatedDate, setSimulatedDate] = useLocalStorage('simulatedDate', new Date());
    const [currentDashboardId, setCurrentDashboardId] = useLocalStorage<string>('current-dashboard-id', 'dash_default');
    const [initialRecordLink, setInitialRecordLink] = useState<{ page: Page; recordId?: string } | null>(null);
    const [initialKbArticleId, setInitialKbArticleId] = useState<string | null>(null);

    // Guided Tour & Sidebar State
    const [tourConfig, setTourConfig] = useState<TourStep[] | null>(null);
    const [tourStep, setTourStep] = useState(0);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ Core: true });
    const isTourOpen = useMemo(() => tourConfig !== null, [tourConfig]);

    // AI Tips Engine State
    const [actionsLog, setActionsLog] = useLocalStorage<UserAction[]>('user-actions-log', []);
    const [activeAiTip, setActiveAiTip] = useLocalStorage<AiTip | null>('active-ai-tip', null);

    const logUserAction = useCallback((type: string, payload: any) => {
        const newAction: UserAction = { type, payload, timestamp: new Date().toISOString() };
        // Keep the log from getting too big
        setActionsLog(prev => [newAction, ...prev.slice(0, 19)]);
    }, [setActionsLog]);

    const startTour = useCallback((tour: TourStep[]) => {
        setTourConfig(tour);
        setTourStep(0);
        // The first step of any tour should always define a page.
        if (tour[0]?.page) {
            setCurrentPage(tour[0].page);
        }
    }, [setCurrentPage]);

    const closeTour = useCallback(() => {
        setTourConfig(null);
        setTourStep(0);
    }, []);
    
    const openSidebarSection = useCallback((sectionName: string) => {
        setOpenSections(prev => ({ ...prev, [sectionName]: true }));
    }, []);


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

    const handleSetCurrentIndustry = (industry: Industry) => {
        setCurrentIndustry(industry);
        window.location.reload();
    }
    
    const handleSetCurrentEnvironment = (env: string) => {
        setCurrentEnvironment(env);
        window.location.reload();
    }


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
        simulatedDate: new Date(simulatedDate),
        setSimulatedDate: setSimulatedDate as any,
        currentDashboardId,
        setCurrentDashboardId,
        initialRecordLink,
        setInitialRecordLink,
        initialKbArticleId,
        setInitialKbArticleId,
        // Tour & Sidebar
        isTourOpen,
        startTour,
        closeTour,
        tourStep,
        setTourStep,
        tourConfig,
        openSidebarSection,
        openSections,
        setOpenSections,
        // AI Tips
        actionsLog,
        logUserAction,
        activeAiTip,
        setActiveAiTip,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        currentPage, setCurrentPage, currentIndustry, industryConfig, 
        contactFilters, setContactFilters, dashboardDateRange, 
        isCallModalOpen, callContact, isLiveCopilotOpen, 
        currentCustomObjectDefId, reportToEditId, isFeatureEnabled,
        currentEnvironment, simulatedDate, currentDashboardId,
        initialRecordLink, initialKbArticleId,
        isTourOpen, startTour, closeTour, tourStep, tourConfig, openSidebarSection, openSections,
        actionsLog, logUserAction, activeAiTip, setActiveAiTip
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