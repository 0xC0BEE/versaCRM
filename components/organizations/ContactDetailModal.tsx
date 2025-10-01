import React, { useState } from 'react';
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
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ 
    isOpen, onClose, contact, onSave, onDelete, isSaving, isDeleting
}) => {
    const { industryConfig } = useApp();
    const isNewContact = !contact?.id;
    
    // Manage active tab state here to allow child components to change it
    const [activeTab, setActiveTab] = useState('Profile');

    const tabConfig = {
        'Profile': <ProfileTab 
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
    
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab('Profile');
        }
    }, [isOpen, contact]);

    if (!contact) return null;

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
