import React from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import OrganizationConsole from './components/auth/OrganizationConsole';
import TeamMemberConsole from './components/auth/TeamMemberConsole';
import ClientPortal from './components/auth/ClientPortal';

function App() {
    const { authenticatedUser, hasPermission } = useAuth();

    if (!authenticatedUser) {
        return <LoginPage />;
    }
    
    if (authenticatedUser.isClient) {
        return <ClientPortal />;
    }

    // A user's ability to see the full console vs. the team member console
    // can now be determined by a specific permission.
    if (hasPermission('settings:access')) {
        return <OrganizationConsole />;
    }

    return <TeamMemberConsole />;
}

export default App;