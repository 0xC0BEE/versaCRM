import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import SmartSearchModal from '../search/SmartSearchModal';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';

interface HeaderProps {
    toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { authenticatedUser, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const { rolesQuery } = useData();
    const { data: roles = [] } = rolesQuery;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const roleName = roles.find((r: any) => r.id === authenticatedUser?.roleId)?.name || (authenticatedUser?.isClient ? 'Client' : '');

    return (
        <>
            <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card-bg shadow-sm border-b border-border-subtle">
                <button
                    type="button"
                    className="px-4 border-r border-border-subtle text-text-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
                    onClick={toggleSidebar}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 px-4 flex justify-between">
                    <div className="flex-1 flex">
                        <div className="w-full flex md:ml-0">
                            <label htmlFor="search-field" className="sr-only">Search</label>
                            <div className="relative w-full text-text-secondary focus-within:text-text-primary">
                                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" aria-hidden="true">
                                    <Search className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <input
                                    id="search-field"
                                    name="search-field"
                                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-text-primary placeholder-text-secondary bg-transparent focus:outline-none focus:placeholder-slate-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                    placeholder="Smart Search..."
                                    type="search"
                                    onClick={() => setIsSearchOpen(true)}
                                    readOnly // The modal handles the input
                                />
                            </div>
                        </div>
                    </div>
                    <div className="ml-4 flex items-center md:ml-6">
                        <div className="relative">
                            <button
                                type="button"
                                className="p-1 rounded-full text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                onClick={() => setIsNotificationsOpen(prev => !prev)}
                            >
                                <span className="sr-only">View notifications</span>
                                <Bell className="h-6 w-6" aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-card-bg" />
                                )}
                            </button>
                            {isNotificationsOpen && <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />}
                        </div>

                        {/* Profile dropdown */}
                        <div className="ml-3 relative">
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-text-primary">{authenticatedUser?.name}</p>
                                    <p className="text-xs text-text-secondary">{roleName}</p>
                                </div>
                                <button onClick={logout} className="p-2 rounded-full hover:bg-hover-bg" aria-label="Logout">
                                    <LogOut size={20} className="text-error" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <SmartSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;
