import React from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
// FIX: Replaced MainConsole with specific role-based consoles.
import OrganizationConsole from './components/auth/OrganizationConsole';
import TeamMemberConsole from './components/auth/TeamMemberConsole';
import ClientPortal from './components/auth/ClientPortal';

function App() {
    const { authenticatedUser } = useAuth();

    if (!authenticatedUser) {
        return <LoginPage />;
    }

    // FIX: Render the correct console based on the user's role.
    switch (authenticatedUser.role) {
        case 'Super Admin':
        case 'Organization Admin':
            return <OrganizationConsole />;
        case 'Team Member':
            return <TeamMemberConsole />;
        case 'Client':
            return <ClientPortal />;
        default:
            // Fallback to login if role is unrecognized
            return <LoginPage />;
    }
}

export default App;
