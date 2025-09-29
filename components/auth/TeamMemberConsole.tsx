import React from 'react';
import TeamMemberSidebar from '../layout/TeamMemberSidebar';
import Header from '../layout/Header';
import { useApp } from '../../contexts/AppContext';

// Import relevant page components for Team Member
import MyTasksPage from '../tasks/MyTasksPage';
import ContactsPage from '../organizations/ContactsPage';
import CalendarPage from '../calendar/CalendarPage';
import InteractionsPage from '../interactions/InteractionsPage';
import DashboardPage from '../dashboard/DashboardPage';


const TeamMemberConsole: React.FC = () => {
    const { currentPage } = useApp();

    const renderPage = () => {
        // FIX: All page strings now correctly match the extended Page type.
        switch (currentPage) {
            case 'My Tasks': return <MyTasksPage />;
            case 'Contacts': return <ContactsPage />;
            case 'Calendar': return <CalendarPage />;
            case 'Interactions': return <InteractionsPage />;
            case 'Dashboard': return <DashboardPage />;
            default: return <MyTasksPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <TeamMemberSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                {renderPage()}
            </div>
        </div>
    );
};

export default TeamMemberConsole;
