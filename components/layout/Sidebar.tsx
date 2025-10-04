import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Page } from '../../types';
import { BarChart2, Users, Building2, Handshake, Mail, Calendar, CheckSquare, Package, FileText, Settings, Bot, LucideIcon, LifeBuoy } from 'lucide-react';

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
    { page: 'Tickets', label: 'Tickets', icon: LifeBuoy, permission: 'isOrgAdmin' },
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
        <aside className="w-64 flex-shrink-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border-r border-light-border/80 dark:border-dark-border/80 flex flex-col">
            <div className="h-20 flex-shrink-0 flex items-center justify-center px-4">
                <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">VersaCRM</h1>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredNavItems.map(({ page, label, icon: Icon }) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-lg group transition-all duration-200 ${
                            currentPage === page
                                ? 'bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-dark-card/50 hover:text-light-text dark:hover:text-dark-text'
                        }`}
                    >
                        <Icon className="h-5 w-5 mr-4 transition-transform group-hover:scale-110" />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;