import React, { useState } from 'react';
// FIX: Imported correct type.
import { AnyContact } from '../../types';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
import { useApp } from '../../contexts/AppContext';
import ProfileTab from './detail_tabs/ProfileTab';
import HistoryTab from './detail_tabs/HistoryTab';
import OrdersTab from './detail_tabs/OrdersTab';
import EnrollmentsTab from './detail_tabs/EnrollmentsTab';
import StructuredRecordsTab from './detail_tabs/StructuredRecordsTab';
import RelationshipsTab from './detail_tabs/RelationshipsTab';
import BillingTab from './detail_tabs/BillingTab';
import AuditLogTab from './detail_tabs/AuditLogTab';

interface ContactDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ isOpen, onClose, contact }) => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();
    const [activeTab, setActiveTab] = useState('Profile');

    const tabs = [
        'Profile',
        'History',
        industryConfig.ordersTabName,
        'Billing',
        industryConfig.enrollmentsTabName,
        industryConfig.structuredRecordTabName,
        'Relationships',
        'Audit Log'
    ];

    const renderContent = () => {
        const isReadOnly = false; // Add logic based on permissions if needed
        switch (activeTab) {
            case 'Profile':
                return <ProfileTab contact={contact} isReadOnly={isReadOnly} />;
            case 'History':
                return <HistoryTab contact={contact} />;
            case industryConfig.ordersTabName:
                return <OrdersTab contact={contact} isReadOnly={isReadOnly} />;
            case 'Billing':
                 return <BillingTab contact={contact} isReadOnly={isReadOnly} />;
            case industryConfig.enrollmentsTabName:
                return <EnrollmentsTab contact={contact} isReadOnly={isReadOnly} />;
            case industryConfig.structuredRecordTabName:
                return <StructuredRecordsTab contact={contact} isReadOnly={isReadOnly} />;
            case 'Relationships':
                return <RelationshipsTab contact={contact} isReadOnly={isReadOnly} />;
            case 'Audit Log':
                 return <AuditLogTab contact={contact} />;
            default:
                return null;
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${industryConfig.contactName}: ${contact.contactName}`} size="5xl">
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-6">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default ContactDetailModal;
