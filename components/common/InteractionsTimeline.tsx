import React from 'react';
// FIX: Corrected import path for types.
import { Interaction } from '../../types';
import { Mail, Phone, Users, FileText, Calendar, MapPin, Wrench } from 'lucide-react';
import { format } from 'date-fns';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';

interface InteractionsTimelineProps {
    interactions: Interaction[];
}

const interactionIcons: Record<Interaction['type'], React.ReactNode> = {
    Email: <Mail className="h-4 w-4 text-white" />,
    Call: <Phone className="h-4 w-4 text-white" />,
    // FIX: Add 'Meeting' to the record.
    Meeting: <Users className="h-4 w-4 text-white" />,
    Note: <FileText className="h-4 w-4 text-white" />,
    Appointment: <Calendar className="h-4 w-4 text-white" />,
    'Site Visit': <MapPin className="h-4 w-4 text-white" />,
    'Maintenance Request': <Wrench className="h-4 w-4 text-white" />,
};

const interactionColors: Record<Interaction['type'], string> = {
    Email: 'bg-blue-500',
    Call: 'bg-green-500',
    // FIX: Add 'Meeting' to the record.
    Meeting: 'bg-purple-500',
    Note: 'bg-gray-500',
    Appointment: 'bg-indigo-500',
    'Site Visit': 'bg-orange-500',
    'Maintenance Request': 'bg-red-500',
};

const InteractionsTimeline: React.FC<InteractionsTimelineProps> = ({ interactions }) => {
    const { teamMembersQuery } = useData();
    const { data: teamMembers = [] } = teamMembersQuery;

    if (!interactions || interactions.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No interactions logged yet.</p>
            </div>
        );
    }
    
    // Sort interactions by date, most recent first
    const sortedInteractions = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const renderNotes = (notes: string) => {
        if (!teamMembers.length) return notes;

        // Create a regex from the list of team member names
        const names = teamMembers.map(tm => tm.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        if (names.length === 0) return notes;
        
        const mentionRegex = new RegExp(`(@(${names.join('|')}))`, 'g');

        const parts = notes.split(mentionRegex);

        return parts.map((part, index) => {
            const isMention = teamMembers.some(tm => `@${tm.name}` === part);
            if (isMention) {
                return (
                    <strong key={index} className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 font-semibold rounded px-1">
                        {part}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {sortedInteractions.map((interaction, interactionIdx) => (
                    <li key={interaction.id}>
                        <div className="relative pb-8">
                            {interactionIdx !== sortedInteractions.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ${interactionColors[interaction.type]}`}>
                                        {interactionIcons[interaction.type]}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">{interaction.type}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {renderNotes(interaction.notes)}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                        <time dateTime={interaction.date}>{format(new Date(interaction.date), 'PP')}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InteractionsTimeline;