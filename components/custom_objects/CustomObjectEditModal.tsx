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
        const initialFields: Record<string, any> = {};
        definition.fields.forEach(field => {
            initialFields[field.id] = '';
        });
        return { fields: initialFields };
    }, [definition.fields]);

    const { formData, handleChange, setFormData } = useForm(initialState, record);

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
        // Basic validation: check if the first field (usually primary) is filled
        if (definition.fields.length > 0) {
            const primaryFieldId = definition.fields[0].id;
            if (!formData.fields[primaryFieldId] || String(formData.fields[primaryFieldId]).trim() === '') {
                toast.error(`"${definition.fields[0].label}" is required.`);
                return;
            }
        }
        
        const recordData = {
            ...formData,
            organizationId: authenticatedUser!.organizationId,
            objectDefId: definition.id,
        };

        if (isNew) {
            createCustomObjectRecordMutation.mutate(recordData as any, { onSuccess: onClose });
        } else {
            updateCustomObjectRecordMutation.mutate({ ...record!, ...recordData }, { onSuccess: onClose });
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
            case 'textarea': return <Textarea {...props} />;
            case 'select': return (
                <Select {...props}>
                    <option value="">-- Select --</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
            );
            default: return <Input {...props} type={field.type} />;
        }
    };
    
    const renderFieldsByLayout = () => {
        const { layout, fields } = definition;

        if (!layout || layout.length === 0) {
            // Fallback to default rendering if no layout is defined
            return fields.map(field => renderField(field));
        }

        const renderedFieldIds = new Set<string>();

        const layoutElements = layout.map(section => {
            if (section.fields.length === 0) return null;
            
            const sectionFields = fields.filter(f => section.fields.includes(f.id));
            sectionFields.forEach(f => renderedFieldIds.add(f.id));
            if (sectionFields.length === 0) return null;

            return (
                <div key={section.id} className="pt-4 border-t border-border-subtle first:pt-0 first:border-none">
                    <h4 className="font-semibold text-text-primary mb-2">{section.title}</h4>
                    <div className="space-y-4">
                        {sectionFields.map(field => renderField(field))}
                    </div>
                </div>
            );
        });

        const unassignedFields = fields.filter(f => !renderedFieldIds.has(f.id));
        let unassignedElement = null;
        if (unassignedFields.length > 0) {
            unassignedElement = (
                <div key="unassigned-section" className="pt-4 border-t border-border-subtle">
                    <h4 className="font-semibold text-text-primary mb-2">Other Fields</h4>
                    <div className="space-y-4">
                        {unassignedFields.map(field => renderField(field))}
                    </div>
                </div>
            );
        }

        return (
            <>
                {layoutElements}
                {unassignedElement}
            </>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? `New ${definition.nameSingular}` : `Edit ${definition.nameSingular}`}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {renderFieldsByLayout()}
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
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomObjectEditModal;