import React, { useMemo, useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { AudienceProfile, FilterCondition } from '../../types';
import { useForm } from '../../hooks/useForm';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface ProfileDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: AudienceProfile | null;
}

const operatorOptions = [
    { id: 'is', name: 'Is' },
    { id: 'is_not', name: 'Is Not' },
    { id: 'contains', name: 'Contains' },
    { id: 'does_not_contain', name: 'Does Not Contain' },
    { id: 'gt', name: 'Greater than' },
    { id: 'lt', name: 'Less than' },
    { id: 'eq', name: 'Equal to' },
];

const availableColumns = [ 'contactName', 'email', 'phone', 'status', 'leadSource', 'leadScore' ];


const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ isOpen, onClose, profile }) => {
    const { createAudienceProfileMutation, updateAudienceProfileMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !profile;

    const initialState = useMemo(() => ({
        name: '',
        description: '',
        filters: [] as FilterCondition[],
    }), []);

    const { formData, setFormData, handleChange } = useForm(initialState, profile);

    const handleFilterChange = (index: number, field: keyof FilterCondition, value: string) => {
        const newFilters = [...formData.filters];
        (newFilters[index] as any)[field] = value;
        setFormData(prev => ({...prev, filters: newFilters}));
    };
    
    const addFilter = () => {
        setFormData(prev => ({
            ...prev,
            filters: [...prev.filters, { field: 'status', operator: 'is', value: '' }]
        }));
    };

    const removeFilter = (index: number) => {
        setFormData(prev => ({
            ...prev,
            filters: prev.filters.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            toast.error("Profile name is required.");
            return;
        }
        if (formData.filters.length === 0) {
            toast.error("At least one filter condition is required.");
            return;
        }
        
        const dataToSave = {
            ...formData,
            organizationId: authenticatedUser!.organizationId,
        };

        if (isNew) {
            createAudienceProfileMutation.mutate(dataToSave, { onSuccess: onClose });
        } else {
            updateAudienceProfileMutation.mutate({ ...profile!, ...dataToSave }, { onSuccess: onClose });
        }
    };
    
    const isPending = createAudienceProfileMutation.isPending || updateAudienceProfileMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Audience Profile' : `Edit Profile`}>
            <div className="space-y-4">
                <Input id="profile-name" label="Profile Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
                <Textarea id="profile-desc" label="Description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={2} disabled={isPending} />
                
                <div className="pt-4 border-t border-border-subtle">
                    <h4 className="font-semibold text-sm mb-2">Audience Criteria</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {formData.filters.map((filter, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Select id={`filter-field-${index}`} label="" value={filter.field} onChange={e => handleFilterChange(index, 'field', e.target.value)} className="w-1/3">
                                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                </Select>
                                <Select id={`filter-op-${index}`} label="" value={filter.operator} onChange={e => handleFilterChange(index, 'operator', e.target.value as any)} className="w-1/4">
                                    {operatorOptions.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                </Select>
                                <Input id={`filter-val-${index}`} label="" value={String(filter.value)} onChange={e => handleFilterChange(index, 'value', e.target.value)} className="flex-grow" />
                                <Button variant="secondary" size="sm" onClick={() => removeFilter(index)}><Trash2 size={14}/></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="secondary" size="sm" onClick={addFilter} leftIcon={<Plus size={14} />} className="mt-2">Add Condition</Button>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Profile'}
                </Button>
            </div>
        </Modal>
    );
};

export default ProfileDetailModal;