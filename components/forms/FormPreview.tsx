import React, { useState } from 'react';
import { PublicForm, PublicFormField } from '../../types';
import Button from '../ui/Button';
import { GripVertical, Trash2 } from 'lucide-react';

interface FormPreviewProps {
    form: Omit<PublicForm, 'id' | 'organizationId'>;
    setForm: React.Dispatch<React.SetStateAction<Omit<PublicForm, 'id' | 'organizationId'>>>;
}

const FormPreview: React.FC<FormPreviewProps> = ({ form, setForm }) => {
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
    };

    return (
        <div className="w-full max-w-sm bg-card-bg p-6 rounded-lg border-2 border-dashed border-border-subtle">
            <div className="space-y-4">
                {form.fields.map((field, index) => (
                    <div 
                        key={field.id} 
                        className={`relative p-2 rounded-md transition-shadow ${draggedIndex === index ? 'shadow-lg bg-hover-bg' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex items-center">
                            <GripVertical size={18} className="cursor-move text-text-secondary/50 mr-2" />
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-text-primary">
                                    {field.label} {field.required && <span className="text-error">*</span>}
                                </label>
                                <div className="mt-1 h-8 bg-hover-bg/50 border border-border-subtle rounded-input w-full" />
                            </div>
                            <button onClick={() => removeField(field.id)} className="ml-2 p-1 text-text-secondary hover:text-error">
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
