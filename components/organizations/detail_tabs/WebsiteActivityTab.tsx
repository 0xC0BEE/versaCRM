import React, { useMemo } from 'react';
import { AnyContact, Interaction } from '../../../types';
import { Globe } from 'lucide-react';
import { format } from 'date-fns';

interface WebsiteActivityTabProps {
    contact: AnyContact;
}

const WebsiteActivityTab: React.FC<WebsiteActivityTabProps> = ({ contact }) => {
    const siteVisits = useMemo(() => {
        return (contact.interactions || [])
            .filter(i => i.type === 'Site Visit')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [contact.interactions]);

    if (siteVisits.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary">
                <p>No website activity recorded for this contact.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <h4 className="font-semibold mb-4">Website Activity</h4>
            <div className="flow-root">
                <ul className="-mb-8">
                    {siteVisits.map((visit, visitIdx) => (
                        <li key={visit.id}>
                            <div className="relative pb-8">
                                {visitIdx !== siteVisits.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border-subtle" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-400 dark:bg-gray-600 ring-8 ring-card-bg">
                                            <Globe className="h-4 w-4 text-white" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-text-secondary">{visit.notes}</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-text-secondary">
                                            <time dateTime={visit.date}>{format(new Date(visit.date), 'PP pp')}</time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WebsiteActivityTab;