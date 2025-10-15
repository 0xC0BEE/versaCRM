import React from 'react';
import { Send, CheckSquare, Clock, GitFork, Edit, ClipboardCheck, UserCheck } from 'lucide-react';
import { NodeExecutionType, WorkflowNodeType } from '../../../types';

interface DraggableNodeProps {
  type: WorkflowNodeType;
  nodeType: NodeExecutionType;
  label: string;
  icon: React.ReactNode;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ type, nodeType, label, icon }) => {
  const onDragStart = (event: React.DragEvent) => {
    const data = JSON.stringify({ type, nodeType, label });
    event.dataTransfer.setData('application/reactflow', data);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="p-3 mb-2 border border-border-subtle rounded-md bg-hover-bg cursor-grab flex items-center hover:border-primary/50 transition-colors"
    >
      {icon}
      <span className="ml-2 text-sm font-medium text-text-primary">{label}</span>
    </div>
  );
};


const actionNodes: Omit<DraggableNodeProps, 'type'>[] = [
    { nodeType: 'sendEmail', label: 'Send Email', icon: <Send size={16} className="text-primary"/> },
    { nodeType: 'createTask', label: 'Create Task', icon: <CheckSquare size={16} className="text-success"/> },
    { nodeType: 'updateContactField', label: 'Update Contact Field', icon: <Edit size={16} className="text-indigo-500"/> },
    { nodeType: 'wait', label: 'Wait', icon: <Clock size={16} className="text-warning"/> },
    { nodeType: 'sendSurvey', label: 'Send Survey', icon: <ClipboardCheck size={16} className="text-teal-500"/> },
];

const logicNodes: Omit<DraggableNodeProps, 'type'>[] = [
    { nodeType: 'ifCondition', label: 'If/Then Condition', icon: <GitFork size={16} className="text-purple-500"/> },
]

const approvalNodes: Omit<DraggableNodeProps, 'type'>[] = [
    { nodeType: 'approval', label: 'Request Approval', icon: <UserCheck size={16} className="text-orange-500"/> },
]

const Toolbox: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-heading mb-4">Toolbox</h3>
      
      <div className="mb-4">
        <p className="text-sm font-semibold text-text-secondary mb-2">Actions</p>
        {actionNodes.map(node => (
            <DraggableNode key={node.nodeType} type="action" {...node} />
        ))}
      </div>

       <div className="mb-4">
        <p className="text-sm font-semibold text-text-secondary mb-2">Approvals</p>
         {approvalNodes.map(node => (
            <DraggableNode key={node.nodeType} type="approval" {...node} />
        ))}
      </div>

       <div>
        <p className="text-sm font-semibold text-text-secondary mb-2">Logic</p>
         {logicNodes.map(node => (
            <DraggableNode key={node.nodeType} type="condition" {...node} />
        ))}
      </div>

      <p className="text-xs text-text-secondary mt-6">Drag a node onto the canvas to add it to your workflow.</p>
    </div>
  );
};

export default Toolbox;