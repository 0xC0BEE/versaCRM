import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';
import { Deal, DealStage, AnyContact } from '../../types';
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
        dealStagesQuery, 
        contactsQuery,
        createDealMutation, 
        updateDealMutation, 
        deleteDealMutation 
    } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !deal;

    const { data: stages = [] } = dealStagesQuery;
    const { data: contacts = [] } = contactsQuery;

    const initialState = useMemo(() => {
        const sortedStages = [...stages].sort((a, b) => a.order - b.order);
        return {
            name: '',
            value: 0,
            stageId: sortedStages.length > 0 ? sortedStages[0].id : '',
            contactId: '',
            expectedCloseDate: new Date().toISOString().split('T')[0],
        };
    }, [stages]);

    const { formData, handleChange, setFormData } = useForm(initialState, deal);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.contactId) {
            toast.error("Deal Name and associated Contact are required.");
            return;
        }
        if (formData.value < 0) {
            toast.error("Deal value cannot be negative.");
            return;
        }

        if (isNew) {
            createDealMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId!,
            }, {
                onSuccess: () => onClose()
            });
        } else {
            updateDealMutation.mutate({ ...deal!, ...formData }, {
                onSuccess: () => onClose()
            });
        }
    };

    const handleDelete = () => {
        if (deal && window.confirm(`Are you sure you want to delete the deal "${deal.name}"?`)) {
            deleteDealMutation.mutate(deal.id, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createDealMutation.isPending || updateDealMutation.isPending || deleteDealMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Deal' : `Edit Deal: ${deal?.name}`}>
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
                        min="0"
                        value={formData.value}
                        onChange={e => handleChange('value', parseFloat(e.target.value) || 0)}
                        disabled={isPending}
                    />
                    <Select id="deal-stage" label="Stage" value={formData.stageId} onChange={e => handleChange('stageId', e.target.value)}>
                        {stages.map((s: DealStage) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select id="deal-contact" label="Associated Contact" value={formData.contactId} onChange={e => handleChange('contactId', e.target.value)} required>
                        <option value="">Select a contact...</option>
                        {contacts.map((c: AnyContact) => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                    </Select>
                    <Input
                        id="deal-close-date"
                        label="Expected Close Date"
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={e => handleChange('expectedCloseDate', e.target.value)}
                        disabled={isPending}
                    />
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
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Deal'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DealEditModal;