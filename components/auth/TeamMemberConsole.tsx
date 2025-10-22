import React, { useState, useEffect } from 'react';
import TeamMemberSidebar from '../layout/TeamMemberSidebar';
import Header from '../layout/Header';
import PageRenderer from '../common/PageRenderer';
import { useApp } from '../../contexts/AppContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import GuidedTour from '../tour/GuidedTour';
import { HelpCircle, X } from 'lucide-react';
import Button from '../ui/Button';

const TeamMemberConsole: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { startTour, isFeatureEnabled } = useApp();
    const [tourCompleted, setTourCompleted] = useLocalStorage('tourCompleted_team', false);
    const [showTourPrompt, setShowTourPrompt] = useState(!tourCompleted && isFeatureEnabled('guidedTours'));

    const handleStartTour = () => {
        setShowTourPrompt(false);
        startTour('team');
    };

    const handleDismissPrompt = () => {
        setShowTourPrompt(false);
        setTourCompleted(true);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-bg-primary text-text-primary">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
            
            {/* Mobile sidebar */}
            <div className={`fixed inset-y-0 left-0 flex z-40 lg:hidden transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="relative flex-1 flex flex-col max-w-xs w-full">
                    <TeamMemberSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <TeamMemberSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            </div>
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(true)} />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                     {showTourPrompt && (
                        <div className="absolute top-4 right-4 z-20 bg-primary/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg w-80 animate-fade-in-up">
                            <button onClick={handleDismissPrompt} className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20"><X size={16}/></button>
                            <div className="flex items-start gap-3">
                                <HelpCircle size={20} className="mt-1"/>
                                <div>
                                    <h4 className="font-bold">Welcome!</h4>
                                    <p className="text-sm mt-1">Let's take a quick tour of your workspace.</p>
                                    <Button size="sm" className="mt-3 bg-white text-primary hover:bg-gray-200" onClick={handleStartTour}>Start Tour</Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <PageRenderer />
                </main>
            </div>
             <GuidedTour tourKey="tourCompleted_team" />
        </div>
    );
};

export default TeamMemberConsole;