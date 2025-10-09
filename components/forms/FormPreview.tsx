import React, { useState } from 'react';
import { PublicForm, PublicFormField } from '../../types';
import Button from '../ui/Button';
import { GripVertical, Trash2 } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

interface FormPreviewProps {
    form: Omit<PublicForm, 'id' | 'organizationId'>;
    setForm: React.Dispatch<React.SetStateAction<Omit<PublicForm, 'id' | 'organizationId'>>>;
    selectedFieldId: string | null;
    setSelectedFieldId: (id: string | null) => void;
}

const renderPreviewField = (field: PublicFormField) => {
    const props = {
        id: `preview-${field.id}`,
        label: field.label,
        value: '',
        onChange: () => {},
        required: field.required,
        placeholder: field.placeholder || '',
        disabled: true,
        className: "pointer-events-none"
    };

    switch (field.type) {
        case 'textarea':
            return <Textarea {...props} />;
        case 'select':
            return (
                <Select {...props}>
                    <option>{field.placeholder || '-- Select an option --'}</option>
                    {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                </Select>
            );
        default:
            return <Input {...props} type={field.type} />;
    }
};

const FormPreview: React.FC<FormPreviewProps> = ({ form, setForm, selectedFieldId, setSelectedFieldId }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newFields = [...form.fields];
        const [movedField] = newFields.splice(draggedIndex, 1);
        newFields.splice(index, 0, movedField);
        
        setForm(prev => ({...prev, fields: newFields}));
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };
    
    const removeField = (id: string) => {
        setForm(prev => ({...prev, fields: prev.fields.filter(f => f.id !== id)}));
        if (selectedFieldId === id) {
            setSelectedFieldId(null);
        }
    };

    const handleFieldClick = (e: React.MouseEvent, fieldId: string) => {
        e.stopPropagation();
        setSelectedFieldId(fieldId);
    };

    return (
        <div className="w-full max-w-md bg-card-bg p-6 rounded-lg border border-border-subtle" onClick={() => setSelectedFieldId(null)}>
            <div className="space-y-4">
                {form.fields.map((field, index) => (
                    <div 
                        key={field.id} 
                        className={`relative p-2 rounded-md border-2 transition-all ${
                            selectedFieldId === field.id ? 'border-primary bg-primary/5' : 'border-transparent'
                        } ${draggedIndex === index ? 'shadow-lg opacity-50' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => handleFieldClick(e, field.id)}
                    >
                        <div className="flex items-start">
                            <GripVertical size={20} className="cursor-move text-text-secondary/50 mr-2 mt-8 flex-shrink-0" />
                            <div className="flex-grow">
                                {renderPreviewField(field)}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="ml-2 p-1.5 text-text-secondary hover:text-error absolute top-1 right-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <Button style={{ backgroundColor: form.style.buttonColor }} className="w-full mt-6">
                {form.style.buttonText}
            </Button>
        </div>
    );
};

export default FormPreview;