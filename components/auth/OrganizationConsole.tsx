import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import PageRenderer from '../common/PageRenderer';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingWizard from '../onboarding/OnboardingWizard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useApp } from '../../contexts/AppContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { adminTourSteps } from '../../config/tourConfig';
import GuidedTour from '../tour/GuidedTour';

const OrganizationConsole: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { organizationsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { startTour } = useApp();
    const [tourCompleted, setTourCompleted] = useLocalStorage('tourCompleted_admin', false);
    
    const { data: organizations = [], isLoading: orgsLoading } = organizationsQuery;

    const currentOrg = useMemo(() => {
        return organizations.find((o: any) => o.id === authenticatedUser?.organizationId);
    }, [organizations, authenticatedUser]);

    useEffect(() => {
        // Start tour on first load after setup is complete
        if (currentOrg?.isSetupComplete && !tourCompleted) {
            // Use a timeout to ensure the UI has rendered
            setTimeout(() => startTour(adminTourSteps), 1000);
        }
    }, [currentOrg?.isSetupComplete, tourCompleted, startTour]);

    if (orgsLoading) {
        return <div className="h-screen w-screen flex items-center justify-center"><LoadingSpinner /></div>
    }

    if (currentOrg && !currentOrg.isSetupComplete) {
        return <OnboardingWizard organization={currentOrg} />;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-bg-primary text-text-primary">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
            
            {/* Mobile sidebar */}
            <div className={`fixed inset-y-0 left-0 flex z-40 lg:hidden transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="relative flex-1 flex flex-col max-w-xs w-full">
                    <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            </div>
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(true)} />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <PageRenderer />
                    <GuidedTour tourKey="tourCompleted_admin" />
                </main>
            </div>
        </div>
    );
};

export default OrganizationConsole;