import React from 'react';
import { Interaction, User } from '../../types';
import { Mail, Phone, Users, FileText, Calendar, MapPin, Wrench, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '../../contexts/DataContext';

interface InteractionsTimelineProps {
    interactions: Interaction[];
}

const interactionIcons: Record<string, React.ReactNode> = {
    Email: <Mail className="h-4 w-4 text-white" />,
    Call: <Phone className="h-4 w-4 text-white" />,
    Meeting: <Users className="h-4 w-4 text-white" />,
    Note: <FileText className="h-4 w-4 text-white" />,
    Appointment: <Calendar className="h-4 w-4 text-white" />,
    'Site Visit': <MapPin className="h-4 w-4 text-white" />,
    'Maintenance Request': <Wrench className="h-4 w-4 text-white" />,
    'VoIP Call': <Phone className="h-4 w-4 text-white" />,
    'Form Submission': <ClipboardList className="h-4 w-4 text-white" />,
};

const interactionColors: Record<string, string> = {
    Email: 'bg-blue-500',
    Call: 'bg-green-500',
    Meeting: 'bg-purple-500',
    Note: 'bg-slate-500',
    Appointment: 'bg-indigo-500',
    'Site Visit': 'bg-orange-500',
    'Maintenance Request': 'bg-red-500',
    'VoIP Call': 'bg-cyan-500',
    'Form Submission': 'bg-teal-500',
};

const InteractionsTimeline: React.FC<InteractionsTimelineProps> = ({ interactions }) => {
    const { teamMembersQuery } = useData();
    const { data: teamMembers = [] } = teamMembersQuery;

    if (!interactions || interactions.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary">
                <p>No interactions logged yet.</p>
            </div>
        );
    }
    
    const sortedInteractions = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const renderNotes = (notes: string) => {
        if (!teamMembers.length) return notes;

        const names = teamMembers.map((tm: any) => tm.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        if (names.length === 0) return notes;
        
        const mentionRegex = new RegExp(`(@(${names.join('|')}))`, 'g');

        const parts = notes.split(mentionRegex);

        return parts.map((part, index) => {
            const isMention = teamMembers.some((tm: any) => `@${tm.name}` === part);
            if (isMention) {
                return (
                    <strong key={index} className="bg-primary/10 text-primary font-semibold rounded px-1">
                        {part}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className="flow-root p-4">
            <ul className="-mb-8">
                {sortedInteractions.map((interaction, interactionIdx) => (
                    <li key={interaction.id}>
                        <div className="relative pb-8">
                            {interactionIdx !== sortedInteractions.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border-subtle" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ${interactionColors[interaction.type]}`}>
                                        {interactionIcons[interaction.type]}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-text-primary">
                                            <span className="font-medium">{interaction.type}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">
                                            {renderNotes(interaction.notes)}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-text-secondary">
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