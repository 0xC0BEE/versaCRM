import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Snapshot } from '../../types';

interface CreateSnapshotModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateSnapshotModal: React.FC<CreateSnapshotModalProps> = ({ isOpen, onClose }) => {
    const { createSnapshotMutation } = useData();
    const { authenticatedUser } = useAuth();
    const [name, setName] = useState('');
    const [dataSource, setDataSource] = useState<Snapshot['dataSource']>('contacts');

    const handleCreate = () => {
        if (!name.trim()) {
            toast.error("Snapshot name is required.");
            return;
        }

        createSnapshotMutation.mutate({
            orgId: authenticatedUser!.organizationId,
            name,
            dataSource
        }, {
            onSuccess: () => {
                toast.success("Snapshot created successfully!");
                onClose();
                setName('');
            }
        });
    };
    
    const isPending = createSnapshotMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Data Snapshot">
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    Create a point-in-time copy of your data for historical analysis.
                </p>
                <Input
                    id="snapshot-name"
                    label="Snapshot Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., End of Q3 Contacts"
                    required
                    disabled={isPending}
                />
                <Select
                    id="snapshot-source"
                    label="Data Source"
                    value={dataSource}
                    onChange={e => setDataSource(e.target.value as Snapshot['dataSource'])}
                    disabled={isPending}
                >
                    <option value="contacts">Contacts</option>
                    <option value="deals">Deals</option>
                </Select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isPending}>
                    {isPending ? 'Creating...' : 'Create Snapshot'}
                </Button>
            </div>
        </Modal>
    );
};

export default CreateSnapshotModal;