import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { CannedResponse } from '../../types';
import CannedResponseEditModal from './CannedResponseEditModal';

const CannedResponses: React.FC = () => {
    const { cannedResponsesQuery, deleteCannedResponseMutation } = useData();
    const { data: responses = [], isLoading } = cannedResponsesQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState<CannedResponse | null>(null);

    const handleEdit = (response: CannedResponse) => {
        setSelectedResponse(response);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedResponse(null);
        setIsModalOpen(true);
    };

    const handleDelete = (responseId: string) => {
        if (window.confirm("Are you sure you want to delete this canned response?")) {
            deleteCannedResponseMutation.mutate(responseId);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Canned Responses</h3>
                    <p className="text-sm text-text-secondary">Manage quick reply templates for your team.</p>
                </div>
                <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                    New Response
                </Button>
            </div>

            {isLoading ? (
                <p>Loading responses...</p>
            ) : (
                <div className="space-y-3">
                    {responses.length > 0 ? (
                        responses.map((response: CannedResponse) => (
                            <div key={response.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{response.name}</p>
                                    <p className="text-xs text-text-secondary truncate">{response.body}</p>
                                </div>
                                <div className="space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(response)} leftIcon={<Edit size={14} />}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(response.id)} leftIcon={<Trash2 size={14} />} disabled={deleteCannedResponseMutation.isPending}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary py-4">No canned responses found.</p>
                    )}
                </div>
            )}

            <CannedResponseEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                response={selectedResponse}
            />
        </div>
    );
};

export default CannedResponses;