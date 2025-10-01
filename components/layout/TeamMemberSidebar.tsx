import React from 'react';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Corrected the import path for types to be a valid relative path.
import { Page } from '../../types';
import { BarChart2, Users, MessageSquare, Calendar, CheckSquare, LifeBuoy } from 'lucide-react';

// FIX: Added 'My Tasks' and 'Interactions' to the icon map.
const icons: Partial<Record<Page, React.ReactNode>> = {
    Dashboard: <BarChart2 size={20} />,
    'My Tasks': <CheckSquare size={20} />,
    Contacts: <Users size={20} />,
    Interactions: <MessageSquare size={20} />,
    Calendar: <Calendar size={20} />,
};

const TeamMemberSidebar: React.FC = () => {
    // FIX: Correctly destructured properties from context hooks.
    const { currentPage, setCurrentPage, industryConfig } = useApp();
    const { permissions } = useAuth();
    
    // FIX: Ensured all nav items are of type Page.
    const navItems: Page[] = ['My Tasks', 'Dashboard', 'Contacts', 'Interactions', 'Calendar'];
    
    const getPageName = (page: Page) => {
        if (page === 'Contacts') return industryConfig.contactNamePlural;
        return page;
    }

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-dark-card border-r dark:border-dark-border flex flex-col">
            <div className="h-16 flex items-center justify-center border-b dark:border-dark-border">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">VersaCRM</h1>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map(page => permissions?.[page]?.view && (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                            currentPage === page
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-white'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        {icons[page]}
                        <span className="ml-3">{getPageName(page)}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t dark:border-dark-border">
                <button
                    className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                >
                    <LifeBuoy size={20} />
                    <span className="ml-3">Support</span>
                </button>
            </div>
        </aside>
    );
};

export default TeamMemberSidebar;