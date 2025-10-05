import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Page } from '../../types';
import { BarChart2, Building2, Calendar, Handshake, Home, Inbox, LifeBuoy, Megaphone, Package, Settings, Ticket, Users, Zap } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { currentPage, setCurrentPage, industryConfig } = useApp();
    const { permissions } = useAuth();

    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsOpen(false);
        }
    };

    const navItems: { page: Page; icon: React.ElementType; label?: string; permission?: keyof typeof permissions }[] = [
        { page: 'Dashboard', icon: Home },
        { page: 'Contacts', icon: Users, label: industryConfig.contactNamePlural },
        { page: 'Deals', icon: Handshake },
        { page: 'Tickets', icon: LifeBuoy },
        { page: 'Interactions', icon: Inbox },
        { page: 'Organizations', icon: Building2, permission: 'canViewOrganizations' },
        { page: 'Calendar', icon: Calendar },
        { page: 'Tasks', icon: Ticket },
        { page: 'Inventory', icon: Package },
        { page: 'Campaigns', icon: Megaphone },
        { page: 'Workflows', icon: Zap },
        { page: 'Reports', icon: BarChart2, permission: 'canViewAllReports' },
        { page: 'Settings', icon: Settings, permission: 'canAccessSettings' },
    ];

    return (
        <div className={`flex flex-col flex-shrink-0 w-64 bg-card-bg border-r border-border-subtle transition-all duration-300`}>
            <div className="h-16 flex items-center justify-center flex-shrink-0 px-4 shadow-sm">
                <h1 className="text-2xl font-bold text-text-primary">VersaCRM</h1>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Sidebar">
                <div className="p-2 space-y-1">
                    {navItems.map(item =>
                        !item.permission || (permissions && permissions[item.permission]) ? (
                            <button
                                key={item.page}
                                onClick={() => handleNavigation(item.page)}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                                    currentPage === item.page
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-hover-bg'
                                }`}
                            >
                                <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${currentPage === item.page ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`} aria-hidden="true" />
                                {item.label || item.page}
                            </button>
                        ) : null
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;