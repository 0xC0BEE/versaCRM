import React from 'react';
import { useApp } from '../../contexts/AppContext';

const FormBuilder: React.FC = () => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();

    return (
        <div>
            <h3 className="text-lg font-semibold">Customize {industryConfig.contactName} Fields</h3>
            <p className="text-sm text-gray-500 mb-4">Current industry: {industryConfig.name}</p>
            <div className="space-y-3">
                {industryConfig.customFields.map(field => (
                    <div key={field.id} className="p-3 border rounded-md dark:border-dark-border bg-gray-50 dark:bg-gray-700/50">
                        <p className="font-medium">{field.label}</p>
                        <p className="text-xs text-gray-500">ID: {field.id} | Type: {field.type}</p>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">Full form builder functionality coming soon.</p>
        </div>
    );
};

export default FormBuilder;
