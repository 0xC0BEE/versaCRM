import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Page, Permission } from '../../types';
import { BarChart2, Building2, Calendar, Handshake, Home, Inbox, LifeBuoy, Mail, Megaphone, Package, Settings, Ticket, Users, UsersRound, Zap } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { currentPage, setCurrentPage, industryConfig } = useApp();
    const { hasPermission, authenticatedUser } = useAuth();

    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsOpen(false);
        }
    };

    const navItems: { page: Page; icon: React.ElementType; label?: string; permission?: Permission }[] = [
        { page: 'Dashboard', icon: Home },
        { page: 'Synced Email', icon: Mail, permission: 'contacts:read:all' },
        { page: 'Contacts', icon: Users, label: industryConfig.contactNamePlural }, // Permission is handled specially below
        { page: 'Team', icon: UsersRound, permission: 'settings:manage:team' },
        { page: 'Deals', icon: Handshake, permission: 'deals:read' },
        { page: 'Tickets', icon: LifeBuoy, permission: 'tickets:read' },
        { page: 'Interactions', icon: Inbox },
        { page: 'Organizations', icon: Building2 }, // Super Admin only logic is in PageRenderer
        { page: 'Calendar', icon: Calendar },
        { page: 'Tasks', icon: Ticket },
        { page: 'Inventory', icon: Package, permission: 'inventory:read' },
        { page: 'Campaigns', icon: Megaphone, permission: 'automations:manage' },
        { page: 'Workflows', icon: Zap, permission: 'automations:manage' },
        { page: 'Reports', icon: BarChart2, permission: 'reports:read' },
        { page: 'Settings', icon: Settings, permission: 'settings:access' },
    ];
    
    const roleName = authenticatedUser?.isClient ? 'Client' : 'User'; // Simplified for display

    return (
        <div className={`flex flex-col flex-shrink-0 w-64 bg-card-bg border-r border-border-subtle transition-all duration-300`}>
            <div className="h-16 flex items-center justify-center flex-shrink-0 px-4 shadow-sm">
                <h1 className="text-2xl font-bold text-text-primary">VersaCRM</h1>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Sidebar">
                <div className="p-2 space-y-1">
                    {navItems.map(item => {
                         // Organizations is a special case for Super Admins only
                        if (item.page === 'Organizations' && !MOCK_USERS.find(u => u.id === authenticatedUser?.id)?.email.includes('super')) {
                            return null;
                        }

                        let hasAccess = !item.permission || hasPermission(item.permission);
                        // Special handling for Contacts link to show if user has EITHER permission
                        if (item.page === 'Contacts') {
                            hasAccess = hasPermission('contacts:read:own') || hasPermission('contacts:read:all');
                        }

                        return hasAccess ? (
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
                    })}
                </div>
            </nav>
        </div>
    );
};

// Need to import MOCK_USERS to check for super admin email
// FIX: Corrected import path for mockData
import { MOCK_USERS } from '../../services/mockData';
export default Sidebar;