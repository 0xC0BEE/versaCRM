import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Page } from '../../types';
import { Calendar, Handshake, Home, Inbox, LifeBuoy, Ticket, Users } from 'lucide-react';

interface TeamMemberSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const TeamMemberSidebar: React.FC<TeamMemberSidebarProps> = ({ isOpen, setIsOpen }) => {
    const { currentPage, setCurrentPage, industryConfig } = useApp();

    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsOpen(false);
        }
    };

    const navItems: { page: Page; icon: React.ElementType; label?: string }[] = [
        { page: 'Dashboard', icon: Home },
        { page: 'Contacts', icon: Users, label: industryConfig.contactNamePlural },
        { page: 'Deals', icon: Handshake },
        { page: 'Tickets', icon: LifeBuoy },
        { page: 'Interactions', icon: Inbox },
        { page: 'Calendar', icon: Calendar },
        { page: 'Tasks', icon: Ticket },
    ];

    return (
        <div className="flex flex-col flex-shrink-0 w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border">
            <div className="h-16 flex items-center justify-center flex-shrink-0 px-4 shadow-sm">
                 <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">VersaCRM</h1>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Sidebar">
                <div className="p-2 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => handleNavigation(item.page)}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                                currentPage === item.page
                                    ? 'bg-accent-blue/10 text-accent-blue'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${currentPage === item.page ? 'text-accent-blue' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`} aria-hidden="true" />
                            {item.label || item.page}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default TeamMemberSidebar;
