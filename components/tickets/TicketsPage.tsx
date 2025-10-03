import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Ticket } from '../../types';
import TicketsTable from './TicketsTable';
import TicketDetailModal from './TicketDetailModal';

const TicketsPage: React.FC = () => {
    const { ticketsQuery } = useData();
    const { data: tickets = [], isLoading } = ticketsQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State now holds only the ID, not the stale object
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    // Derive the selected ticket object from the live query data
    const selectedTicket = useMemo(() => {
        if (!selectedTicketId) return null;
        return (tickets as Ticket[]).find(t => t.id === selectedTicketId) || null;
    }, [tickets, selectedTicketId]);


    const handleAdd = () => {
        setSelectedTicketId(null);
        setIsModalOpen(true);
    };

    const handleRowClick = (ticket: Ticket) => {
        setSelectedTicketId(ticket.id);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicketId(null);
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Support Tickets</h1>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Ticket
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading tickets...</div>
                ) : tickets.length > 0 ? (
                    <TicketsTable tickets={tickets as Ticket[]} onRowClick={handleRowClick} />
                ) : (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <p>No tickets found.</p>
                    </div>
                )}
            </Card>
            <TicketDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                ticket={selectedTicket}
            />
        </PageWrapper>
    );
};

export default TicketsPage;