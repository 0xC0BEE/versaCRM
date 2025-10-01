import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Search, Bell, LogOut } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import SmartSearchModal from '../search/SmartSearchModal';

const Header: React.FC = () => {
    const { authenticatedUser, logout } = useAuth();
    const { currentPage } = useApp();
    const { unreadCount } = useNotifications();
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            <header className="h-16 flex-shrink-0 bg-white dark:bg-dark-card border-b dark:border-dark-border flex items-center justify-between px-6">
                <div className="flex items-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{currentPage}</h2>
                </div>

                <div className="flex-1 flex justify-center px-8">
                     <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center w-full max-w-xs p-2 text-sm text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label="Open smart search (Ctrl+K)"
                    >
                        <Search size={18} className="mr-2 text-gray-400" />
                        <span className="flex-grow text-left">Smart Search...</span>
                        <kbd className="ml-2 text-xs font-sans font-semibold text-gray-400 border dark:border-gray-600 rounded px-1.5 py-0.5">Ctrl K</kbd>
                    </button>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="relative">
                         <button
                            onClick={() => setIsNotificationsOpen(prev => !prev)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Open notifications"
                        >
                            <Bell size={20} />
                             {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-card"></span>
                            )}
                        </button>
                        {isNotificationsOpen && <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />}
                    </div>

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold">{authenticatedUser?.name}</p>
                            <p className="text-xs text-gray-500">{authenticatedUser?.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Logout"
                        >
                            <LogOut size={20} className="text-red-500" />
                        </button>
                    </div>
                </div>
            </header>
            <SmartSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;