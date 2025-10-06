import React, { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  NodeMouseHandler,
  PaneEvent,
  useReactFlow,
} from 'reactflow';
import WorkflowNode from './WorkflowNode';

const nodeTypes = {
  trigger: WorkflowNode,
  action: WorkflowNode,
  condition: WorkflowNode,
};

interface WorkflowCanvasProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onNodeClick: NodeMouseHandler;
    onPaneClick: PaneEvent;
}

let id = 2; // Start from 2 since 1 is the default trigger
const getId = () => `${id++}`;

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodes, edges, setNodes, setEdges, onNodeClick, onPaneClick }) => {
    const reactFlowInstance = useReactFlow();
    
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const deleteChanges = changes.filter(change => change.type === 'remove' && change.id === '1');
            if (deleteChanges.length > 0) {
                // Prevent deletion of the trigger node
                return;
            }
            setNodes((nds) => applyNodeChanges(changes, nds))
        },
        [setNodes]
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

            if (typeof data === 'undefined' || !data) {
                return;
            }
            
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type: data.type,
                position,
                data: { label: data.label, nodeType: data.nodeType },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    return (
        <div className="w-full h-full rounded-lg overflow-hidden border border-border-subtle bg-card-bg" style={{ backgroundImage: 'radial-gradient(rgb(var(--text-secondary)/0.1) 1px, transparent 0)' , backgroundSize: '16px 16px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                snapToGrid={true}
                snapGrid={[16, 16]}
                deleteKeyCode={['Backspace', 'Delete']}
                fitView
            >
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default WorkflowCanvas;