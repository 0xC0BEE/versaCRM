import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Menu, Search, ChevronsUpDown, Check, FlaskConical, Mic } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import SmartSearchModal from '../search/SmartSearchModal';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';

interface HeaderProps {
    toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { authenticatedUser, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const { rolesQuery } = useData();
    const { sandboxes, currentEnvironment, setCurrentEnvironment, setIsLiveCopilotOpen } = useApp();
    const { data: roles = [] } = rolesQuery;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isEnvSwitcherOpen, setIsEnvSwitcherOpen] = useState(false);

    const roleName = roles.find((r: any) => r.id === authenticatedUser?.roleId)?.name || (authenticatedUser?.isClient ? 'Client' : '');
    const isSandbox = currentEnvironment !== 'production';

    const environments = [
        { id: 'production', name: 'Production' },
        ...sandboxes,
    ];

    const handleEnvChange = (envId: string) => {
        if (envId !== currentEnvironment) {
            setCurrentEnvironment(envId);
        }
        setIsEnvSwitcherOpen(false);
    };

    return (
        <>
            {isSandbox && (
                <div className="bg-yellow-400 text-yellow-900 text-center text-sm font-semibold py-1.5 px-4 flex items-center justify-center gap-2">
                    <FlaskConical size={14} />
                    You are in Sandbox Mode. Changes here will not affect your live data.
                </div>
            )}
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
                        <button
                            type="button"
                            className="p-1 rounded-full text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            onClick={() => setIsLiveCopilotOpen(true)}
                            aria-label="Activate Voice Co-pilot"
                        >
                            <Mic className="h-6 w-6" />
                        </button>
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

                        {/* Environment Switcher */}
                         <div className="relative ml-3">
                            <button
                                onClick={() => setIsEnvSwitcherOpen(!isEnvSwitcherOpen)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-hover-bg border border-transparent hover:border-border-subtle"
                            >
                                {isSandbox && <FlaskConical size={14} className="text-yellow-500"/>}
                                <span className="max-w-[100px] truncate">{environments.find(e => e.id === currentEnvironment)?.name || 'Production'}</span>
                                <ChevronsUpDown size={14} className="text-text-secondary" />
                            </button>
                             {isEnvSwitcherOpen && (
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-card-bg ring-1 ring-border-subtle focus:outline-none z-20">
                                    <div className="py-1">
                                        {environments.map(env => (
                                            <button
                                                key={env.id}
                                                onClick={() => handleEnvChange(env.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-hover-bg flex items-center justify-between"
                                            >
                                                <span>{env.name}</span>
                                                {currentEnvironment === env.id && <Check size={16} className="text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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
