import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact, ContactStatus } from '../../types';
import ContactsTable from './ContactsTable';
import ContactDetailModal from './ContactDetailModal';
import ContactFilterBar from './ContactFilterBar';
import BulkActionsToolbar from './BulkActionsToolbar';
import BulkStatusUpdateModal from './BulkStatusUpdateModal';
import { useAuth } from '../../contexts/AuthContext';

interface ContactsPageProps {
    isTabbedView?: boolean;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ isTabbedView = false }) => {
    const { industryConfig, contactFilters } = useApp();
    const { authenticatedUser } = useAuth();
    const { 
        contactsQuery,
        createContactMutation,
        updateContactMutation,
        deleteContactMutation,
        bulkDeleteContactsMutation,
        bulkUpdateContactStatusMutation,
    } = useData();
    const { data: contacts = [], isLoading, isError } = contactsQuery;
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<AnyContact | null>(null);
    const [selectedContactIds, setSelectedContactIds] = useState(new Set<string>());
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const filteredContacts = useMemo(() => {
        if (!contactFilters || contactFilters.length === 0) {
            return contacts;
        }
        return contacts.filter((contact: AnyContact) => {
            return contactFilters.every(filter => {
                const contactValue = String((contact as any)[filter.field] || '').toLowerCase();
                const filterValue = filter.value.toLowerCase();
                switch (filter.operator) {
                    case 'is': return contactValue === filterValue;
                    case 'is_not': return contactValue !== filterValue;
                    case 'contains': return contactValue.includes(filterValue);
                    case 'does_not_contain': return !contactValue.includes(filterValue);
                    default: return true;
                }
            });
        });
    }, [contacts, contactFilters]);


    const handleRowClick = (contact: AnyContact) => {
        setSelectedContact(contact);
        setIsDetailModalOpen(true);
    };

    const handleAdd = () => {
        // Provide a default empty structure for a new contact
        setSelectedContact({
            id: '',
            organizationId: authenticatedUser!.organizationId!,
            contactName: '',
            email: '',
            phone: '',
            status: 'Lead',
            leadSource: 'Manual',
            createdAt: new Date().toISOString(),
            customFields: {},
        } as AnyContact); 
        setIsDetailModalOpen(true);
    };

    const handleSave = (contactData: AnyContact) => {
        if (contactData.id) {
            updateContactMutation.mutate(contactData, {
                onSuccess: () => setIsDetailModalOpen(false)
            });
        } else {
            createContactMutation.mutate(contactData, {
                 onSuccess: () => setIsDetailModalOpen(false)
            });
        }
    };
    
    const handleDelete = (contactId: string) => {
        deleteContactMutation.mutate(contactId, {
            onSuccess: () => setIsDetailModalOpen(false)
        });
    };
    
    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedContactIds.size} contacts?`)) {
            bulkDeleteContactsMutation.mutate(Array.from(selectedContactIds), {
                onSuccess: () => setSelectedContactIds(new Set())
            });
        }
    };

    const handleBulkStatusUpdate = (status: ContactStatus) => {
        bulkUpdateContactStatusMutation.mutate({ ids: Array.from(selectedContactIds), status }, {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                setSelectedContactIds(new Set());
            }
        });
    };

    const isMutationLoading = createContactMutation.isPending || updateContactMutation.isPending || deleteContactMutation.isPending;

    const pageContent = (
         <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-text-heading">{industryConfig.contactNamePlural}</h1>
                    <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                        New {industryConfig.contactName}
                    </Button>
                </div>
            )}
            <Card>
                <ContactFilterBar />
                {selectedContactIds.size > 0 && (
                    <BulkActionsToolbar 
                        selectedCount={selectedContactIds.size}
                        onClear={() => setSelectedContactIds(new Set())}
                        onDelete={handleBulkDelete}
                        onChangeStatus={() => setIsStatusModalOpen(true)}
                        isDeleting={bulkDeleteContactsMutation.isPending}
                    />
                )}
                {isLoading ? (
                    <div className="p-8 text-center">Loading {industryConfig.contactNamePlural.toLowerCase()}...</div>
                ) : (
                    <ContactsTable 
                        contacts={filteredContacts} 
                        onRowClick={handleRowClick} 
                        isError={isError}
                        selectedContactIds={selectedContactIds}
                        setSelectedContactIds={setSelectedContactIds}
                    />
                )}
            </Card>

            <ContactDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                contact={selectedContact}
                onSave={handleSave}
                onDelete={handleDelete}
                isSaving={isMutationLoading}
                isDeleting={deleteContactMutation.isPending}
            />

            <BulkStatusUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                selectedCount={selectedContactIds.size}
                onUpdate={handleBulkStatusUpdate}
                isUpdating={bulkUpdateContactStatusMutation.isPending}
            />
        </>
    );

    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default ContactsPage;