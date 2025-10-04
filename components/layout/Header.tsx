import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import SmartSearchModal from '../search/SmartSearchModal';

interface HeaderProps {
    toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { authenticatedUser, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-light-card dark:bg-dark-card shadow-sm border-b border-light-border dark:border-dark-border">
                <button
                    type="button"
                    className="px-4 border-r border-light-border dark:border-dark-border text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                    onClick={toggleSidebar}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 px-4 flex justify-between">
                    <div className="flex-1 flex">
                        <div className="w-full flex md:ml-0">
                            <label htmlFor="search-field" className="sr-only">Search</label>
                            <div className="relative w-full text-slate-400 focus-within:text-slate-600">
                                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" aria-hidden="true">
                                    <Search className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <input
                                    id="search-field"
                                    name="search-field"
                                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-light-text dark:text-dark-text placeholder-slate-500 bg-transparent focus:outline-none focus:placeholder-slate-400 focus:ring-0 focus:border-transparent sm:text-sm"
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
                                className="p-1 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                onClick={() => setIsNotificationsOpen(prev => !prev)}
                            >
                                <span className="sr-only">View notifications</span>
                                <Bell className="h-6 w-6" aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-light-card dark:ring-dark-card" />
                                )}
                            </button>
                            {isNotificationsOpen && <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />}
                        </div>

                        {/* Profile dropdown */}
                        <div className="ml-3 relative">
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-light-text dark:text-dark-text">{authenticatedUser?.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{authenticatedUser?.role}</p>
                                </div>
                                <button onClick={logout} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Logout">
                                    <LogOut size={20} className="text-red-500" />
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
