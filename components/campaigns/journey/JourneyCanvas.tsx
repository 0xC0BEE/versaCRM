import React, { useCallback } from 'react';
import ReactFlow, {
  Controls,
  addEdge,
  Connection,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  NodeMouseHandler,
  useReactFlow,
} from 'reactflow';
import JourneyNode from './JourneyNode';

const nodeTypes = {
  journeyTrigger: JourneyNode,
  journeyAction: JourneyNode,
  journeyCondition: JourneyNode,
};

interface JourneyCanvasProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onNodeClick: NodeMouseHandler;
    onPaneClick: (event: React.MouseEvent) => void;
}

let idCounter = 10; // Start high to avoid conflicts with mock data
const getId = () => `${idCounter++}`;

const JourneyCanvas: React.FC<JourneyCanvasProps> = ({ nodes, edges, setNodes, setEdges, onNodeClick, onPaneClick }) => {
    const reactFlowInstance = useReactFlow();
    
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const deleteChanges = changes.filter(change => change.type === 'remove' && change.id === '1');
            if (deleteChanges.length > 0) return; // Prevent deletion of trigger
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
            if (!data) return;
            
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

export default JourneyCanvas;
