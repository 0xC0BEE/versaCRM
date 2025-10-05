import React from 'react';
import { AnyContact, AuditLogEntry } from '../../../types';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogTabProps {
    contact: AnyContact;
}

const AuditLogTab: React.FC<AuditLogTabProps> = ({ contact }) => {
    const auditLogs = contact.auditLogs || [];

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <h4 className="font-semibold mb-4">Audit Log</h4>
            {auditLogs.length > 0 ? (
                <div className="flow-root">
                    <ul className="-mb-8">
                        {[...auditLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, logIdx) => (
                             <li key={log.id}>
                                <div className="relative pb-8">
                                    {logIdx !== auditLogs.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border-subtle" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className="h-8 w-8 rounded-full flex items-center justify-center bg-hover-bg ring-8 ring-card-bg">
                                               <Clock className="h-4 w-4 text-text-secondary" />
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-text-primary">
                                                    <span className="font-medium">{log.userName}</span> {log.change}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-text-secondary">
                                                <time dateTime={log.timestamp}>{format(new Date(log.timestamp), 'PP pp')}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <Clock className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">No audit log entries found.</p>
                </div>
            )}
        </div>
    );
};

export default AuditLogTab;