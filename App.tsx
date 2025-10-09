import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import OrganizationConsole from './components/auth/OrganizationConsole';
import TeamMemberConsole from './components/auth/TeamMemberConsole';
import ClientPortal from './components/auth/ClientPortal';
import CallControlModal from './components/voip/CallControlModal';
import PublicLandingPage from './components/landing_pages/PublicLandingPage';

function App() {
    const { authenticatedUser, hasPermission } = useAuth();
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const isPublicRoute = hash && hash.startsWith('#/') && hash.length > 2;

    if (isPublicRoute) {
        return <PublicLandingPage />;
    }

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
