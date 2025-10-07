import React from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import OrganizationConsole from './components/auth/OrganizationConsole';
import TeamMemberConsole from './components/auth/TeamMemberConsole';
import ClientPortal from './components/auth/ClientPortal';
import CallControlModal from './components/voip/CallControlModal';

function App() {
    const { authenticatedUser, hasPermission } = useAuth();

    if (!authenticatedUser) {
        return <LoginPage />;
    }
    
    const renderApp = () => {
        if (authenticatedUser.isClient) {
            return <ClientPortal />;
        }

        if (hasPermission('settings:access')) {
            return <OrganizationConsole />;
        }

        return <TeamMemberConsole />;
    };

    return (
        <>
            {renderApp()}
            <CallControlModal />
        </>
    );
}

export default App;