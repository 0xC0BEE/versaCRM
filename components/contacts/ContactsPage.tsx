import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Bot, Sparkles, Loader } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AnyContact, ContactStatus, ContactChurnPrediction, DataHygieneSuggestion } from '../../types';
import ContactsTable from '../organizations/ContactsTable';
import ContactDetailModal from '../organizations/ContactDetailModal';
import ContactFilterBar from '../organizations/ContactFilterBar';
import BulkActionsToolbar from './BulkActionsToolbar';
import BulkStatusUpdateModal from './BulkStatusUpdateModal';
import { useAuth } from '../../contexts/AuthContext';
import ChurnPredictionModal from '../organizations/ChurnPredictionModal';
import { GoogleGenAI, Type } from '@google/genai';
import toast from 'react-hot-toast';
import DataHygieneModal from './DataHygieneModal';
import { useApp } from '../../contexts/AppContext';

interface ContactsPageProps {
    isTabbedView?: boolean;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ isTabbedView = false }) => {
    const { industryConfig, contactFilters, isFeatureEnabled, initialRecordLink, setInitialRecordLink } = useApp();
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
    const [isChurning, setIsChurning] = useState(false);
    const [churnModalData, setChurnModalData] = useState<{contact: AnyContact, prediction: ContactChurnPrediction} | null>(null);

    const [isHygieneModalOpen, setIsHygieneModalOpen] = useState(false);
    const [hygieneResults, setHygieneResults] = useState<DataHygieneSuggestion | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleRowClick = (contact: AnyContact) => {
        setSelectedContact(contact);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        if (initialRecordLink?.page === 'Contacts' && initialRecordLink.recordId && contacts.length > 0) {
            const contactToOpen = (contacts as AnyContact[]).find(c => c.id === initialRecordLink.recordId);
            if (contactToOpen) {
                handleRowClick(contactToOpen);
            }
            setInitialRecordLink(null); // Clear after use
        }
    }, [initialRecordLink, contacts, setInitialRecordLink]);

    const filteredContacts = useMemo(() => {
        if (!contactFilters || contactFilters.length === 0) {
            return contacts;
        }
        return contacts.filter((contact: AnyContact) => {
            return contactFilters.every(filter => {
                const contactValue = String((contact as any)[filter.field] || '').toLowerCase();
                const filterValue = String(filter.value).toLowerCase();
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


    const handleAdd = () => {
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
            updateContactMutation.mutate(contactData);
        } else {
            createContactMutation.mutate(contactData);
        }
    };
    
    useEffect(() => {
        if (createContactMutation.isSuccess || updateContactMutation.isSuccess || deleteContactMutation.isSuccess) {
            setIsDetailModalOpen(false);
            createContactMutation.reset();
            updateContactMutation.reset();
            deleteContactMutation.reset();
        }
    }, [createContactMutation.isSuccess, updateContactMutation.isSuccess, deleteContactMutation.isSuccess, createContactMutation, updateContactMutation, deleteContactMutation]);
    
    const handleDelete = (contactId: string) => {
        deleteContactMutation.mutate(contactId);
    };
    
    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedContactIds.size} contacts?`)) {
            bulkDeleteContactsMutation.mutate(Array.from(selectedContactIds));
        }
    };

    useEffect(() => {
        if (bulkDeleteContactsMutation.isSuccess) {
            setSelectedContactIds(new Set());
            bulkDeleteContactsMutation.reset();
        }
    }, [bulkDeleteContactsMutation.isSuccess, bulkDeleteContactsMutation.reset]);

    const handleBulkStatusUpdate = (status: ContactStatus) => {
        bulkUpdateContactStatusMutation.mutate({ ids: Array.from(selectedContactIds), status });
    };

    useEffect(() => {
        if (bulkUpdateContactStatusMutation.isSuccess) {
            setIsStatusModalOpen(false);
            setSelectedContactIds(new Set());
            bulkUpdateContactStatusMutation.reset();
        }
    }, [bulkUpdateContactStatusMutation.isSuccess, bulkUpdateContactStatusMutation.reset]);
    
    const handleOpenChurnPrediction = (contact: AnyContact, prediction: ContactChurnPrediction) => {
        setChurnModalData({ contact, prediction });
    };

    const handleAnalyzeDataHygiene = async () => {
        setIsAnalyzing(true);
        toast.promise(
            (async () => {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                const contactSample = (contacts as AnyContact[]).slice(0, 50).map(c => ({ id: c.id, name: c.contactName, email: c.email, phone: c.phone }));
                const prompt = `You are a data hygiene expert for a CRM. Analyze this list of contacts: ${JSON.stringify(contactSample)}.
    Identify potential duplicate contacts and contacts with formatting issues.
    
    Your response MUST be a JSON object with two keys: 'duplicates' and 'formatting'.
    - 'duplicates': An array of arrays, where each inner array contains the IDs of contacts that are likely duplicates of each other. Group them based on similar names, emails, etc.
    - 'formatting': An array of objects for contacts that need formatting fixes. Each object should have 'contactId', 'contactName', 'suggestion' (a brief explanation of the issue), 'field' (the field to change, e.g., 'contactName'), and 'newValue' (the corrected value). Only suggest fixes for obviously incorrect formatting, like all-lowercase names.`;
    
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                duplicates: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                formatting: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            contactId: { type: Type.STRING },
                                            contactName: { type: Type.STRING },
                                            suggestion: { type: Type.STRING },
                                            field: { type: Type.STRING },
                                            newValue: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                
                const results = JSON.parse(response.text);
                setHygieneResults(results);
                setIsHygieneModalOpen(true);
            })(),
            {
                loading: 'AI is analyzing your contact data...',
                success: 'Analysis complete!',
                error: 'AI analysis failed. Please try again.',
            }
        ).finally(() => setIsAnalyzing(false));
    };

    const isMutationLoading = createContactMutation.isPending || updateContactMutation.isPending;

    const pageContent = (
         <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-text-heading">{industryConfig.contactNamePlural}</h1>
                    <div className="flex items-center gap-2">
                        {isFeatureEnabled('aiDataHygiene') && (
                            <Button
                                variant='secondary'
                                onClick={handleAnalyzeDataHygiene}
                                leftIcon={isAnalyzing ? <Loader size={16} className="animate-spin"/> : <Sparkles size={16} />}
                                disabled={isAnalyzing}
                            >
                                AI Data Hygiene
                            </Button>
                        )}
                        {isFeatureEnabled('aiPredictiveForecasting') && (
                            <Button
                                variant={isChurning ? 'primary' : 'secondary'}
                                onClick={() => setIsChurning(!isChurning)}
                                leftIcon={<Bot size={16} />}
                            >
                                AI Churn Risk
                            </Button>
                        )}
                        <Button onClick={handleAdd} leftIcon={<Plus size={16} />} data-tour-id="contacts-new-button">
                            New {industryConfig.contactName}
                        </Button>
                    </div>
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
                        isChurning={isChurning}
                        onOpenChurnPrediction={handleOpenChurnPrediction}
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
            {churnModalData && (
                <ChurnPredictionModal
                    isOpen={!!churnModalData}
                    onClose={() => setChurnModalData(null)}
                    contact={churnModalData.contact}
                    prediction={churnModalData.prediction}
                />
            )}
            {hygieneResults && (
                <DataHygieneModal
                    isOpen={isHygieneModalOpen}
                    onClose={() => setIsHygieneModalOpen(false)}
                    initialResults={hygieneResults}
                />
            )}
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