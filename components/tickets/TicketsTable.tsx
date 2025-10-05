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

    const contactMap = useMemo(() => new Map((contacts as AnyContact[]).map((c: AnyContact) => [c.id, c.contactName])), [contacts]);
    const teamMemberMap = useMemo(() => new Map((teamMembers as User[]).map((m: User) => [m.id, m.name])), [teamMembers]);

    const getPriorityColor = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'High': return 'bg-error/10 text-error';
            case 'Medium': return 'bg-warning/10 text-warning';
            case 'Low': return 'bg-primary/10 text-primary';
            default: return 'bg-slate-400/10 text-text-secondary';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text-secondary">
                <thead className="text-sm text-text-secondary uppercase bg-card-bg/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-medium">Subject</th>
                        <th scope="col" className="px-6 py-3 font-medium">Contact</th>
                        <th scope="col" className="px-6 py-3 font-medium">Assigned To</th>
                        <th scope="col" className="px-6 py-3 font-medium">Priority</th>
                        <th scope="col" className="px-6 py-3 font-medium">Status</th>
                        <th scope="col" className="px-6 py-3 font-medium">Time to Respond</th>
                        <th scope="col" className="px-6 py-3 font-medium">Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.id} className="border-b border-border-subtle hover:bg-hover-bg cursor-pointer h-[52px]" onClick={() => onRowClick(ticket)}>
                            <td className="px-6 py-4 font-medium text-text-primary">{ticket.subject}</td>
                            <td className="px-6 py-4">{contactMap.get(ticket.contactId) || 'Unknown'}</td>
                            <td className="px-6 py-4">{teamMemberMap.get(ticket.assignedToId || '') || 'Unassigned'}</td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${getPriorityColor(ticket.priority)}`}>
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
