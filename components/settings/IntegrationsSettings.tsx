import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Mail, Phone, Power, PowerOff, Landmark } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const IntegrationsSettings: React.FC = () => {
    const { 
        organizationSettingsQuery, 
        updateOrganizationSettingsMutation
    } = useData();
    const { authenticatedUser } = useAuth();
    const { data: settings } = organizationSettingsQuery;

    const emailIntegration = settings?.emailIntegration;
    const voipIntegration = settings?.voip;
    const accountingIntegration = settings?.accounting;
    const isEmailConnected = emailIntegration?.isConnected;
    const isVoipConnected = voipIntegration?.isConnected;
    const isAccountingConnected = accountingIntegration?.isConnected;

    const isPending = updateOrganizationSettingsMutation.isPending;

    const handleConnectEmail = () => {
        if (authenticatedUser) {
            updateOrganizationSettingsMutation.mutate({ emailIntegration: { isConnected: true, connectedEmail: authenticatedUser.email, lastSync: new Date().toISOString() } });
        }
    };

    const handleDisconnectEmail = () => {
        if (window.confirm("Are you sure you want to disconnect your email account? This will stop syncing new emails.")) {
            updateOrganizationSettingsMutation.mutate({ emailIntegration: { isConnected: false, connectedEmail: undefined, lastSync: undefined } });
        }
    };

    const handleConnectVoip = () => {
        updateOrganizationSettingsMutation.mutate({ voip: { isConnected: true, provider: 'Simulated VoIP Provider' } });
    };

    const handleDisconnectVoip = () => {
         if (window.confirm("Are you sure you want to disconnect your VoIP provider? This will disable click-to-call.")) {
            updateOrganizationSettingsMutation.mutate({ voip: { isConnected: false, provider: undefined } });
        }
    };

    const handleConnectAccounting = () => {
        updateOrganizationSettingsMutation.mutate({ accounting: { isConnected: true, provider: 'quickbooks' } }, {
            onSuccess: () => toast.success("QuickBooks connected successfully!")
        });
    };

    const handleDisconnectAccounting = () => {
        if (window.confirm("Are you sure you want to disconnect QuickBooks? This will stop automatic invoice creation.")) {
            updateOrganizationSettingsMutation.mutate({ accounting: { isConnected: false, provider: undefined } });
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
                            {isEmailConnected ? (
                                <>
                                <p className="text-sm text-success">Connected as {emailIntegration.connectedEmail}</p>
                                {emailIntegration.lastSync && <p className="text-xs text-text-secondary">Last sync: {format(new Date(emailIntegration.lastSync), 'Pp')}</p>}
                                </>
                            ) : (
                                <p className="text-sm text-text-secondary">Connect your Gmail or Outlook to automatically log conversations.</p>
                            )}
                        </div>
                    </div>
                    {isEmailConnected ? (
                        <Button variant="danger" size="sm" onClick={handleDisconnectEmail} leftIcon={<PowerOff size={14} />} disabled={isPending}>
                            Disconnect
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={handleConnectEmail} leftIcon={<Power size={14} />} disabled={isPending}>
                            Connect Email Account
                        </Button>
                    )}
                </div>

                <div className="p-4 border border-border-subtle rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-md">
                           <Phone className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <h4 className="font-medium">VoIP Telephony</h4>
                            {isVoipConnected ? (
                                <p className="text-sm text-success">Connected via {voipIntegration.provider}</p>
                            ) : (
                                <p className="text-sm text-text-secondary">Enable click-to-call and automatic call logging.</p>
                            )}
                        </div>
                    </div>
                    {isVoipConnected ? (
                        <Button variant="danger" size="sm" onClick={handleDisconnectVoip} leftIcon={<PowerOff size={14} />} disabled={isPending}>
                            Disconnect
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={handleConnectVoip} leftIcon={<Power size={14} />} disabled={isPending}>
                            Connect Provider
                        </Button>
                    )}
                </div>

                 <div className="p-4 border border-border-subtle rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-md">
                           <Landmark className="h-6 w-6 text-teal-500" />
                        </div>
                        <div>
                            <h4 className="font-medium">Accounting</h4>
                            {isAccountingConnected ? (
                                <p className="text-sm text-success">Connected via QuickBooks</p>
                            ) : (
                                <p className="text-sm text-text-secondary">Sync invoices and payments with your accounting software.</p>
                            )}
                        </div>
                    </div>
                    {isAccountingConnected ? (
                        <Button variant="danger" size="sm" onClick={handleDisconnectAccounting} leftIcon={<PowerOff size={14} />} disabled={isPending}>
                            Disconnect
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={handleConnectAccounting} leftIcon={<Power size={14} />} disabled={isPending}>
                            Connect to QuickBooks
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsSettings;
