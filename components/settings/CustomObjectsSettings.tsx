import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { CustomObjectDefinition } from '../../types';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, Settings2 } from 'lucide-react';
import CustomObjectDefinitionModal from './CustomObjectDefinitionModal';
import CustomObjectFieldBuilder from './CustomObjectFieldBuilder';

const CustomObjectsSettings: React.FC = () => {
    const { customObjectDefsQuery, deleteCustomObjectDefMutation } = useData();
    const { data: definitions = [], isLoading } = customObjectDefsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDef, setSelectedDef] = useState<CustomObjectDefinition | null>(null);
    const [view, setView] = useState<'list' | 'builder'>('list');

    const handleNew = () => {
        setSelectedDef(null);
        setIsModalOpen(true);
    };

    const handleEdit = (def: CustomObjectDefinition) => {
        setSelectedDef(def);
        setIsModalOpen(true);
    };

    const handleDelete = (def: CustomObjectDefinition) => {
        if (window.confirm(`Are you sure you want to delete the "${def.nameSingular}" object? All associated records will be permanently deleted.`)) {
            deleteCustomObjectDefMutation.mutate(def.id);
        }
    };

    const handleManageFields = (def: CustomObjectDefinition) => {
        setSelectedDef(def);
        setView('builder');
    };

    if (view === 'builder' && selectedDef) {
        return <CustomObjectFieldBuilder definition={selectedDef} onBack={() => setView('list')} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Custom Objects</h3>
                    <p className="text-sm text-text-secondary">Define your own data structures within the CRM.</p>
                </div>
                <Button size="sm" onClick={handleNew} leftIcon={<Plus size={14} />}>
                    New Object
                </Button>
            </div>

            {isLoading ? (
                <p>Loading object definitions...</p>
            ) : (
                <div className="space-y-3">
                    {definitions.map((def: CustomObjectDefinition) => (
                        <div key={def.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{def.namePlural}</p>
                                <p className="text-xs text-text-secondary">Singular: {def.nameSingular}</p>
                            </div>
                            <div className="space-x-2">
                                <Button size="sm" variant="secondary" onClick={() => handleManageFields(def)} leftIcon={<Settings2 size={14} />}>Configure</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleEdit(def)} leftIcon={<Edit size={14} />}>Edit</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(def)} leftIcon={<Trash2 size={14} />} disabled={deleteCustomObjectDefMutation.isPending}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                    {definitions.length === 0 && (
                        <p className="text-sm text-text-secondary py-4">No custom objects defined yet.</p>
                    )}
                </div>
            )}

            <CustomObjectDefinitionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                definition={selectedDef}
            />
        </div>
    );
};

export default CustomObjectsSettings;