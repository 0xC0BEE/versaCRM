import React from 'react';
import Button from '../ui/Button';
import FileInput from '../ui/FileInput';
import { Download, Upload } from 'lucide-react';

const DataMigration: React.FC = () => {
    return (
        <div>
            <h3 className="text-lg font-semibold">Data Migration Tools</h3>
            <p className="text-sm text-gray-500 mb-4">Import new data or export your existing data.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                {/* Import */}
                <div>
                    <h4 className="font-semibold flex items-center mb-2">
                        <Upload size={18} className="mr-2" />
                        Import Data
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Upload a CSV file to import contacts, products, or other records.</p>
                    <FileInput />
                    <Button className="mt-4" variant="secondary">Start Import</Button>
                </div>

                {/* Export */}
                <div>
                     <h4 className="font-semibold flex items-center mb-2">
                        <Download size={18} className="mr-2" />
                        Export Data
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Download a CSV file of all your data in the system.</p>
                    <Button leftIcon={<Download size={16}/>}>Export All Data</Button>
                </div>
            </div>
        </div>
    );
};

export default DataMigration;
