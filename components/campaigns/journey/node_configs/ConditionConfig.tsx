import React from 'react';
import { Node } from 'reactflow';

interface ConditionConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const ConditionConfig: React.FC<ConditionConfigProps> = ({ node, updateNodeData }) => {
    // For now, this is a simple configuration as we only have one condition type.
    // This can be expanded in the future.

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-text-primary">Condition: Email Opened</h4>
            <p className="text-sm text-text-secondary">
                This node will check if the most recent email sent to the contact in this journey has been opened.
            </p>
            <p className="text-xs text-text-secondary p-2 bg-hover-bg rounded-md">
                The "Yes" path (green) will be taken if the email was opened. The "No" path (red) will be taken otherwise. The check happens after the preceding 'wait' period is over.
            </p>
        </div>
    );
};

export default ConditionConfig;