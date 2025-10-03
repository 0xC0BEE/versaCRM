import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Search, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
// FIX: Corrected import path for NotificationsPanel.
import NotificationsPanel from './NotificationsPanel';
import SmartSearchModal from '../search/SmartSearchModal';

const Header: React.FC = () => {
    const { authenticatedUser, logout } = useAuth();
    const { currentPage } = useApp();
    const { unreadCount } = useNotifications();
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
             if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
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
                    <div className="relative" ref={notificationsRef}>
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

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(prev => !prev)}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <div className="text-right">
                                <p className="text-sm font-semibold">{authenticatedUser?.name}</p>
                                <p className="text-xs text-gray-500">{authenticatedUser?.role}</p>
                            </div>
                            <ChevronDown size={16} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-dark-border z-20 py-1">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <SmartSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;