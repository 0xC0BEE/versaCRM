import React, { useState, useEffect } from 'react';
import { CustomObjectDefinition, CustomField } from '../../types';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import CustomFieldEditModal from './CustomFieldEditModal';

interface CustomObjectFieldBuilderProps {
    definition: CustomObjectDefinition;
    onBack: () => void;
}

const CustomObjectFieldBuilder: React.FC<CustomObjectFieldBuilderProps> = ({ definition, onBack }) => {
    const { updateCustomObjectDefMutation } = useData();
    const [fields, setFields] = useState<CustomField[]>(definition.fields || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<CustomField | null>(null);

    useEffect(() => {
        setFields(definition.fields || []);
    }, [definition]);

    const handleSave = (newFields: CustomField[]) => {
        updateCustomObjectDefMutation.mutate({ ...definition, fields: newFields });
    };

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
            handleSave(newFields);
        }
    };

    const handleSaveField = (fieldData: CustomField) => {
        let newFields;
        if (selectedField) {
            newFields = fields.map(f => (f.id === fieldData.id ? fieldData : f));
        } else {
            newFields = [...fields, { ...fieldData, id: `custom_${Date.now()}` }];
        }
        handleSave(newFields);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                     <Button variant="secondary" size="sm" onClick={onBack} leftIcon={<ArrowLeft size={14} />} className="mb-2">
                        Back to Objects
                    </Button>
                    <h3 className="text-lg font-semibold">Manage Fields for "{definition.namePlural}"</h3>
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
                            <Button size="sm" variant="danger" onClick={() => handleDeleteField(field.id)} leftIcon={<Trash2 size={14} />} disabled={updateCustomObjectDefMutation.isPending}>Delete</Button>
                        </div>
                    </div>
                ))}
                {fields.length === 0 && (
                    <p className="text-sm text-text-secondary py-4">No custom fields defined for this object yet.</p>
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

export default CustomObjectFieldBuilder;