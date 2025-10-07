import React, { useState, useRef } from 'react';
import Button from '../ui/Button';
import { Upload, Download } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { exportToCSV } from '../../utils/export';
import DataImportMapModal from './DataImportMapModal';

const DataMigration: React.FC = () => {
    const { contactsQuery } = useData();
    const { data: contacts = [], isLoading } = contactsQuery;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    const handleExport = () => {
        if (contacts.length > 0) {
            exportToCSV(contacts, `versacrm_contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
        }
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // In a real app, you would parse the file here and pass the data to the modal
            setIsImportModalOpen(true);
        }
        // Reset file input so the same file can be selected again
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div>
            <h3 className="text-lg font-semibold">Data Migration</h3>
            <p className="text-sm text-text-secondary mb-4">Import or export your CRM data.</p>
            <div className="space-y-4">
                <div className="p-4 border border-border-subtle rounded-lg">
                    <h4 className="font-medium">Import Contacts</h4>
                    <p className="text-sm text-text-secondary mb-2">Import contacts from a CSV file.</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileSelected}
                    />
                    <Button onClick={handleImportClick} variant="secondary" leftIcon={<Upload size={16} />}>
                        Import from CSV
                    </Button>
                </div>
                <div className="p-4 border border-border-subtle rounded-lg">
                    <h4 className="font-medium">Export Contacts</h4>
                    <p className="text-sm text-text-secondary mb-2">Export all your contact data to a CSV file as a backup.</p>
                    <Button onClick={handleExport} variant="secondary" leftIcon={<Download size={16} />} disabled={isLoading || contacts.length === 0}>
                        {isLoading ? 'Loading contacts...' : 'Export All Contacts'}
                    </Button>
                </div>
            </div>
            <DataImportMapModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
};

export default DataMigration;
