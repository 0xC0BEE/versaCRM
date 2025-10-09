import React from 'react';
import { PublicFormField } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { PlusCircle } from 'lucide-react';

interface FormToolboxProps {
    onFieldAdd: (field: PublicFormField) => void;
    usedFieldIds: string[];
}

const FormToolbox: React.FC<FormToolboxProps> = ({ onFieldAdd, usedFieldIds }) => {
    const { industryConfig } = useApp();

    const standardFields: PublicFormField[] = [
        { id: 'contactName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'text', required: true },
        { id: 'phone', label: 'Phone Number', type: 'text', required: false },
    ];
    
    const customFields: PublicFormField[] = industryConfig.customFields.map(cf => ({
        id: `customFields.${cf.id}`,
        label: cf.label,
        type: cf.type,
        required: false,
        options: cf.options,
    }));
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-text-heading mb-4">Add Fields</h3>
            
            <div className="mb-4">
                <p className="text-sm font-semibold text-text-secondary mb-2">Standard Fields</p>
                <div className="space-y-2">
                    {standardFields.map(field => (
                        <button 
                            key={field.id} 
                            onClick={() => onFieldAdd(field)} 
                            className="w-full p-2 text-left border border-border-subtle rounded-md bg-hover-bg flex items-center hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-subtle"
                            disabled={usedFieldIds.includes(field.id)}
                        >
                            <PlusCircle size={16} className="mr-2 text-primary" />
                            {field.label}
                        </button>
                    ))}
                </div>
            </div>

            {customFields.length > 0 && (
                 <div>
                    <p className="text-sm font-semibold text-text-secondary mb-2">Custom Fields</p>
                    <div className="space-y-2">
                        {customFields.map(field => (
                            <button 
                                key={field.id} 
                                onClick={() => onFieldAdd(field)} 
                                className="w-full p-2 text-left border border-border-subtle rounded-md bg-hover-bg flex items-center hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-subtle"
                                disabled={usedFieldIds.includes(field.id)}
                            >
                                <PlusCircle size={16} className="mr-2 text-primary" />
                                {field.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
             <p className="text-xs text-text-secondary mt-6">Click a field to add it to your form.</p>
        </div>
    );
};

export default FormToolbox;