import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Page, Permission } from '../../types';
import { Calendar, Handshake, Home, Inbox, LifeBuoy, Users, FileText, FolderKanban, MessageSquare, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const TeamMemberSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { currentPage, setCurrentPage, industryConfig } = useApp();
    const { hasPermission } = useAuth();
    const { unreadCount } = useNotifications();

    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsOpen(false);
        }
    };
    
    const navItems: { page: Page; icon: React.ElementType; label?: string; permission?: Permission }[] = [
        { page: 'Dashboard', icon: Home },
        { page: 'Inbox', icon: Inbox, permission: 'contacts:read:own' },
        { page: 'TeamChat', icon: MessageSquare, label: 'Team Chat', permission: 'contacts:read:own' },
        { page: 'Contacts', icon: Users, label: industryConfig.contactNamePlural, permission: 'contacts:read:own' },
        { page: 'Deals', icon: Handshake, permission: 'deals:read' },
        { page: 'Projects', icon: FolderKanban, permission: 'deals:read' },
        { page: 'Tickets', icon: LifeBuoy, permission: 'tickets:read' },
        { page: 'Documents', icon: FileText, permission: 'deals:read' },
        { page: 'Tasks', icon: Briefcase, permission: 'contacts:read:own' },
        { page: 'Calendar', icon: Calendar, permission: 'contacts:read:own' },
    ];

    return (
        <div className={`flex flex-col flex-shrink-0 w-64 h-full bg-card-bg border-r border-border-subtle transition-all duration-300`}>
            <div className="h-16 flex items-center justify-center flex-shrink-0 px-4 shadow-sm">
                <h1 className="text-2xl font-bold text-text-primary">VersaCRM</h1>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Sidebar">
                <div className="p-2 space-y-1">
                    {navItems.map(item => (
                        (!item.permission || hasPermission(item.permission)) && (
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
                                <span className="flex-1">{item.label || item.page}</span>
                                {item.page === 'Inbox' && unreadCount > 0 && (
                                     <span className="ml-auto inline-block py-0.5 px-2 text-xs font-semibold rounded-full bg-primary text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        )
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default TeamMemberSidebar;