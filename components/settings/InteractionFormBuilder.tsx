import React from 'react';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';

const InteractionFormBuilder: React.FC = () => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();

    return (
        <div>
            <h3 className="text-lg font-semibold">Customize Interaction Types & Fields</h3>
            <p className="text-sm text-text-secondary mb-4">Current industry: {industryConfig.name}</p>
            <div className="space-y-3">
                 {industryConfig.interactionTypes.map(type => (
                    <div key={type} className="p-3 border border-border-subtle rounded-md bg-card-bg/50">
                        <p className="font-medium">{type}</p>
                    </div>
                ))}
            </div>
             <p className="mt-4 text-sm text-text-secondary">Functionality to add custom fields to interaction types is coming soon.</p>
        </div>
    );
};

export default InteractionFormBuilder;