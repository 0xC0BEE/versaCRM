import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Page } from '../../types';
import { BarChart2, Building, Users, Settings, MessageSquare, Calendar as CalendarIcon, Archive, FileText, Bot, Shield } from 'lucide-react';

const icons: Partial<Record<Page, React.ReactNode>> = {
    Dashboard: <BarChart2 size={20} />,
    Organizations: <Building size={20} />,
    Contacts: <Users size={20} />,
    Interactions: <MessageSquare size={20} />,
    Calendar: <CalendarIcon size={20} />,
    Inventory: <Archive size={20} />,
    Reports: <FileText size={20} />,
    Workflows: <Bot size={20} />,
    Team: <Shield size={20} />,
    Settings: <Settings size={20} />,
};

const Sidebar: React.FC = () => {
    const { currentPage, setCurrentPage } = useApp();
    const { permissions } = useAuth();
    
    const navItems: Page[] = [
        'Dashboard',
        'Organizations',
        'Contacts',
        'Interactions',
        'Calendar',
        'Inventory',
        'Reports',
        'Workflows',
        'Team',
        'Settings'
    ];

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
                        <span className="ml-3">{page}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;