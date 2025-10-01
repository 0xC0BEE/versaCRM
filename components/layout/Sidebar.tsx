import React from 'react';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Corrected the import path for types to be a valid relative path.
import { Page } from '../../types';
import { 
    BarChart2, 
    Users, 
    MessageSquare, 
    Calendar, 
    CheckSquare, 
    LifeBuoy,
    Building,
    ShoppingBag,
    FileText,
    Bot,
    Users2,
    Settings
} from 'lucide-react';

// FIX: Created the complete Sidebar component.
const icons: Partial<Record<Page, React.ReactNode>> = {
    Dashboard: <BarChart2 size={20} />,
    Organizations: <Building size={20} />,
    Contacts: <Users size={20} />,
    Interactions: <MessageSquare size={20} />,
    Calendar: <Calendar size={20} />,
    Inventory: <ShoppingBag size={20} />,
    Reports: <FileText size={20} />,
    Workflows: <Bot size={20} />,
    Team: <Users2 size={20} />,
    Settings: <Settings size={20} />,
    'My Tasks': <CheckSquare size={20} />,
};

const Sidebar: React.FC = () => {
    const { currentPage, setCurrentPage, industryConfig } = useApp();
    const { authenticatedUser, permissions } = useAuth();
    
    const navItems: Page[] = [
        'Dashboard', 
        'My Tasks',
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
    
    const getPageName = (page: Page) => {
        if (page === 'Contacts') return industryConfig.contactNamePlural;
        if (page === 'Organizations' && authenticatedUser?.role !== 'Super Admin') return null; // Org Admins don't see this
        return page;
    }

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-dark-card border-r dark:border-dark-border flex flex-col">
            <div className="h-16 flex items-center justify-center border-b dark:border-dark-border">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">VersaCRM</h1>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map(page => {
                    const pageName = getPageName(page);
                    if (!pageName || !permissions?.[page]?.view) {
                        return null;
                    }
                    return (
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
                            <span className="ml-3">{pageName}</span>
                        </button>
                    )
                })}
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

export default Sidebar;