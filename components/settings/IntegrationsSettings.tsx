import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Mail, Power, PowerOff } from 'lucide-react';
import { format } from 'date-fns';

const IntegrationsSettings: React.FC = () => {
    const { organizationSettingsQuery, connectEmailMutation, disconnectEmailMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { data: settings } = organizationSettingsQuery;

    const emailIntegration = settings?.emailIntegration;
    const isConnected = emailIntegration?.isConnected;
    const isPending = connectEmailMutation.isPending || disconnectEmailMutation.isPending;

    const handleConnect = () => {
        // In a real app, this would redirect to an OAuth provider.
        // We will simulate connecting the admin's email.
        if (authenticatedUser) {
            connectEmailMutation.mutate(authenticatedUser.email);
        }
    };

    const handleDisconnect = () => {
        if (window.confirm("Are you sure you want to disconnect your email account? This will stop syncing new emails.")) {
            disconnectEmailMutation.mutate();
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold">Integrations</h3>
            <p className="text-sm text-text-secondary mb-4">Connect your other tools to VersaCRM.</p>

            <div className="space-y-4">
                <div className="p-4 border border-border-subtle rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-md">
                           <Mail className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="font-medium">Two-Way Email Sync</h4>
                            {isConnected ? (
                                <>
                                <p className="text-sm text-success">Connected as {emailIntegration.connectedEmail}</p>
                                {emailIntegration.lastSync && <p className="text-xs text-text-secondary">Last sync: {format(new Date(emailIntegration.lastSync), 'Pp')}</p>}
                                </>
                            ) : (
                                <p className="text-sm text-text-secondary">Connect your Gmail or Outlook to automatically log conversations.</p>
                            )}
                        </div>
                    </div>
                    {isConnected ? (
                        <Button variant="danger" size="sm" onClick={handleDisconnect} leftIcon={<PowerOff size={14} />} disabled={isPending}>
                            Disconnect
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={handleConnect} leftIcon={<Power size={14} />} disabled={isPending}>
                            Connect Email Account
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsSettings;
