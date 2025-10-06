import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Send, CheckSquare, Clock, GitFork } from 'lucide-react';
import { NodeExecutionType } from '../../../types';

const nodeIcons: Record<string, React.ReactNode> = {
    contactCreated: <Zap size={16} className="text-yellow-500"/>,
    contactStatusChanged: <Zap size={16} className="text-yellow-500"/>,
    dealCreated: <Zap size={16} className="text-yellow-500"/>,
    dealStageChanged: <Zap size={16} className="text-yellow-500"/>,
    ticketCreated: <Zap size={16} className="text-yellow-500"/>,
    ticketStatusChanged: <Zap size={16} className="text-yellow-500"/>,
    sendEmail: <Send size={16} className="text-primary"/>,
    createTask: <CheckSquare size={16} className="text-success"/>,
    wait: <Clock size={16} className="text-warning"/>,
    ifCondition: <GitFork size={16} className="text-purple-500"/>,
};

const WorkflowNode: React.FC<NodeProps> = ({ data, selected, type }) => {
    const icon = nodeIcons[data.nodeType as NodeExecutionType] || <Zap size={16} />;

    return (
        <div className={`w-52 p-3 rounded-lg border-2 shadow-md bg-card-bg ${selected ? 'border-primary' : 'border-border-subtle'}`}>
            {type !== 'trigger' && <Handle type="target" position={Position.Top} className="!bg-primary" />}
            
            <div className="flex items-center">
                {icon}
                <strong className="ml-2 text-sm text-text-primary">{data.label}</strong>
            </div>
            {data.description && <p className="text-xs text-text-secondary mt-1 truncate">{data.description}</p>}
            
            {type === 'condition' ? (
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

export default WorkflowNode;