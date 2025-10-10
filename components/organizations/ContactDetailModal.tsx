import React, { useState, useEffect, useMemo } from 'react';
import { AnyContact, NextBestAction } from '../../types';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
import ProfileTab from './detail_tabs/ProfileTab';
import HistoryTab from './detail_tabs/HistoryTab';
import OrdersTab from './detail_tabs/OrdersTab';
import DocumentsTab from './detail_tabs/DocumentsTab';
import EmailTab from './detail_tabs/EmailTab';
import StructuredRecordsTab from './detail_tabs/StructuredRecordsTab';
import EnrollmentsTab from './detail_tabs/EnrollmentsTab';
import BillingTab from './detail_tabs/BillingTab';
import RelationshipsTab from './detail_tabs/RelationshipsTab';
import WebsiteActivityTab from './detail_tabs/WebsiteActivityTab';
import AuditLogTab from './detail_tabs/AuditLogTab';
import NextBestActionDisplay from './NextBestActionDisplay';
import { useApp } from '../../contexts/AppContext';

interface ContactDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact | null;
    onSave: (contact: AnyContact) => void;
    onDelete: (contactId: string) => void;
    isSaving: boolean;
    isDeleting: boolean;
    initialTab?: string;
    initialTemplateId?: string;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
    isOpen,
    onClose,
    contact,
    onSave,
    onDelete,
    isSaving,
    isDeleting,
    initialTab = 'Profile',
    initialTemplateId,
}) => {
    const { industryConfig, setIsCallModalOpen, setCallContact } = useApp();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setTemplateId(initialTemplateId);
        }
    }, [isOpen, initialTab, initialTemplateId]);

    const handleTakeAction = (action: NextBestAction) => {
        if (action.type === 'CALL') {
            setCallContact(contact);
            setIsCallModalOpen(true);
        }
        if (action.type === 'EMAIL' && action.details?.templateId) {
            setTemplateId(action.details.templateId);
            setActiveTab('Email');
        }
    };

    const tabs = useMemo(() => [
        'Profile', 'History', industryConfig.ordersTabName, 'Documents', 'Email', 'Website Activity',
        industryConfig.structuredRecordTabName, industryConfig.enrollmentsTabName, 'Billing', 'Relationships', 'Audit Log'
    ].filter(Boolean), [industryConfig]);

    const renderContent = () => {
        if (!contact) return null;

        switch (activeTab) {
            case 'Profile':
                return <ProfileTab contact={contact} onSave={onSave} onDelete={onDelete} isSaving={isSaving} isDeleting={isDeleting} />;
            case 'History':
                return <HistoryTab contact={contact} />;
            case industryConfig.ordersTabName:
                return <OrdersTab contact={contact} isReadOnly={false} />;
            case 'Documents':
                return <DocumentsTab contact={contact} isReadOnly={false} />;
            case 'Email':
                return <EmailTab contact={contact} initialTemplateId={templateId} />;
            case 'Website Activity':
                return <WebsiteActivityTab contact={contact} />;
            case industryConfig.structuredRecordTabName:
                return <StructuredRecordsTab contact={contact} isReadOnly={false} />;
            case industryConfig.enrollmentsTabName:
                return <EnrollmentsTab contact={contact} isReadOnly={false} />;
            case 'Billing':
                return <BillingTab contact={contact} isReadOnly={false} />;
            case 'Relationships':
                return <RelationshipsTab contact={contact} isReadOnly={false} />;
            case 'Audit Log':
                return <AuditLogTab contact={contact} />;
            default:
                return null;
        }
    };

    if (!contact) return null;
    
    const modalTitle = contact.id ? `Edit ${contact.contactName}` : `New ${industryConfig.contactName}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="5xl">
            {contact.id && ( // Only show for existing contacts
                <div className="px-6 pt-4">
                    <NextBestActionDisplay contact={contact} onTakeAction={handleTakeAction} />
                </div>
            )}
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-6">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default ContactDetailModal;