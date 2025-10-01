import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { ContactStatus } from '../../types';

interface BulkStatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (status: ContactStatus) => void;
    isUpdating: boolean;
    selectedCount: number;
}

const statusOptions: ContactStatus[] = ['Lead', 'Active', 'Inactive', 'Do Not Contact'];

const BulkStatusUpdateModal: React.FC<BulkStatusUpdateModalProps> = ({ isOpen, onClose, onUpdate, isUpdating, selectedCount }) => {
    const [newStatus, setNewStatus] = useState<ContactStatus>('Active');

    const handleUpdate = () => {
        onUpdate(newStatus);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update Status for ${selectedCount} Contacts`}>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
                Select a new status to apply to all selected contacts.
            </p>
            <Select
                id="bulk-status"
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ContactStatus)}
            >
                {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </Select>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isUpdating}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : `Update ${selectedCount} Contacts`}
                </Button>
            </div>
        </Modal>
    );
};

export default BulkStatusUpdateModal;