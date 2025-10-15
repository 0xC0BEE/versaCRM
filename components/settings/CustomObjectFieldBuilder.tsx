import React, { useState, useEffect } from 'react';
import { CustomObjectDefinition, CustomField, CustomObjectLayoutSection } from '../../types';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import CustomFieldEditModal from './CustomFieldEditModal';
import Tabs from '../ui/Tabs';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import MultiSelect from '../ui/MultiSelect';

interface CustomObjectFieldBuilderProps {
    definition: CustomObjectDefinition;
    onBack: () => void;
}

const CustomObjectFieldBuilder: React.FC<CustomObjectFieldBuilderProps> = ({ definition, onBack }) => {
    const { updateCustomObjectDefMutation } = useData();
    const [fields, setFields] = useState<CustomField[]>(definition.fields || []);
    const [layout, setLayout] = useState<CustomObjectLayoutSection[]>(definition.layout || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<CustomField | null>(null);
    const [activeTab, setActiveTab] = useState('Fields');

    useEffect(() => {
        setFields(definition.fields || []);
        setLayout(definition.layout || []);
    }, [definition]);

    const handleFieldsSave = (newFields: CustomField[]) => {
        updateCustomObjectDefMutation.mutate({ 
            ...definition, 
            fields: newFields,
            layout: layout // Persist current layout state with field changes
        });
    };

    const handleLayoutSave = (newLayout: CustomObjectLayoutSection[]) => {
        updateCustomObjectDefMutation.mutate({
            ...definition,
            fields: fields, // Persist current fields state with layout changes
            layout: newLayout
        });
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
            const newLayout = layout.map(section => ({
                ...section,
                fields: section.fields.filter(fId => fId !== fieldId)
            }));
            
            setFields(newFields);
            setLayout(newLayout);

            updateCustomObjectDefMutation.mutate({ 
                ...definition, 
                fields: newFields,
                layout: newLayout,
            });
        }
    };

    const handleSaveField = (fieldData: CustomField) => {
        let newFields;
        if (selectedField) {
            newFields = fields.map(f => (f.id === fieldData.id ? fieldData : f));
        } else {
            newFields = [...fields, { ...fieldData, id: `custom_${Date.now()}` }];
        }
        setFields(newFields);
        handleFieldsSave(newFields);
        setIsModalOpen(false);
    };
    
    const addSection = () => {
        const newSection: CustomObjectLayoutSection = {
            id: `sec_${Date.now()}`,
            title: 'New Section',
            fields: []
        };
        const newLayout = [...layout, newSection];
        setLayout(newLayout);
        handleLayoutSave(newLayout);
    };

    const updateSectionTitle = (sectionId: string, title: string) => {
        setLayout(prevLayout => 
            prevLayout.map(sec => (sec.id === sectionId ? { ...sec, title } : sec))
        );
    };
    
    const updateSectionFields = (sectionId: string, selectedFields: string[]) => {
        const newLayout = layout.map(sec =>
            sec.id === sectionId ? { ...sec, fields: selectedFields } : sec
        );
        setLayout(newLayout);
        handleLayoutSave(newLayout);
    };

    const removeSection = (sectionId: string) => {
        if (window.confirm("Are you sure you want to remove this section?")) {
            const newLayout = layout.filter(sec => sec.id !== sectionId);
            setLayout(newLayout);
            handleLayoutSave(newLayout);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                     <Button variant="secondary" size="sm" onClick={onBack} leftIcon={<ArrowLeft size={14} />} className="mb-2">
                        Back to Objects
                    </Button>
                    <h3 className="text-lg font-semibold">Configure "{definition.namePlural}"</h3>
                </div>
                {activeTab === 'Fields' && (
                    <Button size="sm" onClick={handleAddField} leftIcon={<Plus size={14} />}>
                        Add Field
                    </Button>
                )}
            </div>
            
            <div className="mb-4">
                <Tabs tabs={['Fields', 'Layout']} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {activeTab === 'Fields' && (
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
            )}
            
            {activeTab === 'Layout' && (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">Organize how fields appear on the record page by grouping them into sections.</p>
                    {layout.map(section => (
                        <Card key={section.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <Input 
                                    id={`sec-title-${section.id}`} 
                                    label="" 
                                    value={section.title} 
                                    onChange={e => updateSectionTitle(section.id, e.target.value)} 
                                    onBlur={() => handleLayoutSave(layout)}
                                    className="font-semibold text-lg -mt-2 -ml-2 w-1/2" 
                                />
                                <Button size="sm" variant="danger" onClick={() => removeSection(section.id)}><Trash2 size={14}/></Button>
                            </div>
                            <MultiSelect 
                                label="Fields in this section"
                                options={definition.fields.map(f => ({ value: f.id, label: f.label }))}
                                selectedValues={section.fields}
                                onChange={selectedFields => updateSectionFields(section.id, selectedFields)}
                            />
                        </Card>
                    ))}
                    <Button variant="secondary" onClick={addSection} leftIcon={<Plus size={16} />}>Add Section</Button>
                </div>
            )}
            
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