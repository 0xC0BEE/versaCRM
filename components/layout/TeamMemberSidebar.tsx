import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Page } from '../../types';
import { Calendar, Handshake, Home, Inbox, LifeBuoy, Ticket, Users } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const TeamMemberSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { currentPage, setCurrentPage, industryConfig } = useApp();

    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsOpen(false);
        }
    };
    
    // A simplified list of navigation items for Team Members
    const navItems: { page: Page; icon: React.ElementType; label?: string; }[] = [
        { page: 'Dashboard', icon: Home },
        { page: 'Contacts', icon: Users, label: industryConfig.contactNamePlural },
        { page: 'Deals', icon: Handshake },
        { page: 'Tickets', icon: LifeBuoy },
        { page: 'Interactions', icon: Inbox },
        { page: 'Calendar', icon: Calendar },
        { page: 'Tasks', icon: Ticket },
    ];

    return (
        <div className={`flex flex-col flex-shrink-0 w-64 bg-card-bg border-r border-border-subtle transition-all duration-300`}>
            <div className="h-16 flex items-center justify-center flex-shrink-0 px-4 shadow-sm">
                <h1 className="text-2xl font-bold text-text-primary">VersaCRM</h1>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Sidebar">
                <div className="p-2 space-y-1">
                    {navItems.map(item => (
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
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default TeamMemberSidebar;
