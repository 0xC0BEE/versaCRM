import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface DataImportMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    // In a real app, you'd pass headers, sample data, etc.
}

const DataImportMapModal: React.FC<DataImportMapModalProps> = ({ isOpen, onClose }) => {
    
    const handleImport = () => {
        // In a real app, you would process the mapping and create new contacts.
        toast.success("Import started! (This is a demo)");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Map CSV Columns" size="3xl">
            <div>
                <p className="text-sm text-text-secondary mb-4">
                    Match the columns from your CSV file to the corresponding fields in the CRM.
                </p>
                {/* A real implementation would have a dynamic mapping UI here */}
                <div className="h-64 flex items-center justify-center bg-hover-bg rounded-md">
                    <p className="text-text-secondary">A column mapping UI would appear here.</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleImport}>Start Import</Button>
            </div>
        </Modal>
    );
};

export default DataImportMapModal;
