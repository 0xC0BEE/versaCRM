import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useData } from '../../contexts/DataContext';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import ContactsTable from './ContactsTable';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import ContactDetailModal from './ContactDetailModal';
// FIX: Imported correct type.
import { AnyContact } from '../../types';
import Input from '../ui/Input';

interface ContactsPageProps {
    isTabbedView?: boolean;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ isTabbedView = false }) => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();
    const { contactsQuery } = useData();
    const { data: contacts = [], isLoading } = contactsQuery;
    const [selectedContact, setSelectedContact] = useState<AnyContact | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleRowClick = (contact: AnyContact) => {
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedContact(null);
    };

    const filteredContacts = useMemo(() => {
        if (!contacts) return [];
        return contacts.filter((contact: AnyContact) =>
            contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);

    const pageContent = (
        <>
            {!isTabbedView && (
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{industryConfig.contactNamePlural}</h1>
                    <Button onClick={() => {}} leftIcon={<Plus size={16} />}>
                        New {industryConfig.contactName}
                    </Button>
                </div>
            )}
            <Card>
                <div className="p-4 border-b dark:border-dark-border">
                    <Input 
                        id="search" 
                        placeholder={`Search ${industryConfig.contactNamePlural.toLowerCase()}...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {isLoading ? (
                    <div className="p-8 text-center">Loading {industryConfig.contactNamePlural.toLowerCase()}...</div>
                ) : (
                    <ContactsTable contacts={filteredContacts} onRowClick={handleRowClick} />
                )}
            </Card>
            {isModalOpen && selectedContact && (
                <ContactDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    contact={selectedContact}
                />
            )}
        </>
    );

    if (isTabbedView) {
        return pageContent;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default ContactsPage;
