import React from 'react';
import { Node } from 'reactflow';
import TriggerConfig from './node_configs/TriggerConfig';
import ActionConfig from './node_configs/ActionConfig';
import ConditionConfig from './node_configs/ConditionConfig';

interface ConfigPanelProps {
    selectedNode: Node | null;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ selectedNode, setNodes }) => {
    
    if (!selectedNode) {
        return (
            <div>
                <h3 className="text-lg font-semibold text-text-heading">Configure Node</h3>
                <p className="text-sm text-text-secondary mt-4">Select a node on the canvas to configure it.</p>
            </div>
        );
    }
    
    const updateNodeData = (data: Record<string, any>) => {
        setNodes(nds => nds.map(node => {
            if (node.id === selectedNode.id) {
                // Create a new node object with updated data to ensure React Flow detects the change
                return {
                    ...node,
                    data: {
                        ...(node.data || {}),
                        ...data,
                    },
                };
            }
            return node;
        }));
    }

    const renderConfig = () => {
        switch (selectedNode.type) {
            case 'trigger':
                return <TriggerConfig node={selectedNode} updateNodeData={updateNodeData} />;
            case 'approval':
            case 'action':
                return <ActionConfig node={selectedNode} updateNodeData={updateNodeData} />;
            case 'condition':
                return <ConditionConfig node={selectedNode} updateNodeData={updateNodeData} />;
            default:
                return <p className="text-sm text-text-secondary">Unknown node type selected.</p>;
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-text-heading mb-4">Configure: {selectedNode.data?.label}</h3>
            {renderConfig()}
        </div>
    );
};

export default ConfigPanel;