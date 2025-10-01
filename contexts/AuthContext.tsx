import React, { createContext, useContext, ReactNode, useMemo } from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { User, AuthContextType, Permissions } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { permissionsByRole } from '../config/permissionsConfig';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authenticatedUser, setAuthenticatedUser] = useLocalStorage<User | null>('user', null);
    const queryClient = useQueryClient();

    const login = (user: User) => {
        setAuthenticatedUser(user);
    };

    const logout = () => {
        // This is the definitive, imperative fix for the logout issue.
        // It enforces a strict order of operations to prevent race conditions
        // in sensitive development environments like iframes.

        // 1. Clear all cached data from react-query FIRST.
        // This is synchronous and ensures that any components that are about
        // to unmount will not find any stale data.
        queryClient.clear();

        // 2. Explicitly clear all session-related items from local storage.
        // This provides a completely clean slate for the next session.
        localStorage.removeItem('user');
        localStorage.removeItem('industry');
        localStorage.removeItem('page');
        
        // 3. ONLY after all cleanup is complete, update the application state.
        // This will trigger React to unmount the old console and render the
        // login page. Because all data is already gone, no errors will occur.
        setAuthenticatedUser(null);
    };
    
    const permissions = useMemo((): Permissions | null => {
        if (!authenticatedUser) return null;
        return permissionsByRole[authenticatedUser.role];
    }, [authenticatedUser]);

    const value: AuthContextType = {
        authenticatedUser,
        login,
        logout,
        permissions,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};