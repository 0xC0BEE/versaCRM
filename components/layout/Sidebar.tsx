import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Page } from '../../types';
import { BarChart2, Users, Building2, Handshake, Mail, Calendar, CheckSquare, Package, FileText, Settings, Bot, LucideIcon } from 'lucide-react';

interface NavItem {
    page: Page;
    label: string;
    icon: LucideIcon;
    permission?: 'isSuperAdmin' | 'isOrgAdmin';
}

const navItems: NavItem[] = [
    { page: 'Dashboard', label: 'Dashboard', icon: BarChart2 },
    { page: 'Contacts', label: 'Contacts', icon: Users, permission: 'isOrgAdmin' },
    { page: 'Deals', label: 'Deals', icon: Handshake, permission: 'isOrgAdmin' },
    { page: 'Organizations', label: 'Organizations', icon: Building2, permission: 'isSuperAdmin' },
    { page: 'Interactions', label: 'Interactions', icon: Mail },
    { page: 'Calendar', label: 'Calendar', icon: Calendar },
    { page: 'Tasks', label: 'Tasks', icon: CheckSquare },
    { page: 'Inventory', label: 'Inventory', icon: Package, permission: 'isOrgAdmin' },
    { page: 'Campaigns', label: 'Campaigns', icon: Bot, permission: 'isOrgAdmin' },
    { page: 'Workflows', label: 'Workflows', icon: Bot, permission: 'isOrgAdmin' },
    { page: 'Reports', label: 'Reports', icon: FileText, permission: 'isOrgAdmin' },
    { page: 'Settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
    const { currentPage, setCurrentPage } = useApp();
    const { authenticatedUser } = useAuth();
    const isSuperAdmin = authenticatedUser?.role === 'Super Admin';
    const isOrgAdmin = authenticatedUser?.role === 'Organization Admin';

    const filteredNavItems = navItems.filter(item => {
        if (!item.permission) return true;
        if (item.permission === 'isSuperAdmin' && isSuperAdmin) return true;
        if (item.permission === 'isOrgAdmin' && (isSuperAdmin || isOrgAdmin)) return true;
        return false;
    });

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-dark-card border-r dark:border-dark-border flex flex-col">
            <div className="h-16 flex-shrink-0 flex items-center justify-center px-4 border-b dark:border-dark-border">
                <h1 className="text-xl font-bold">VersaCRM</h1>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredNavItems.map(({ page, label, icon: Icon }) => (
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

export default Sidebar;
