import React, { useState, useEffect } from 'react';
import Select from '../../../ui/Select';
import Input from '../../../ui/Input';
import { Node } from 'reactflow';

interface ConditionConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const conditionFields = [
    { value: 'contact.status', label: 'Contact Status' },
    { value: 'contact.leadSource', label: 'Contact Lead Source' },
    { value: 'deal.value', label: 'Deal Value' }, // Example for future expansion
];

const conditionOperators = [
    { value: 'is', label: 'Is' },
    { value: 'is_not', label: 'Is Not' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Is Greater Than' },
    { value: 'less_than', label: 'Is Less Than' },
];

const ConditionConfig: React.FC<ConditionConfigProps> = ({ node, updateNodeData }) => {
    
    const condition = node.data.condition || { field: '', operator: 'is', value: '' };
    
    // FIX: Local state for condition value input to prevent re-render issues
    const [conditionValue, setConditionValue] = useState(condition.value);

    useEffect(() => {
        // Sync local state when the selected node changes
        setConditionValue(node.data.condition?.value || '');
    }, [node.id, node.data.condition?.value]);

    const handleValueBlur = () => {
        // Only update the global state when the user is done editing
        if (node.data.condition?.value !== conditionValue) {
            handleConditionChange('value', conditionValue);
        }
    };

    const handleConditionChange = (field: 'field' | 'operator' | 'value', value: string) => {
        const newCondition = {
            ...(node.data.condition || {}),
            [field]: value,
        };
        updateNodeData({ condition: newCondition });
    };

    return (
        <div className="space-y-4">
            <p className="text-xs text-text-secondary">Define a condition to split the workflow path. The workflow will follow the green path if the condition is true, and the red path if false.</p>
            <div className="space-y-2 p-3 bg-hover-bg rounded-md">
                <span className="text-sm font-semibold">If...</span>
                <Select 
                    id="condition-field" 
                    label="Field"
                    value={condition.field}
                    onChange={(e) => handleConditionChange('field', e.target.value)}
                >
                    <option value="">Select a field...</option>
                    {conditionFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </Select>
                <Select 
                    id="condition-operator" 
                    label="Operator"
                    value={condition.operator}
                    onChange={(e) => handleConditionChange('operator', e.target.value)}
                >
                    {conditionOperators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
                 <Input 
                    id="condition-value" 
                    label="Value"
                    value={conditionValue} // Use local state for value
                    onChange={(e) => setConditionValue(e.target.value)} // Update local state on change
                    onBlur={handleValueBlur} // Update global state on blur
                    placeholder="Enter a value to compare"
                />
            </div>
        </div>
    );
};

export default ConditionConfig;