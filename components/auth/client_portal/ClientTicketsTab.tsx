import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { Ticket } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';
import ClientTicketDetailModal from './ClientTicketDetailModal';
import { format } from 'date-fns';

const ClientTicketsTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const contactId = authenticatedUser?.contactId;

    const { data: allTickets = [], isLoading } = useQuery<Ticket[], Error>({
        queryKey: ['tickets', authenticatedUser?.organizationId],
        queryFn: () => apiClient.getTickets(authenticatedUser!.organizationId!),
        enabled: !!authenticatedUser?.organizationId,
    });

    const myTickets = useMemo(() => {
        return allTickets.filter(t => t.contactId === contactId).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [allTickets, contactId]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const handleAdd = () => {
        setSelectedTicket(null);
        setIsModalOpen(true);
    };

    const handleRowClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };
    
    const getStatusColor = (status: Ticket['status']) => {
        switch (status) {
            case 'Open': return 'bg-success/10 text-success';
            case 'New': return 'bg-primary/10 text-primary';
            case 'Pending': return 'bg-warning/10 text-warning';
            case 'Closed': return 'bg-slate-400/10 text-text-secondary';
            default: return 'bg-slate-400/10 text-text-secondary';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Your Support Tickets</h3>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Ticket
                </Button>
            </div>
             {isLoading ? (
                <div className="p-8 text-center">Loading tickets...</div>
            ) : myTickets.length > 0 ? (
                <div className="overflow-x-auto border border-border-subtle rounded-lg">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Subject</th>
                                <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                <th scope="col" className="px-6 py-3 font-medium">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myTickets.map(ticket => (
                                <tr key={ticket.id} className="border-b border-border-subtle hover:bg-hover-bg cursor-pointer" onClick={() => handleRowClick(ticket)}>
                                    <td className="px-6 py-4 font-medium text-text-primary">{ticket.subject}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{format(new Date(ticket.updatedAt), 'PP')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-20 text-text-secondary">
                    <p>You haven't submitted any support tickets yet.</p>
                </div>
            )}
             <ClientTicketDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                ticket={selectedTicket}
            />
        </div>
    );
};

export default ClientTicketsTab;