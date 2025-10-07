import React, { useState } from 'react';
import TeamMemberSidebar from '../layout/TeamMemberSidebar';
import Header from '../layout/Header';
// FIX: Corrected import path for PageRenderer.
import PageRenderer from '../common/PageRenderer';

const TeamMemberConsole: React.FC = () => {
    // FIX: Add state for sidebar visibility.
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden bg-bg-primary text-text-primary">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
            
            {/* Mobile sidebar */}
            <div className={`fixed inset-y-0 left-0 flex z-40 lg:hidden transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="relative flex-1 flex flex-col max-w-xs w-full">
                    {/* FIX: Pass setIsOpen prop to Sidebar. */}
                    <TeamMemberSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                {/* FIX: Pass setIsOpen prop to Sidebar. */}
                <TeamMemberSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            </div>
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* FIX: Pass toggle function to Header. */}
                <Header toggleSidebar={() => setSidebarOpen(true)} />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <PageRenderer />
                </main>
            </div>
        </div>
    );
};

export default TeamMemberConsole;