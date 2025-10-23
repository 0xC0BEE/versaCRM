import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';

interface DataImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    importData: { [key: string]: string } | null;
}

type ImportStatus = 'idle' | 'importing' | 'success' | 'error';

const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose, importData }) => {
    const { importDataMutation } = useData();
    const [status, setStatus] = useState<ImportStatus>('idle');
    const [summary, setSummary] = useState<any>(null);

    const handleImport = () => {
        if (!importData) return;
        setStatus('importing');
        importDataMutation.mutate(importData, {
            onSuccess: (data) => {
                setSummary(data);
                setStatus('success');
            },
            onError: (error: Error) => {
                setSummary({ errors: [error.message] });
                setStatus('error');
            }
        });
    };

    const handleClose = () => {
        // Reset state for next time
        setStatus('idle');
        setSummary(null);
        onClose();
    }
    
    const countRows = (csv: string | undefined) => csv ? Math.max(0, csv.trim().split('\n').length - 1) : 0;

    const renderContent = () => {
        switch(status) {
            case 'importing':
                return (
                    <div className="text-center p-8">
                        <Loader size={48} className="animate-spin text-primary mx-auto" />
                        <h3 className="mt-4 text-lg font-semibold">Importing data...</h3>
                        <p className="text-sm text-text-secondary">This may take a moment.</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center p-8">
                        <CheckCircle size={48} className="mx-auto text-success" />
                        <h3 className="mt-4 text-lg font-semibold">Import Complete!</h3>
                        <div className="mt-2 text-sm text-text-secondary text-left bg-hover-bg p-3 rounded-md">
                           <p>New Products Created: {summary.productsCreated}</p>
                           <p>New Contacts Created: {summary.contactsCreated} (Skipped: {summary.contactsSkipped})</p>
                           <p>New Deals Created: {summary.dealsCreated} (Skipped: {summary.dealsSkipped})</p>
                           <p>New Projects Created: {summary.projectsCreated} (Skipped: {summary.projectsSkipped})</p>
                           <p>New Tickets Created: {summary.ticketsCreated} (Skipped: {summary.ticketsSkipped})</p>
                           <p>New Tasks Created: {summary.tasksCreated} (Skipped: {summary.tasksSkipped})</p>
                        </div>
                        <Button onClick={handleClose} className="mt-6">Close</Button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-8">
                        <AlertTriangle size={48} className="mx-auto text-error" />
                        <h3 className="mt-4 text-lg font-semibold">Import Failed</h3>
                        <p className="mt-2 text-sm text-text-secondary">
                            An error occurred during import. {summary?.errors?.[0]}
                        </p>
                        <Button onClick={handleClose} className="mt-6" variant="secondary">Close</Button>
                    </div>
                );
            case 'idle':
            default:
                if (!importData) return null;
                return (
                    <div>
                        <p className="text-sm text-text-secondary mb-4">
                            Ready to import the following data from your ZIP file?
                        </p>
                        <ul className="list-disc list-inside bg-hover-bg p-4 rounded-md">
                            {Object.entries(importData).map(([fileName, content]) => (
                                // FIX: Cast `content` to string. For some reason, TypeScript is losing the type information from the `importData` prop and inferring it as `unknown`, causing a type error. This explicit cast resolves the issue.
                                <li key={fileName}>{countRows(content as string)} records from {fileName}</li>
                            ))}
                        </ul>
                         <div className="mt-6 flex justify-end space-x-2">
                            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleImport}>Start Import</Button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Data Import">
            {renderContent()}
        </Modal>
    );
};

export default DataImportModal;