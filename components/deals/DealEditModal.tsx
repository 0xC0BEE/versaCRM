import React, { useMemo, useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';
import { Deal, DealStage, AnyContact, User, CustomObjectDefinition, CustomObjectRecord } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { Trash2 } from 'lucide-react';

interface DealEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: Deal | null;
}

const DealEditModal: React.FC<DealEditModalProps> = ({ isOpen, onClose, deal }) => {
    const { 
        createDealMutation, 
        updateDealMutation, 
        deleteDealMutation, 
        dealStagesQuery, 
        contactsQuery, 
        teamMembersQuery,
        customObjectDefsQuery
    } = useData();
    const { authenticatedUser } = useAuth();
    const { data: stages = [] } = dealStagesQuery;
    const { data: contacts = [] } = contactsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: customObjectDefs = [] } = customObjectDefsQuery;
    const isNew = !deal;
    
    const [selectedDefId, setSelectedDefId] = useState(deal?.relatedObjectDefId || '');
    const { data: relatedRecords = [] } = useData().customObjectRecordsQuery(selectedDefId);


    const initialState = useMemo(() => ({
        name: '',
        value: 0,
        stageId: stages[0]?.id || '',
        contactId: '',
        expectedCloseDate: new Date().toISOString().split('T')[0],
        assignedToId: authenticatedUser?.id,
        relatedObjectDefId: '',
        relatedObjectRecordId: '',
    }), [stages, authenticatedUser]);

    const formDependency = useMemo(() => (deal ? { ...initialState, ...deal } : null), [deal, initialState]);

    const { formData, handleChange } = useForm(initialState, formDependency);
    
    useEffect(() => {
        if (deal?.relatedObjectDefId) {
            setSelectedDefId(deal.relatedObjectDefId);
        }
    }, [deal]);

    const handleDefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDefId = e.target.value;
        setSelectedDefId(newDefId);
        handleChange('relatedObjectDefId', newDefId);
        handleChange('relatedObjectRecordId', ''); // Reset record selection
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.contactId) {
            toast.error("Deal Name and Contact are required.");
            return;
        }

        if (isNew) {
            createDealMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId!,
            }, {
                onSuccess: onClose
            });
        } else {
            updateDealMutation.mutate({
                ...deal!,
                ...formData
            }, {
                onSuccess: onClose
            });
        }
    };
    
    const handleDelete = () => {
        if (deal && window.confirm(`Are you sure you want to delete the deal "${deal.name}"?`)) {
            deleteDealMutation.mutate(deal.id, {
                onSuccess: onClose
            });
        }
    };

    const isPending = createDealMutation.isPending || updateDealMutation.isPending || deleteDealMutation.isPending;
    const primaryFieldId = customObjectDefs.find((d: CustomObjectDefinition) => d.id === selectedDefId)?.fields[0]?.id;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Deal' : `Edit Deal: ${deal?.name}`} size="2xl">
            <div className="space-y-4">
                <Input
                    id="deal-name"
                    label="Deal Name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    required
                    disabled={isPending}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="deal-value"
                        label="Value"
                        type="number"
                        value={formData.value}
                        onChange={e => handleChange('value', parseFloat(e.target.value) || 0)}
                        required
                        disabled={isPending}
                    />
                    <Select
                        id="deal-stage"
                        label="Stage"
                        value={formData.stageId}
                        onChange={e => handleChange('stageId', e.target.value)}
                        disabled={isPending}
                    >
                        {stages.map((s: DealStage) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        id="deal-contact"
                        label="Contact"
                        value={formData.contactId}
                        onChange={e => handleChange('contactId', e.target.value)}
                        required
                        disabled={isPending}
                    >
                        <option value="">Select a contact...</option>
                        {contacts.map((c: AnyContact) => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                    </Select>
                     <Input
                        id="deal-close-date"
                        label="Expected Close Date"
                        type="date"
                        value={formData.expectedCloseDate.split('T')[0]}
                        onChange={e => handleChange('expectedCloseDate', e.target.value)}
                        disabled={isPending}
                    />
                </div>
                 <Select
                    id="deal-assigned-to"
                    label="Assigned To"
                    value={formData.assignedToId || ''}
                    onChange={e => handleChange('assignedToId', e.target.value)}
                    disabled={isPending}
                >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m: User) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>

                <div className="pt-4 border-t border-border-subtle">
                     <label className="block text-sm font-medium text-text-primary mb-1">Link to Record (Optional)</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            id="related-object-def"
                            label=""
                            value={formData.relatedObjectDefId}
                            onChange={handleDefChange}
                        >
                            <option value="">Select Object Type...</option>
                            {customObjectDefs.map((def: CustomObjectDefinition) => <option key={def.id} value={def.id}>{def.nameSingular}</option>)}
                        </Select>
                        {selectedDefId && (
                            <Select
                                id="related-object-record"
                                label=""
                                value={formData.relatedObjectRecordId}
                                onChange={e => handleChange('relatedObjectRecordId', e.target.value)}
                                disabled={relatedRecords.isLoading}
                            >
                                <option value="">Select Record...</option>
                                {primaryFieldId && relatedRecords.map((rec: CustomObjectRecord) => (
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
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Deal'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default DealEditModal;