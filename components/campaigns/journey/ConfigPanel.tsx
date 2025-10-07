import React from 'react';
import { Node } from 'reactflow';
import TriggerConfig from './node_configs/TriggerConfig';
import ActionConfig from './node_configs/ActionConfig';
import ConditionConfig from './node_configs/ConditionConfig';

interface JourneyConfigPanelProps {
    selectedNode: Node | null;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

const JourneyConfigPanel: React.FC<JourneyConfigPanelProps> = ({ selectedNode, setNodes }) => {
    
    if (!selectedNode) {
        return (
            <div>
                <h3 className="text-lg font-semibold text-text-heading">Configure Node</h3>
                <p className="text-sm text-text-secondary mt-4">Select a node on the canvas to configure its settings.</p>
            </div>
        );
    }
    
    const updateNodeData = (data: Record<string, any>) => {
        setNodes(nds => nds.map(node => {
            if (node.id === selectedNode.id) {
                node.data = { ...node.data, ...data };
            }
            return node;
        }));
    }

    const renderConfig = () => {
        switch (selectedNode.type) {
            case 'journeyTrigger':
                return <TriggerConfig node={selectedNode} updateNodeData={updateNodeData} />;
            case 'journeyAction':
                return <ActionConfig node={selectedNode} updateNodeData={updateNodeData} />;
            case 'journeyCondition':
                 return <ConditionConfig node={selectedNode} updateNodeData={updateNodeData} />;
            default:
                return <p className="text-sm text-text-secondary">This node type has no configuration options.</p>;
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-text-heading mb-4">Configure: {selectedNode.data.label}</h3>
            {renderConfig()}
        </div>
    );
};

export default JourneyConfigPanel;