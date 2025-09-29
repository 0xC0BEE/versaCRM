import React, { createContext, useContext, ReactNode, useMemo } from 'react';
// FIX: Imported Permissions type.
import { User, AuthContextType, Permissions } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
// FIX: Imported permissions config.
import { permissionsByRole } from '../config/permissionsConfig';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authenticatedUser, setAuthenticatedUser] = useLocalStorage<User | null>('user', null);

    const login = (user: User) => {
        setAuthenticatedUser(user);
    };

    const logout = () => {
        setAuthenticatedUser(null);
        // Clear other app state on logout
        localStorage.removeItem('industry');
        localStorage.removeItem('page');
    };
    
    // FIX: Calculate and provide permissions based on user role.
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
