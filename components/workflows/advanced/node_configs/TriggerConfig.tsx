import React from 'react';
import Select from '../../../ui/Select';
import { Node } from 'reactflow';

interface TriggerConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const triggerTypes: { value: string, label: string }[] = [
    { value: 'contactCreated', label: 'Contact is Created' },
    { value: 'contactStatusChanged', label: 'Contact Status Changes' },
    { value: 'dealCreated', label: 'Deal is Created' },
    { value: 'dealStageChanged', label: 'Deal Stage Changes' },
    { value: 'ticketCreated', label: 'Ticket is Created' },
    { value: 'ticketStatusChanged', label: 'Ticket Status Changes' },
];

const TriggerConfig: React.FC<TriggerConfigProps> = ({ node, updateNodeData }) => {
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        const newLabel = triggerTypes.find(t => t.value === newType)?.label || 'Trigger';
        updateNodeData({ nodeType: newType, label: newLabel });
    };

    return (
        <div className="space-y-4">
            <Select id="trigger-type" label="Trigger Event" value={node?.data?.nodeType || ''} onChange={handleTypeChange}>
                {triggerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            {/* Additional options for specific triggers could go here */}
            <p className="text-xs text-text-secondary">This workflow will start when the selected event occurs.</p>
        </div>
    );
};

export default TriggerConfig;