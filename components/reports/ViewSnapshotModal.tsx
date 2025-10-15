import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import { Snapshot } from '../../types';
import { format } from 'date-fns';
import SnapshotDataTable from './SnapshotDataTable';

interface ViewSnapshotModalProps {
    isOpen: boolean;
    onClose: () => void;
    snapshot: Snapshot;
}

const ViewSnapshotModal: React.FC<ViewSnapshotModalProps> = ({ isOpen, onClose, snapshot }) => {
    
    const snapshotData = useMemo(() => {
        try {
            return JSON.parse(snapshot.data);
        } catch (e) {
            console.error("Failed to parse snapshot data:", e);
            return [];
        }
    }, [snapshot.data]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={snapshot.name} size="4xl">
            <p className="text-sm text-text-secondary mb-4">
                Viewing a snapshot of <strong className="capitalize">{snapshot.dataSource}</strong> data from {format(new Date(snapshot.createdAt), 'PPp')}. This data is read-only.
            </p>
            <SnapshotDataTable data={snapshotData} />
        </Modal>
    );
};

export default ViewSnapshotModal;