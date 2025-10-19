import React, { useMemo, useState, useEffect } from 'react';
import { AnyContact, Relationship } from '../../../types';
import Button from '../../ui/Button';
import { Plus, Users } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import AddRelationshipModal from './AddRelationshipModal';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';

interface RelationshipsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ contact, isReadOnly }) => {
    const { contactsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const contactMap = useMemo(() => {
        return new Map((contacts as AnyContact[]).map(c => [c.id, c]));
    }, [contacts]);

    useEffect(() => {
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];
        
        // Center node for the current contact
        initialNodes.push({
            id: contact.id,
            data: { label: contact.contactName },
            position: { x: 250, y: 150 },
            type: 'input',
            style: { background: 'rgb(var(--primary))', color: 'white', fontWeight: 'bold' }
        });

        const relationships = contact.relationships || [];
        const angleStep = (2 * Math.PI) / (relationships.length || 1);
        const radius = 200;

        relationships.forEach((rel, index) => {
            const relatedContact = contactMap.get(rel.relatedContactId);
            if (relatedContact) {
                initialNodes.push({
                    id: relatedContact.id,
                    data: { label: relatedContact.contactName },
                    position: {
                        x: 250 + radius * Math.cos(angleStep * index - Math.PI / 2),
                        y: 150 + radius * Math.sin(angleStep * index - Math.PI / 2)
                    },
                });
                initialEdges.push({
                    id: `e-${contact.id}-${relatedContact.id}`,
                    source: contact.id,
                    target: relatedContact.id,
                    label: rel.relationshipType,
                    type: 'straight',
                });
            }
        });

        setNodes(initialNodes);
        setEdges(initialEdges);

    }, [contact, contactMap]);


    return (
        <div className="mt-4 max-h-[60vh] h-[60vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Relationship Map</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
                        Add Relationship
                    </Button>
                )}
            </div>
            {(contact.relationships || []).length > 0 ? (
                <div className="w-full h-[calc(100%-4rem)] rounded-lg border border-border-subtle">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        fitView
                        nodesDraggable={false}
                        nodesConnectable={false}
                    >
                        <MiniMap />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary h-[calc(100%-4rem)] flex flex-col justify-center items-center">
                    <Users className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">No relationships found.</p>
                </div>
            )}
            {isModalOpen && (
                <AddRelationshipModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contact={contact}
                />
            )}
        </div>
    );
};

export default RelationshipsTab;