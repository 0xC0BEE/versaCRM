import React from 'react';
import { useApp } from '../../contexts/AppContext';
// FIX: Corrected import path for types.
import { Page } from '../../types';
import { BarChart2, Users, Mail, Calendar, CheckSquare, LucideIcon, Handshake, LifeBuoy } from 'lucide-react';

interface NavItem {
    page: Page;
    label: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { page: 'Dashboard', label: 'Dashboard', icon: BarChart2 },
    { page: 'Contacts', label: 'My Contacts', icon: Users },
    { page: 'Deals', label: 'Deals', icon: Handshake },
    { page: 'Tickets', label: 'Tickets', icon: LifeBuoy },
    { page: 'Interactions', label: 'Interactions', icon: Mail },
    { page: 'Calendar', label: 'Calendar', icon: Calendar },
    { page: 'Tasks', label: 'My Tasks', icon: CheckSquare },
];

const TeamMemberSidebar: React.FC = () => {
    const { currentPage, setCurrentPage } = useApp();

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-dark-card border-r dark:border-dark-border flex flex-col">
            <div className="h-16 flex-shrink-0 flex items-center justify-center px-4 border-b dark:border-dark-border">
                <h1 className="text-xl font-bold">VersaCRM</h1>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map(({ page, label, icon: Icon }) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === page
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Icon className="h-5 w-5 mr-3" />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default TeamMemberSidebar;