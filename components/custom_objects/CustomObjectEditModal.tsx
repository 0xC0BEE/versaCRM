import React, { useMemo } from 'react';
import { CustomObjectDefinition, CustomObjectRecord, CustomField } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2 } from 'lucide-react';

interface CustomObjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    definition: CustomObjectDefinition;
    record: CustomObjectRecord | null;
}

const CustomObjectEditModal: React.FC<CustomObjectEditModalProps> = ({ isOpen, onClose, definition, record }) => {
    const { createCustomObjectRecordMutation, updateCustomObjectRecordMutation, deleteCustomObjectRecordMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !record;

    const initialState = useMemo(() => {
        const initialFields = definition.fields.reduce((acc, field) => {
            acc[field.id] = '';
            return acc;
        }, {} as Record<string, any>);
        
        return { fields: initialFields };
    }, [definition]);
    
    // Create dependency for useForm hook
    const formDependency = useMemo(() => (record ? { fields: record.fields } : null), [record]);

    const { formData, handleChange, setFormData } = useForm(initialState, formDependency);

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldId]: value,
            }
        }));
    };

    const handleSave = () => {
        // Basic validation: Check if the first required field is filled
        const firstRequiredField = definition.fields.find(f => f.type !== 'checkbox'); // Simple assumption
        if (firstRequiredField && !formData.fields[firstRequiredField.id]?.trim()) {
            toast.error(`Field "${firstRequiredField.label}" is required.`);
            return;
        }

        if (isNew) {
            createCustomObjectRecordMutation.mutate({
                objectDefId: definition.id,
                organizationId: authenticatedUser!.organizationId,
                fields: formData.fields,
            }, { onSuccess: onClose });
        } else {
            updateCustomObjectRecordMutation.mutate({ ...record!, fields: formData.fields }, { onSuccess: onClose });
        }
    };

    const handleDelete = () => {
        if (record && window.confirm("Are you sure you want to delete this record?")) {
            deleteCustomObjectRecordMutation.mutate(record.id, { onSuccess: onClose });
        }
    };

    const isPending = createCustomObjectRecordMutation.isPending || updateCustomObjectRecordMutation.isPending || deleteCustomObjectRecordMutation.isPending;

    const renderField = (field: CustomField) => {
        const value = formData.fields[field.id] || '';
        const props = {
            key: field.id,
            id: field.id,
            label: field.label,
            value: value,
            onChange: (e: React.ChangeEvent<any>) => handleFieldChange(field.id, e.target.value),
            disabled: isPending,
        };
        switch (field.type) {
            case 'textarea':
                return <Textarea {...props} rows={4} />;
            case 'select': return (
                <Select {...props}>
                    <option value="">-- Select --</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
            );
            default:
                return <Input {...props} type={field.type} />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? `New ${definition.nameSingular}` : `Edit ${definition.nameSingular}`}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {definition.fields.map(field => renderField(field))}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                            {deleteCustomObjectRecordMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomObjectEditModal;