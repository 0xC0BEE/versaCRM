import React from 'react';
import Button from '../ui/Button';
import { Trash2, X, Edit } from 'lucide-react';

interface BulkActionsToolbarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete: () => void;
    onChangeStatus: () => void;
    isDeleting: boolean;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({ selectedCount, onClear, onDelete, onChangeStatus, isDeleting }) => {
    return (
        <div className="p-3 bg-primary-100 dark:bg-primary-900/50 border-y dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={onClear} className="p-1 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800">
                    <X size={18} className="text-primary-700 dark:text-primary-200" />
                </button>
                <span className="font-semibold text-primary-800 dark:text-primary-100">{selectedCount} selected</span>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={onChangeStatus} leftIcon={<Edit size={14} />}>Change Status</Button>
                <Button size="sm" variant="danger" onClick={onDelete} leftIcon={<Trash2 size={14} />} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            </div>
        </div>
    );
};

export default BulkActionsToolbar;