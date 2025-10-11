import React, { useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Interaction, AnyContact } from '../../types';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { RefreshCw, Inbox, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const SyncedEmailPage: React.FC = () => {
    const { syncedEmailsQuery, contactsQuery, runEmailSyncMutation, organizationSettingsQuery } = useData();
    const { data: emails = [], isLoading: emailsLoading } = syncedEmailsQuery;
    const { data: contacts = [] } = contactsQuery;
    const { data: settings } = organizationSettingsQuery;
    const { authenticatedUser } = useAuth();
    const { setCurrentPage } = useApp();

    const contactMap = useMemo(() => new Map((contacts as AnyContact[]).map(c => [c.id, c])), [contacts]);

    const handleSyncNow = () => {
        if (authenticatedUser?.organizationId) {
            runEmailSyncMutation.mutate(authenticatedUser.organizationId);
        }
    };

    const handleViewContact = (contactId: string) => {
        // In a real app, you'd open a detail modal. For now, navigate.
        // This requires a way to tell the contacts page to open a specific contact.
        // For now, just navigate to the page.
        setCurrentPage('Contacts');
    };

    const isConnected = settings?.emailIntegration?.isConnected;

    if (!isConnected) {
        return (
            <PageWrapper>
                <div className="text-center py-20">
                    <AlertTriangle className="mx-auto h-12 w-12 text-warning" />
                    <h2 className="mt-4 text-lg font-semibold text-text-primary">Email Account Not Connected</h2>
                    <p className="mt-2 text-sm text-text-secondary">Please connect an email account in the settings to use this feature.</p>
                    <Button onClick={() => setCurrentPage('Settings')} className="mt-4">Go to Settings</Button>
                </div>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Synced Email</h1>
                <Button onClick={handleSyncNow} leftIcon={<RefreshCw size={16} className={runEmailSyncMutation.isPending ? 'animate-spin' : ''} />} disabled={runEmailSyncMutation.isPending}>
                    {runEmailSyncMutation.isPending ? 'Syncing...' : 'Sync Now'}
                </Button>
            </div>
            <Card>
                {emailsLoading ? (
                    <div className="p-8 text-center">Loading emails...</div>
                ) : emails.length > 0 ? (
                    <div className="divide-y divide-border-subtle">
                        {(emails as Interaction[]).map(email => {
                            const contact = contactMap.get(email.contactId);
                            const subjectMatch = email.notes.match(/Subject: (.*)/);
                            const subject = subjectMatch ? subjectMatch[1] : 'No Subject';

                            return (
                                <div key={email.id} className="p-4 hover:bg-hover-bg cursor-pointer" onClick={() => handleViewContact(email.contactId)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-text-primary">{subject}</p>
                                            <p className="text-sm text-primary">{contact?.contactName || 'Unknown Contact'}</p>
                                        </div>
                                        <p className="text-xs text-text-secondary whitespace-nowrap">{format(new Date(email.date), 'PPp')}</p>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1 truncate">
                                        {email.notes.split('\n\n')[1] || email.notes}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <Inbox className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Emails Synced Yet</h2>
                        <p className="mt-2 text-sm">Click "Sync Now" to find and log your email conversations.</p>
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
};

export default SyncedEmailPage;