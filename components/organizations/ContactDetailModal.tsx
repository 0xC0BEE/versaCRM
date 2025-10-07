import React, { useState, useEffect } from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact } from '../../types';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';
// FIX: Changed import to default since ProfileTab has a default export now.
import ProfileTab from './detail_tabs/ProfileTab';
import HistoryTab from './detail_tabs/HistoryTab';
import OrdersTab from './detail_tabs/OrdersTab';
import EnrollmentsTab from './detail_tabs/EnrollmentsTab';
import RelationshipsTab from './detail_tabs/RelationshipsTab';
import StructuredRecordsTab from './detail_tabs/StructuredRecordsTab';
import AuditLogTab from './detail_tabs/AuditLogTab';
import BillingTab from './detail_tabs/BillingTab';
import EmailTab from './detail_tabs/EmailTab';
import DocumentsTab from './detail_tabs/DocumentsTab';

interface ContactDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact | null;
    onSave: (contact: AnyContact) => void;
    onDelete: (contactId: string) => void;
    isSaving: boolean;
    isDeleting: boolean;
    initialTab?: string;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ 
    isOpen, onClose, contact, onSave, onDelete, isSaving, isDeleting, initialTab
}) => {
    const { industryConfig } = useApp();
    const [activeTab, setActiveTab] = useState(initialTab || 'Profile');
    const [newContactKey, setNewContactKey] = useState(0);

    // This effect must be called before any early returns to obey the Rules of Hooks.
    useEffect(() => {
        if (isOpen) {
            // Reset the active tab whenever the modal is opened
            // or the contact within the modal changes.
            setActiveTab(initialTab || 'Profile');
            // If it's a new contact, create a unique key for this instance of the modal
            // This forces the ProfileTab to remount and reset its state completely.
            if (!contact?.id) {
                setNewContactKey(prev => prev + 1);
            }
        }
    }, [isOpen, contact, initialTab]);

    if (!contact) return null;

    const isNewContact = !contact?.id;
    
    const tabConfig = {
        'Profile': <ProfileTab 
                        key={contact.id || `new-${newContactKey}`}
                        contact={contact!} 
                        onSave={onSave}
                        onDelete={onDelete}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                    />,
        'History': <HistoryTab contact={contact!} />,
        'Email': <EmailTab contact={contact!} setActiveTab={setActiveTab} isReadOnly={isNewContact} />,
        'Documents': <DocumentsTab contact={contact!} isReadOnly={isNewContact} />,
        [industryConfig.ordersTabName]: <OrdersTab contact={contact!} isReadOnly={isNewContact} />,
        'Transactions': <BillingTab contact={contact!} isReadOnly={isNewContact} />,
        [industryConfig.enrollmentsTabName]: <EnrollmentsTab contact={contact!} isReadOnly={isNewContact} />,
        [industryConfig.structuredRecordTabName]: <StructuredRecordsTab contact={contact!} isReadOnly={isNewContact} />,
        'Relationships': <RelationshipsTab contact={contact!} isReadOnly={isNewContact} />,
        'Audit Log': <AuditLogTab contact={contact!} />,
    };

    const tabs = Object.keys(tabConfig).filter(tab => !isNewContact || tab === 'Profile');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNewContact ? `New ${industryConfig.contactName}` : `Details for ${contact.contactName}`} size="5xl">
            <div className="flex flex-col">
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex-grow">
                    {tabConfig[activeTab as keyof typeof tabConfig]}
                </div>
            </div>
        </Modal>
    );
};

export default ContactDetailModal;
