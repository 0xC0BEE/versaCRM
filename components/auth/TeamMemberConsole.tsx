import React from 'react';
import Header from '../layout/Header';
import TeamMemberSidebar from '../layout/TeamMemberSidebar';
import { useApp } from '../../contexts/AppContext';
import { Page } from '../../types';

import DashboardPage from '../dashboard/DashboardPage';
import ContactsPage from '../organizations/ContactsPage';
import InteractionsPage from '../interactions/InteractionsPage';
import CalendarPage from '../calendar/CalendarPage';
import MyTasksPage from '../tasks/MyTasksPage';
import DealsPage from '../deals/DealsPage';

const PageRenderer: React.FC = () => {
    const { currentPage } = useApp();
    switch (currentPage) {
        case 'Dashboard': return <DashboardPage />;
        case 'Contacts': return <ContactsPage />;
        case 'Deals': return <DealsPage />;
        case 'Interactions': return <InteractionsPage />;
        case 'Calendar': return <CalendarPage />;
        case 'Tasks': return <MyTasksPage />;
        default: return <DashboardPage />;
    }
};

const TeamMemberConsole: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <TeamMemberSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                 <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <PageRenderer />
                </main>
            </div>
        </div>
    );
};

export default TeamMemberConsole;
