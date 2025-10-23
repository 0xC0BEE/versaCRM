import React, { useState, useRef } from 'react';
import Button from '../ui/Button';
import { Upload, Download } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import DataImportModal from './DataImportModal';
import toast from 'react-hot-toast';

const templateFileNames: { [key: string]: string } = {
    products: 'products_template.csv',
    contacts: 'contacts_template.csv',
    deals: 'deals_template.csv',
    projects: 'projects_template.csv',
    tickets: 'tickets_template.csv',
    tasks: 'tasks_template.csv',
};

const DataMigration: React.FC = () => {
    const { exportAllData } = useData();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFiles, setImportFiles] = useState<{ [key: string]: File | null }>({});
    const [importData, setImportData] = useState<{ [key: string]: string } | null>(null);

    const handleExport = async () => {
        toast.loading("Generating template files...", { id: 'export-toast' });
        try {
            // FIX: Removed an unnecessary type cast on `exportAllData` after correcting its return type in the DataContext. The function now correctly returns a promise resolving to an object of file contents.
            const filesToExport = await exportAllData();

            let delay = 0;
            for (const filename in filesToExport) {
                if (Object.prototype.hasOwnProperty.call(filesToExport, filename)) {
                    setTimeout(() => {
                        const csvContent = filesToExport[filename];
                        // FIX: Explicitly convert csvContent to a string to ensure it's a valid BlobPart,
                        // as its type can be inferred as 'unknown' from the API response.
                        const blob = new Blob([String(csvContent)], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, delay);
                    delay += 300;
                }
            }
            toast.success("Template files are downloading!", { id: 'export-toast' });
        } catch (error) {
            toast.error("Failed to export data.", { id: 'export-toast' });
            console.error(error);
        }
    };

    const handleFileSelected = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportFiles(prev => ({ ...prev, [key]: file }));
        }
    };

    const handleStartImport = async () => {
        const filesToRead = Object.entries(importFiles).filter(([_, file]) => file !== null);
        if (filesToRead.length === 0) {
            return toast.error("Please select at least one CSV file to import.");
        }

        const fileReaderPromises = filesToRead.map(([key, file]) => {
            return new Promise<[string, string]>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve([key, e.target?.result as string]);
                reader.onerror = (e) => reject(e);
                reader.readAsText(file!);
            });
        });

        try {
            const results = await Promise.all(fileReaderPromises);
            const dataForModal = results.reduce((acc, [key, content]) => {
                // The key from the file input is the full filename, but the API expects the base key.
                const baseKey = Object.keys(templateFileNames).find(k => templateFileNames[k] === key) + 'Csv';
                acc[baseKey] = content;
                return acc;
            }, {} as { [key: string]: string });
            
            setImportData(dataForModal);
            setIsImportModalOpen(true);
        } catch (error) {
            toast.error("Error reading one or more files.");
            console.error(error);
        }
    };

    const hasFilesToImport = Object.values(importFiles).some(f => f);

    return (
        <div>
            <h3 className="text-lg font-semibold">Data Migration</h3>
            <p className="text-sm text-text-secondary mb-4">Import or export your CRM data using CSV template files.</p>
            <div className="space-y-4">
                 <div className="p-4 border border-border-subtle rounded-lg">
                    <h4 className="font-medium">Export Data Templates</h4>
                    <p className="text-sm text-text-secondary mb-2">Export a set of CSV templates, one for each data type.</p>
                    <Button onClick={handleExport} variant="secondary" leftIcon={<Download size={16} />}>
                        Export All Template Files
                    </Button>
                </div>
                <div className="p-4 border border-border-subtle rounded-lg space-y-4">
                    <h4 className="font-medium">Import from Templates</h4>
                    <p className="text-sm text-text-secondary mb-2">Upload your populated CSV files to import new records.</p>
                    
                    <div className="space-y-3">
                        {Object.entries(templateFileNames).map(([key, filename]) => (
                            <div key={key} className="grid grid-cols-3 items-center gap-4">
                                <label htmlFor={`import-${key}`} className="text-sm font-medium text-right col-span-1">{filename}</label>
                                <div className="col-span-2">
                                     <input
                                        type="file"
                                        id={`import-${key}`}
                                        accept=".csv"
                                        onChange={e => handleFileSelected(filename, e)}
                                        className="block w-full text-sm text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-border-subtle">
                         <Button onClick={handleStartImport} disabled={!hasFilesToImport} leftIcon={<Upload size={16}/>}>
                            Import Data
                        </Button>
                    </div>

                </div>
            </div>
            <DataImportModal
                isOpen={isImportModalOpen}
                onClose={() => {
                    setIsImportModalOpen(false);
                    setImportData(null);
                    setImportFiles({});
                }}
                importData={importData}
            />
        </div>
    );
};

export default DataMigration;