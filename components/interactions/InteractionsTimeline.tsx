import React from 'react';
// FIX: Imported the Interaction type.
import { Interaction } from '../../types';
import { Mail, Phone, Users, StickyNote } from 'lucide-react';

interface InteractionsTimelineProps {
    interactions: Interaction[];
}

const getIcon = (type: Interaction['type']) => {
    switch (type) {
        case 'Email': return <Mail className="h-4 w-4 text-white" />;
        case 'Call': return <Phone className="h-4 w-4 text-white" />;
        case 'Meeting': return <Users className="h-4 w-4 text-white" />;
        case 'Appointment': return <Users className="h-4 w-4 text-white" />;
        case 'Note': return <StickyNote className="h-4 w-4 text-white" />;
        default: return null;
    }
};

const getColor = (type: Interaction['type']) => {
    switch (type) {
        case 'Email': return 'bg-blue-500';
        case 'Call': return 'bg-green-500';
        case 'Meeting': return 'bg-purple-500';
        case 'Appointment': return 'bg-purple-500';
        case 'Note': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

const InteractionsTimeline: React.FC<InteractionsTimelineProps> = ({ interactions }) => {
    if (!interactions || interactions.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No interactions found.</p>
            </div>
        );
    }
    
    // Create a sorted copy to avoid mutating the original prop array
    const sortedInteractions = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-6">
             <div className="flow-root">
                <ul className="-mb-8">
                    {sortedInteractions.map((item, itemIdx) => (
                        <li key={item.id}>
                            <div className="relative pb-8">
                                {itemIdx !== sortedInteractions.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-dark-card ${getColor(item.type)}`}>
                                            {getIcon(item.type)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.type} with Contact ID: {item.contactId}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.notes}</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            <time dateTime={item.date}>{new Date(item.date).toLocaleDateString()}</time>
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

export default InteractionsTimeline;
