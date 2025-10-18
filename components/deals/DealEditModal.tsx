import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Deal, DealStage, AnyContact, User, CustomObjectDefinition, CustomObjectRecord, ApprovalStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Trash2, Wand2, FileText, Check, X, UserCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useDebounce } from '../../hooks/useDebounce';
import DocumentGenerationModal from '../documents/DocumentGenerationModal';
import { useApp } from '../../contexts/AppContext';
import Tabs from '../ui/Tabs';
import RevenueRecognitionTab from './RevenueRecognitionTab';

interface DealEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: Deal | null;
}

const DealEditModal: React.FC<DealEditModalProps> = ({ isOpen, onClose, deal }) => {
    const { 
        contactsQuery, 
        teamMembersQuery, 
        dealStagesQuery, 
        customObjectDefsQuery,
        organizationSettingsQuery,
        createDealMutation,
        updateDealMutation,
        deleteDealMutation
    } = useData();
    const { authenticatedUser } = useAuth();
    const { isFeatureEnabled } = useApp();
    const isNew = !deal;

    const { data: contacts = [] } = contactsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: dealStages = [] } = dealStagesQuery;
    const { data: customObjectDefs = [] } = customObjectDefsQuery;
    const { data: settings } = organizationSettingsQuery;
    
    const allRecordsQuery = useData().customObjectRecordsQuery(null); // Fetch all for suggestions
    const { data: allRecords = [] } = allRecordsQuery;


    const [selectedDefId, setSelectedDefId] = useState(deal?.relatedObjectDefId || '');
    const { data: relatedRecords = [] } = useData().customObjectRecordsQuery(selectedDefId);

    const [aiSuggestion, setAiSuggestion] = useState<{ defId: string, recordId: string, recordName: string } | null>(null);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Details');

    const initialState = useMemo(() => ({
        name: '',
        value: 0,
        contactId: '',
        stageId: (dealStages as DealStage[])[0]?.id || '',
        assignedToId: '',
        expectedCloseDate: new Date().toISOString().split('T')[0],
        relatedObjectDefId: '',
        relatedObjectRecordId: '',
    }), [dealStages]);

    const formDependency = useMemo(() => {
        if (!deal) return null;
        return {
            ...initialState,
            ...deal,
            expectedCloseDate: format(new Date(deal.expectedCloseDate), 'yyyy-MM-dd'),
        };
    }, [deal, initialState]);

    const { formData, handleChange, setFormData } = useForm(initialState, formDependency);
    
    const debouncedDealName = useDebounce(formData.name, 500);

    const generateSuggestion = useCallback(async (dealName: string) => {
        if (!dealName.trim() || !allRecords || allRecords.length === 0) {
            setAiSuggestion(null);
            return;
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            
            const recordsWithPrimaryField = allRecords.map((rec: CustomObjectRecord) => {
                const def = customObjectDefs.find((d: CustomObjectDefinition) => d.id === rec.objectDefId);
                const primaryFieldId = def?.fields[0]?.id;
                return {
                    defId: rec.objectDefId,
                    recordId: rec.id,
                    name: primaryFieldId ? rec.fields[primaryFieldId] : 'Unnamed Record'
                };
            }).filter((rec: {name: string}) => rec.name !== 'Unnamed Record');

            if (recordsWithPrimaryField.length === 0) return;

            const prompt = `From the deal name "${dealName}", find the best matching record from this list: ${JSON.stringify(recordsWithPrimaryField)}. Respond with ONLY the JSON object for the single best match, or an empty JSON object {} if no good match is found.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const text = response.text;
            // Clean the response to remove markdown code block fences before parsing
            const cleanedText = text.trim().replace(/^```json\s*/, '').replace(/```$/, '').trim();
            const match = JSON.parse(cleanedText);
            
            if (match.recordId) {
                setAiSuggestion({ ...match, recordName: match.name });
            } else {
                setAiSuggestion(null);
            }
        } catch (error) {
            console.error("AI Suggestion error:", error);
            setAiSuggestion(null);
        }

    }, [allRecords, customObjectDefs]);

    useEffect(() => {
        if (isNew && isOpen && isFeatureEnabled('aiRecordLinking')) {
            generateSuggestion(debouncedDealName);
        }
    }, [debouncedDealName, isNew, isOpen, generateSuggestion, isFeatureEnabled]);


    useEffect(() => {
        if (deal?.relatedObjectDefId) {
            setSelectedDefId(deal.relatedObjectDefId);
        }
         if (!isOpen) { // Reset suggestion on close
            setAiSuggestion(null);
        } else {
            setActiveTab('Details'); // Reset to details tab on open
        }
    }, [deal, isOpen]);

    const handleDefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDefId = e.target.value;
        setSelectedDefId(newDefId);
        handleChange('relatedObjectDefId', newDefId);
        handleChange('relatedObjectRecordId', ''); // Reset record selection
    };
    
    const applyAiSuggestion = () => {
        if (aiSuggestion) {
            setSelectedDefId(aiSuggestion.defId);
            setFormData(prev => ({
                ...prev,
                relatedObjectDefId: aiSuggestion.defId,
                relatedObjectRecordId: aiSuggestion.recordId,
            }));
            setAiSuggestion(null);
            toast.success("AI suggestion applied!");
        }
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.contactId) {
            toast.error("Deal Name and Contact are required.");
            return;
        }

        const dealData = {
            ...formData,
            value: Number(formData.value),
            organizationId: authenticatedUser!.organizationId!,
        };
        
        const wonStageId = (dealStages as DealStage[]).find(s => s.name === 'Won')?.id;
        const isMovingToWon = dealData.stageId === wonStageId && deal?.stageId !== wonStageId;

        if (isNew) {
            createDealMutation.mutate(dealData, { onSuccess: onClose });
        } else {
            updateDealMutation.mutate({ ...deal!, ...dealData }, { 
                onSuccess: () => {
                    if (isMovingToWon && settings?.accounting?.isConnected) {
                        toast.success(`Invoice created in QuickBooks for "${dealData.name}"`);
                    }
                    onClose();
                }
            });
        }
    };

    const handleDelete = () => {
        if (deal && window.confirm(`Are you sure you want to delete the deal "${deal.name}"?`)) {
            deleteDealMutation.mutate(deal.id, { onSuccess: onClose });
        }
    };

    const handleApprovalAction = (status: 'Approved' | 'Rejected') => {
        if (!deal) return;
        updateDealMutation.mutate({ ...deal, approvalStatus: status, currentApproverId: undefined }, {
            onSuccess: () => {
                toast.success(`Deal ${status.toLowerCase()}!`);
                onClose();
            }
        });
    };
    
    const isPending = createDealMutation.isPending || updateDealMutation.isPending || deleteDealMutation.isPending;
    const primaryFieldId = (customObjectDefs as CustomObjectDefinition[]).find(d => d.id === selectedDefId)?.fields[0]?.id;

    const isPendingMyApproval = deal?.approvalStatus === 'Pending Approval' && deal?.currentApproverId === authenticatedUser?.id;

    const wonStageId = (dealStages as DealStage[]).find(s => s.name.toLowerCase().includes('won'))?.id;
    const isWon = formData.stageId === wonStageId;

    const modalTabs = isNew ? [] : isWon ? ['Details', 'Revenue Recognition'] : ['Details'];

    const DetailsTab = () => (
        <>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <Input id="deal-name" label="Deal Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="deal-value" label="Value" type="number" value={formData.value} onChange={e => handleChange('value', e.target.value)} disabled={isPending} />
                    <Input id="deal-close-date" label="Expected Close Date" type="date" value={formData.expectedCloseDate} onChange={e => handleChange('expectedCloseDate', e.target.value)} required disabled={isPending} />
                </div>
                <Select id="deal-contact" label="Contact" value={formData.contactId} onChange={e => handleChange('contactId', e.target.value)} required disabled={isPending}>
                    <option value="">Select a contact...</option>
                    {(contacts as AnyContact[]).map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select id="deal-stage" label="Stage" value={formData.stageId} onChange={e => handleChange('stageId', e.target.value)} required disabled={isPending}>
                        {(dealStages as DealStage[]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                    <Select id="deal-assignee" label="Assigned To" value={formData.assignedToId} onChange={e => handleChange('assignedToId', e.target.value)} disabled={isPending}>
                        <option value="">Unassigned</option>
                        {(teamMembers as User[]).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                </div>
                <div className="pt-4 border-t border-border-subtle">
                    <label className="block text-sm font-medium text-text-primary mb-1">Link to Record (Optional)</label>
                    {aiSuggestion && (
                        <div className="p-2 mb-2 bg-primary/10 rounded-md flex items-center justify-between">
                            <p className="text-sm text-primary flex items-center gap-2"><Wand2 size={16}/> AI Suggestion: Link to "{aiSuggestion.recordName}"?</p>
                            <Button size="sm" onClick={applyAiSuggestion}>Link Now</Button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select id="related-object-def" label="" value={formData.relatedObjectDefId} onChange={handleDefChange}>
                            <option value="">Select Object Type...</option>
                            {(customObjectDefs as CustomObjectDefinition[]).map(def => <option key={def.id} value={def.id}>{def.nameSingular}</option>)}
                        </Select>
                        {selectedDefId && (
                            <Select id="related-object-record" label="" value={formData.relatedObjectRecordId} onChange={e => handleChange('relatedObjectRecordId', e.target.value)} disabled={relatedRecords.isLoading}>
                                <option value="">Select Record...</option>
                                {primaryFieldId && (relatedRecords as CustomObjectRecord[]).map(rec => (
                                    <option key={rec.id} value={rec.id}>{rec.fields[primaryFieldId]}</option>
                                ))}
                            </Select>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                            {deleteDealMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2">
                     {!isNew && (
                        <Button variant="secondary" onClick={() => setIsGeneratorOpen(true)} leftIcon={<FileText size={16} />}>
                            Generate Document
                        </Button>
                    )}
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Deal'}</Button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Modal isOpen={isOpen && !isGeneratorOpen} onClose={onClose} title={isNew ? 'Create New Deal' : `Edit Deal: ${deal?.name}`} size="3xl">
                {isPendingMyApproval && (
                    <div className="p-3 mb-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg flex items-center justify-between">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">This deal is awaiting your approval.</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="success" onClick={() => handleApprovalAction('Approved')} leftIcon={<Check size={14}/>}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => handleApprovalAction('Rejected')} leftIcon={<X size={14}/>}>Reject</Button>
                        </div>
                    </div>
                )}
                
                {modalTabs.length > 0 && (
                    <div className="mb-4 border-b border-border-subtle">
                        <Tabs tabs={modalTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                )}

                {activeTab === 'Details' && <DetailsTab />}
                {activeTab === 'Revenue Recognition' && deal && <RevenueRecognitionTab deal={deal} />}
                
            </Modal>

            {deal && isGeneratorOpen && (
                <DocumentGenerationModal
                    isOpen={isGeneratorOpen}
                    onClose={() => setIsGeneratorOpen(false)}
                    deal={deal}
                    contact={(contacts as AnyContact[]).find(c => c.id === deal.contactId)}
                />
            )}
        </>
    );
};

export default DealEditModal;