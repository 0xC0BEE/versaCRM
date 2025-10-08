import React, { useState, useEffect } from 'react';
import Select from '../../../ui/Select';
import Input from '../../../ui/Input';
import { Node } from 'reactflow';
import { useApp } from '../../../../contexts/AppContext';

interface ConditionConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const ConditionConfig: React.FC<ConditionConfigProps> = ({ node, updateNodeData }) => {
    const { industryConfig } = useApp();

    const [localCondition, setLocalCondition] = useState(node.data.condition || { field: '', operator: 'is', value: '' });

    useEffect(() => {
        setLocalCondition(node.data.condition || { field: '', operator: 'is', value: '' });
    }, [node.id, node.data.condition]);

    const handleLocalChange = (field: string, value: any) => {
        setLocalCondition(prev => ({ ...prev, [field]: value }));
    };

    const handlePersistChange = (newCondition: any) => {
        updateNodeData({ condition: newCondition });
    };

    const handleFieldTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newField = e.target.value;
        const isNumeric = newField === 'contact.leadScore' || newField === 'deal.value';
        const newCondition = {
            ...localCondition,
            field: newField,
            operator: isNumeric ? 'gt' : 'is',
            value: isNumeric ? 0 : ''
        };
        setLocalCondition(newCondition);
        handlePersistChange(newCondition);
    };
    
    const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOperator = e.target.value;
        const newCondition = { ...localCondition, operator: newOperator };
        setLocalCondition(newCondition);
        handlePersistChange(newCondition);
    };

    const isNumericField = localCondition.field === 'contact.leadScore' || localCondition.field === 'deal.value';

    return (
        <div className="space-y-4">
            <p className="text-sm text-text-secondary">This node will split the workflow into two paths. Define the condition for the "true" path.</p>
            
            <Select 
                id="condition-field" 
                label="Field to Check" 
                value={localCondition.field}
                onChange={handleFieldTypeChange}
            >
                <option value="">Select a field...</option>
                <option value="contact.status">Contact Status</option>
                <option value="contact.leadSource">Contact Lead Source</option>
                <option value="contact.leadScore">Contact Lead Score</option>
                <option value="deal.value">Deal Value</option>
                {industryConfig.customFields.map(f => (
                     <option key={f.id} value={`contact.customFields.${f.id}`}>{f.label}</option>
                ))}
            </Select>

            <Select 
                id="condition-operator" 
                label="Operator"
                value={localCondition.operator}
                onChange={handleOperatorChange}
            >
                {isNumericField ? (
                    <>
                        <option value="gt">Is greater than</option>
                        <option value="lt">Is less than</option>
                        <option value="eq">Is equal to</option>
                    </>
                ) : (
                    <>
                        <option value="is">Is</option>
                        <option value="is_not">Is Not</option>
                        <option value="contains">Contains</option>
                    </>
                )}
            </Select>

            <Input 
                id="condition-value"
                label="Value"
                type={isNumericField ? 'number' : 'text'}
                value={localCondition.value}
                onChange={(e) => handleLocalChange('value', e.target.value)}
                onBlur={() => handlePersistChange(localCondition)}
                placeholder="Value to compare against"
            />
        </div>
    );
};

export default ConditionConfig;
