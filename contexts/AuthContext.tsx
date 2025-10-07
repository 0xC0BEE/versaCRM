import React, { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import { User, AuthContextType, Permission, CustomRole } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useQueryClient } from '@tanstack/react-query';
// FIX: Corrected import path for apiClient from a file path to a relative module path.
import apiClient from '../services/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authenticatedUser, setAuthenticatedUser] = useLocalStorage<User | null>('user', null);
    const [userRole, setUserRole] = useState<CustomRole | null>(null);
    const [isLoadingRole, setIsLoadingRole] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        const fetchRole = async () => {
            if (authenticatedUser && authenticatedUser.roleId) {
                setIsLoadingRole(true);
                try {
                    const roles = await apiClient.getRoles(authenticatedUser.organizationId);
                    const role = roles.find(r => r.id === authenticatedUser.roleId);
                    setUserRole(role || null);
                } catch (error) {
                    console.error("Failed to fetch user role:", error);
                    setUserRole(null);
                } finally {
                    setIsLoadingRole(false);
                }
            } else {
                setUserRole(null);
            }
        };
        fetchRole();
    }, [authenticatedUser]);


    const login = useCallback((user: User) => {
        setAuthenticatedUser(user);
    }, [setAuthenticatedUser]);

    const logout = useCallback(() => {
        queryClient.clear();
        localStorage.removeItem('user');
        localStorage.removeItem('industry');
        localStorage.removeItem('page');
        setAuthenticatedUser(null);
        setUserRole(null);
    }, [queryClient, setAuthenticatedUser]);
    
    const hasPermission = useCallback((permission: Permission): boolean => {
        if (isLoadingRole || !userRole) {
            return false;
        }
        // Super Admins have all permissions implicitly
        if (userRole.name === 'Super Admin') return true;
        
        return !!userRole.permissions[permission];
    }, [userRole, isLoadingRole]);


    const value: AuthContextType = useMemo(() => ({
        authenticatedUser,
        login,
        logout,
        hasPermission,
    }), [authenticatedUser, login, logout, hasPermission]);

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