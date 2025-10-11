import React, { useState, useMemo, useEffect } from 'react';
import { AnyContact, Interaction, NextBestAction } from '../../types';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
import ProfileTab from './detail_tabs/ProfileTab';
import HistoryTab from './detail_tabs/HistoryTab';
import OrdersTab from './detail_tabs/OrdersTab';
import EnrollmentsTab from './detail_tabs/EnrollmentsTab';
import BillingTab from './detail_tabs/BillingTab';
import RelationshipsTab from './detail_tabs/RelationshipsTab';
import AuditLogTab from './detail_tabs/AuditLogTab';
import StructuredRecordsTab from './detail_tabs/StructuredRecordsTab';
import DocumentsTab from './detail_tabs/DocumentsTab';
import WebsiteActivityTab from './detail_tabs/WebsiteActivityTab';
import { useApp } from '../../contexts/AppContext';
import EmailTab from './detail_tabs/EmailTab';
import NextBestActionDisplay from './NextBestActionDisplay';
import { useData } from '../../contexts/DataContext';
import JourneyTab from './detail_tabs/JourneyTab';

interface ContactDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact | null;
    onSave: (contact: AnyContact) => void;
    onDelete: (contactId: string) => void;
    isSaving: boolean;
    isDeleting: boolean;
    initialActiveTab?: string;
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
    initialActiveTab,
    initialTemplateId,
}) => {
    const { industryConfig, setCallContact, setIsCallModalOpen } = useApp();
    const [activeTab, setActiveTab] = useState(initialActiveTab || 'Profile');
    const [emailTemplateId, setEmailTemplateId] = useState<string | undefined>(initialTemplateId);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialActiveTab || 'Profile');
            setEmailTemplateId(initialTemplateId);
        }
    }, [isOpen, initialActiveTab, initialTemplateId]);


    const handleTakeAction = (action: NextBestAction) => {
        if (action.action === 'Call') {
            if(contact) {
                setCallContact(contact);
                setIsCallModalOpen(true);
            }
        } else if (action.action === 'Email' && action.templateId) {
            setEmailTemplateId(action.templateId);
            setActiveTab('Email');
        }
    };

    const tabs = useMemo(() => {
        const coreTabs = ['Profile', 'Journey', 'History', industryConfig.ordersTabName, industryConfig.enrollmentsTabName, 'Billing', 'Email', 'Documents'];
        if(industryConfig.structuredRecordTypes.length > 0) {
            coreTabs.splice(3, 0, industryConfig.structuredRecordTabName);
        }
        
        const hasWebsiteActivity = contact?.interactions?.some(i => i.type === 'Site Visit');
        if (hasWebsiteActivity) {
            coreTabs.push('Website Activity');
        }
        coreTabs.push('Audit Log');
        return coreTabs;

    }, [industryConfig, contact]);


    const renderTabContent = () => {
        if (!contact) return null;

        switch (activeTab) {
            case 'Profile':
                return <ProfileTab contact={contact} onSave={onSave} onDelete={onDelete} isSaving={isSaving} isDeleting={isDeleting} />;
            case 'Journey':
                return <JourneyTab contact={contact} />;
            case 'History':
                return <HistoryTab contact={contact} />;
            case industryConfig.ordersTabName:
                return <OrdersTab contact={contact} isReadOnly={false} />;
            case industryConfig.enrollmentsTabName:
                return <EnrollmentsTab contact={contact} isReadOnly={false}/>;
            case industryConfig.structuredRecordTabName:
                return <StructuredRecordsTab contact={contact} isReadOnly={false} />;
            case 'Billing':
                return <BillingTab contact={contact} isReadOnly={false} />;
            case 'Email':
                return <EmailTab contact={contact} initialTemplateId={emailTemplateId} />;
            case 'Documents':
                return <DocumentsTab contact={contact} isReadOnly={false} />;
            case 'Website Activity':
                return <WebsiteActivityTab contact={contact} />;
            case 'Audit Log':
                return <AuditLogTab contact={contact} />;
            default:
                return null;
        }
    };

    if (!contact) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={contact.id ? `${industryConfig.contactName}: ${contact.contactName}` : `New ${industryConfig.contactName}`}
            size="5xl"
        >
            <div className="space-y-4">
                 {contact.id && <NextBestActionDisplay contact={contact} onTakeAction={handleTakeAction} />}
                 <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                {renderTabContent()}
            </div>
        </Modal>
    );
};

export default ContactDetailModal;