


import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected the import path for types to be a valid relative path.
import { CustomField } from '../../types';
import Button from '../ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CustomFieldEditModal from './CustomFieldEditModal';

const FormBuilder: React.FC = () => {
    const { industryConfig, currentIndustry } = useApp();
    const { updateCustomFieldsMutation } = useData();

    // Local state to manage edits before saving
    const [fields, setFields] = useState<CustomField[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<CustomField | null>(null);

    // Sync local state with fetched config
    useEffect(() => {
        setFields(industryConfig.customFields);
    }, [industryConfig]);

    const handleAddField = () => {
        setSelectedField(null);
        setIsModalOpen(true);
    };

    const handleEditField = (field: CustomField) => {
        setSelectedField(field);
        setIsModalOpen(true);
    };

    const handleDeleteField = (fieldId: string) => {
        if (window.confirm("Are you sure you want to delete this field? This will be saved immediately.")) {
            const newFields = fields.filter(f => f.id !== fieldId);
            updateCustomFieldsMutation.mutate({ industry: currentIndustry, fields: newFields });
        }
    };

    const handleSaveField = (fieldData: CustomField) => {
        let newFields;
        if (selectedField) {
            // Update existing field
            newFields = fields.map(f => (f.id === fieldData.id ? fieldData : f));
        } else {
            // Add new field
            newFields = [...fields, { ...fieldData, id: `custom_${Date.now()}` }];
        }
        updateCustomFieldsMutation.mutate({ industry: currentIndustry, fields: newFields }, {
            onSuccess: () => {
                setIsModalOpen(false);
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Customize Contact Fields</h3>
                    <p className="text-sm text-text-secondary">Add or edit fields for the <span className="font-semibold">{currentIndustry}</span> industry.</p>
                </div>
                <Button size="sm" onClick={handleAddField} leftIcon={<Plus size={14} />}>
                    Add Field
                </Button>
            </div>

            <div className="space-y-3">
                {fields.map(field => (
                    <div key={field.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{field.label}</p>
                            <p className="text-xs text-text-secondary capitalize">{field.type}</p>
                        </div>
                        <div className="space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleEditField(field)} leftIcon={<Edit size={14} />}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteField(field.id)} leftIcon={<Trash2 size={14} />} disabled={updateCustomFieldsMutation.isPending}>Delete</Button>
                        </div>
                    </div>
                ))}
                {fields.length === 0 && (
                    <p className="text-sm text-text-secondary py-4">No custom fields defined for this industry.</p>
                )}
            </div>
            
            <CustomFieldEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                field={selectedField}
                onSave={handleSaveField}
            />
        </div>
    );
};

export default FormBuilder;