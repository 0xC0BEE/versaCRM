import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, LogOut, ChevronDown, Building } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Industry } from '../../types';

const Header: React.FC = () => {
    const { authenticatedUser, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { currentIndustry, setCurrentIndustry } = useApp();

    return (
        <header className="h-16 bg-white dark:bg-dark-card border-b dark:border-dark-border flex items-center justify-between px-6 flex-shrink-0">
            <div>
                {authenticatedUser?.role === 'Super Admin' && (
                     <div className="relative group">
                        <button className="flex items-center space-x-2 text-sm font-medium p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Building size={16} />
                            <span>Industry: {currentIndustry}</span>
                            <ChevronDown size={16} />
                        </button>
                        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                            {(['Health', 'Finance', 'Legal', 'Generic'] as Industry[]).map(ind => (
                                <a href="#" key={ind} onClick={() => setCurrentIndustry(ind)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {ind}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="relative group">
                    <button className="flex items-center space-x-2">
                         <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                           {authenticatedUser?.name.charAt(0)}
                         </div>
                        <span className="text-sm font-medium hidden md:block">{authenticatedUser?.name}</span>
                        <ChevronDown size={16} />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                        <a href="#" onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                           <LogOut size={16} className="mr-2" />
                           Logout
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;