import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import Select from '../../../ui/Select';
import Input from '../../../ui/Input';
import { CampaignTargetAudience, ContactStatus } from '../../../../types';

interface TriggerConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const statusOptions: ContactStatus[] = ['Lead', 'Active', 'Inactive', 'Do Not Contact'];

const TriggerConfig: React.FC<TriggerConfigProps> = ({ node, updateNodeData }) => {
    
    const [audience, setAudience] = useState<CampaignTargetAudience>(node?.data?.targetAudience || { status: 'Lead' });

    useEffect(() => {
        setAudience(node?.data?.targetAudience || { status: 'Lead' });
    }, [node?.id, node?.data?.targetAudience]);

    const handleAudienceChange = (field: keyof CampaignTargetAudience, value: any) => {
        const newAudience = { ...audience, [field]: value };
        setAudience(newAudience);
        updateNodeData({ targetAudience: newAudience });
    };

     const handleScoreChange = (field: 'operator' | 'value', value: any) => {
        const newScore = { ...(audience.leadScore || { operator: 'gt', value: 0 }), [field]: value };
        handleAudienceChange('leadScore', newScore);
    }

    return (
        <div className="space-y-4">
             <h4 className="font-semibold text-text-primary">Target Audience</h4>
             <p className="text-xs text-text-secondary -mt-2">Define which contacts will be enrolled in this journey.</p>
             <Select
                id="audience-status"
                label="Contact Status"
                value={audience.status || ''}
                onChange={(e) => handleAudienceChange('status', e.target.value as ContactStatus)}
            >
                <option value="">Any Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            
             <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Lead Score</label>
                <div className="flex items-center gap-2">
                    <Select
                        id="score-operator"
                        label=""
                        value={audience.leadScore?.operator || 'gt'}
                        onChange={(e) => handleScoreChange('operator', e.target.value as any)}
                        className="w-1/2"
                    >
                        <option value="gt">is greater than</option>
                        <option value="lt">is less than</option>
                        <option value="eq">is equal to</option>
                    </Select>
                        <Input
                        id="score-value"
                        label=""
                        type="number"
                        value={audience.leadScore?.value || 0}
                        onChange={(e) => handleScoreChange('value', parseInt(e.target.value) || 0)}
                        className="w-1/2"
                    />
                </div>
            </div>
        </div>
    );
};

export default TriggerConfig;