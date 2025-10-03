import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Ticket } from '../../../types';
import Button from '../../ui/Button';
import { Plus, LifeBuoy } from 'lucide-react';
import ClientTicketDetailModal from './ClientTicketDetailModal';
import { format } from 'date-fns';

const ClientTicketsTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const { ticketsQuery } = useData();
    const { data: allTickets = [], isLoading } = ticketsQuery;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State now holds only the ID, not the stale object
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    const myTickets = useMemo(() => {
        if (!authenticatedUser?.contactId) return [];
        return (allTickets as Ticket[])
            .filter((t: Ticket) => t.contactId === authenticatedUser.contactId)
            .sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [allTickets, authenticatedUser]);
    
    // Derive the selected ticket object from the live query data
    const selectedTicket = useMemo(() => {
        if (!selectedTicketId) return null;
        return myTickets.find(t => t.id === selectedTicketId) || null;
    }, [myTickets, selectedTicketId]);

    const handleAdd = () => {
        setSelectedTicketId(null);
        setIsModalOpen(true);
    };

    const handleView = (ticket: Ticket) => {
        setSelectedTicketId(ticket.id);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicketId(null);
    };

    const getStatusColor = (status: Ticket['status']) => {
        switch (status) {
            case 'Open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">My Support Tickets</h3>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Ticket
                </Button>
            </div>

            {isLoading ? (
                <p>Loading your tickets...</p>
            ) : myTickets.length > 0 ? (
                <div className="space-y-3">
                    {myTickets.map(ticket => (
                        <div key={ticket.id} className="p-4 border dark:border-dark-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => handleView(ticket)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{ticket.subject}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Opened on {format(new Date(ticket.createdAt), 'PP')}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <LifeBuoy className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 font-semibold">No tickets found.</p>
                    <p className="text-sm">Click 'New Ticket' to get help.</p>
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