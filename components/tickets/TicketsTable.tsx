import React, { useMemo } from 'react';
import { Ticket, AnyContact, User, OrganizationSettings } from '../../types';
import { useData } from '../../contexts/DataContext';
import { format } from 'date-fns';
import SLATimer from '../common/SLATimer';

interface TicketsTableProps {
    tickets: Ticket[];
    onRowClick: (ticket: Ticket) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onRowClick }) => {
    const { contactsQuery, teamMembersQuery, organizationSettingsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: orgSettings } = organizationSettingsQuery;

    // FIX: Explicitly cast `contacts` and `teamMembers` from the `useData` hook.
    // The context provides them as `any`, so casting to their correct types
    // allows TypeScript to correctly infer the type of `contactMap` and `teamMemberMap`,
    // resolving the error where `Map.get` was returning a value that could not be rendered.
    const contactMap = useMemo(() => new Map((contacts as AnyContact[]).map((c: AnyContact) => [c.id, c.contactName])), [contacts]);
    const teamMemberMap = useMemo(() => new Map((teamMembers as User[]).map((m: User) => [m.id, m.name])), [teamMembers]);

    const getPriorityColor = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Subject</th>
                        <th scope="col" className="px-6 py-3">Contact</th>
                        <th scope="col" className="px-6 py-3">Assigned To</th>
                        <th scope="col" className="px-6 py-3">Priority</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Time to Respond</th>
                        <th scope="col" className="px-6 py-3">Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.id} className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" onClick={() => onRowClick(ticket)}>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ticket.subject}</td>
                            <td className="px-6 py-4">{contactMap.get(ticket.contactId) || 'Unknown'}</td>
                            <td className="px-6 py-4">{teamMemberMap.get(ticket.assignedToId || '') || 'Unassigned'}</td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4">{ticket.status}</td>
                            <td className="px-6 py-4">
                                <SLATimer ticket={ticket} settings={orgSettings} />
                            </td>
                            <td className="px-6 py-4">{format(new Date(ticket.updatedAt), 'PP')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TicketsTable;
