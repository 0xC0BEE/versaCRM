import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Search, Bell, ChevronDown, LogOut, Sun, Moon, Monitor, FlaskConical, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import SmartSearchModal from '../search/SmartSearchModal';
import { useApp } from '../../contexts/AppContext';
// FIX: Import Button component
import Button from '../ui/Button';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { authenticatedUser, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const { currentEnvironment, setCurrentEnvironment } = useApp();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isSandbox = currentEnvironment !== 'production';

    return (
        <>
            <header className="relative z-10 flex-shrink-0 flex h-16 bg-card-bg shadow-sm border-b border-border-subtle">
                <button
                    type="button"
                    className="px-4 border-r border-border-subtle text-text-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
                    onClick={toggleSidebar}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 px-4 flex justify-between">
                    <div className="flex-1 flex items-center">
                        <div className="w-full max-w-lg">
                            <Button variant="secondary" onClick={() => setIsSearchOpen(true)} className="w-full justify-start text-text-secondary">
                                <Search className="h-5 w-5 mr-2" aria-hidden="true" />
                                <span className="hidden sm:inline">Search or ask AI...</span>
                                <span className="sm:hidden">Search...</span>
                            </Button>
                        </div>
                    </div>
                    <div className="ml-4 flex items-center md:ml-6 gap-2">
                        {isSandbox && (
                             <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500">
                                <FlaskConical size={14}/>
                                <span>Sandbox</span>
                            </div>
                        )}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                type="button"
                                className="p-2 rounded-full text-text-secondary hover:bg-hover-bg hover:text-text-primary"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            >
                                <span className="sr-only">View notifications</span>
                                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary flex items-center justify-center text-white text-[8px]">{unreadCount}</span>}
                                <Bell className="h-6 w-6" aria-hidden="true" />
                            </button>
                            {isNotificationsOpen && <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />}
                        </div>

                        {/* Profile dropdown */}
                        <div className="ml-3 relative" ref={userMenuRef}>
                            <div>
                                <button
                                    type="button"
                                    className="max-w-xs bg-card-bg flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    id="user-menu-button"
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
                                        <User size={20} className="text-slate-500" />
                                    </div>
                                    <ChevronDown size={16} className="ml-1 text-text-secondary" />
                                </button>
                            </div>

                            {isUserMenuOpen && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-card-bg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border-subtle"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu-button"
                                >
                                    <div className="px-4 py-2 border-b border-border-subtle">
                                        <p className="text-sm font-medium text-text-primary truncate">{authenticatedUser?.name}</p>
                                        <p className="text-xs text-text-secondary truncate">{authenticatedUser?.role}</p>
                                    </div>
                                    <div className="p-1">
                                         <button onClick={() => setCurrentEnvironment('production')} className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md ${currentEnvironment === 'production' ? 'bg-primary/10 text-primary' : 'hover:bg-hover-bg'}`}>
                                            <Monitor size={16} className="mr-2"/> Production
                                        </button>
                                         <button onClick={() => setCurrentEnvironment('sbx_1684860938139')} className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md ${currentEnvironment === 'sbx_1684860938139' ? 'bg-primary/10 text-primary' : 'hover:bg-hover-bg'}`}>
                                            <FlaskConical size={16} className="mr-2"/> Sandbox
                                        </button>
                                    </div>
                                    <div className="p-1 border-t border-border-subtle">
                                        <button onClick={() => setTheme('light')} className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md ${theme === 'light' ? 'bg-hover-bg' : 'hover:bg-hover-bg'}`}><Sun size={16} className="mr-2"/> Light</button>
                                        <button onClick={() => setTheme('dark')} className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md ${theme === 'dark' ? 'bg-hover-bg' : 'hover:bg-hover-bg'}`}><Moon size={16} className="mr-2"/> Dark</button>
                                        <button onClick={() => setTheme('system')} className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md ${theme === 'system' ? 'bg-hover-bg' : 'hover:bg-hover-bg'}`}><Monitor size={16} className="mr-2"/> System</button>
                                    </div>
                                    <div className="p-1 border-t border-border-subtle">
                                        <button onClick={logout} className="w-full text-left flex items-center px-3 py-2 text-sm rounded-md hover:bg-hover-bg text-error">
                                            <LogOut size={16} className="mr-2"/>
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <SmartSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;
