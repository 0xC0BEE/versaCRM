import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Target, Send, Clock, GitFork, CheckSquare } from 'lucide-react';
import { JourneyExecutionType } from '../../../types';

const nodeIcons: Record<string, React.ReactNode> = {
    targetAudience: <Target size={16} className="text-purple-500"/>,
    sendEmail: <Send size={16} className="text-primary"/>,
    wait: <Clock size={16} className="text-warning"/>,
    ifEmailOpened: <GitFork size={16} className="text-indigo-500"/>,
    createTask: <CheckSquare size={16} className="text-success" />,
};

const JourneyNode: React.FC<NodeProps> = ({ data, selected, type }) => {
    const icon = nodeIcons[data.nodeType as JourneyExecutionType] || <Send size={16} />;
    const nodeType = type as 'journeyTrigger' | 'journeyAction' | 'journeyCondition';

    return (
        <div className={`w-52 p-3 rounded-lg border-2 shadow-md bg-card-bg ${selected ? 'border-primary' : 'border-border-subtle'}`}>
            {nodeType !== 'journeyTrigger' && <Handle type="target" position={Position.Top} className="!bg-primary" />}
            
            <div className="flex items-center">
                {icon}
                <strong className="ml-2 text-sm text-text-primary">{data.label}</strong>
            </div>
            
            {nodeType === 'journeyCondition' ? (
                <>
                    <Handle type="source" position={Position.Right} id="true" style={{ top: '50%', background: '#10b981' }} />
                    <Handle type="source" position={Position.Bottom} id="false" style={{ left: '50%', background: '#ef4444' }} />
                </>
            ) : (
                <Handle type="source" position={Position.Bottom} className="!bg-primary" />
            )}
        </div>
    );
};

export default JourneyNode;