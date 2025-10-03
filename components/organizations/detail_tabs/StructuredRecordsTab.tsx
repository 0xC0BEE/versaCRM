import React, { useState } from 'react';
// FIX: Imported correct types.
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact, StructuredRecord } from '../../../types';
import Button from '../../ui/Button';
import { Plus, FileText } from 'lucide-react';
// FIX: Corrected import path for useApp.
import { useApp } from '../../../contexts/AppContext';
import StructuredRecordEditModal from './StructuredRecordEditModal';

interface StructuredRecordsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const StructuredRecordsTab: React.FC<StructuredRecordsTabProps> = ({ contact, isReadOnly }) => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();
    const records = contact.structuredRecords || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<StructuredRecord | undefined>(undefined);
    
    const handleEdit = (record: StructuredRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedRecord(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">{industryConfig.structuredRecordTabName}</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={handleAdd}>Add Record</Button>
                )}
            </div>
            {records.length > 0 ? (
                <div className="space-y-3">
                    {records.map(record => {
                        const recordType = industryConfig.structuredRecordTypes.find(rt => rt.id === record.type);
                        if (!recordType) return null;
                        return (
                            <div key={record.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-dark-border cursor-pointer hover:bg-gray-100" onClick={() => handleEdit(record)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{record.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(record.recordDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                        {recordType.name || record.type}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm space-y-1">
                                    {recordType.fields.slice(0, 2).map(field => (
                                        <div key={field.id} className="flex">
                                            <span className="font-medium w-28 shrink-0">{field.label}:</span>
                                            <span className="text-gray-600 dark:text-gray-300 truncate">{record.fields[field.id]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No records found.</p>
                </div>
            )}
            {isModalOpen && (
                <StructuredRecordEditModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contact={contact}
                    record={selectedRecord}
                />
            )}
        </div>
    );
};

export default StructuredRecordsTab;