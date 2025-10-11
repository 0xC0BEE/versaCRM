import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useData } from '../../contexts/DataContext';
import { CustomObjectRecord, CustomObjectDefinition } from '../../types';
import PageWrapper from '../layout/PageWrapper';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import CustomObjectEditModal from './CustomObjectEditModal';

const CustomObjectListPage: React.FC = () => {
    const { currentCustomObjectDefId } = useApp();
    const { customObjectDefsQuery, customObjectRecordsQuery, deleteCustomObjectRecordMutation } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<CustomObjectRecord | null>(null);

    const definition = useMemo(() => {
        return (customObjectDefsQuery.data as CustomObjectDefinition[])?.find(def => def.id === currentCustomObjectDefId);
    }, [customObjectDefsQuery.data, currentCustomObjectDefId]);

    const { data: records = [], isLoading: recordsLoading } = customObjectRecordsQuery(currentCustomObjectDefId);

    const handleNew = () => {
        setSelectedRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: CustomObjectRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleDelete = (recordId: string) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            deleteCustomObjectRecordMutation.mutate(recordId);
        }
    }

    if (!definition) {
        return <PageWrapper><p>Custom object definition not found.</p></PageWrapper>;
    }

    // Determine columns to show in the table (e.g., first 3-4 fields)
    const tableColumns = definition.fields.slice(0, 4);

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">{definition.namePlural}</h1>
                <Button onClick={handleNew} leftIcon={<Plus size={16} />}>
                    New {definition.nameSingular}
                </Button>
            </div>
            <Card>
                {recordsLoading ? (
                    <div className="p-8 text-center">Loading records...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    {tableColumns.map(field => (
                                        <th key={field.id} scope="col" className="px-6 py-3 font-medium">{field.label}</th>
                                    ))}
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record: CustomObjectRecord) => (
                                    <tr key={record.id} className="border-b border-border-subtle hover:bg-hover-bg cursor-pointer" onClick={() => handleEdit(record)}>
                                        {tableColumns.map(field => (
                                            <td key={field.id} className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                {String(record.fields[field.id] ?? '')}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleEdit(record)}}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                     <tr><td colSpan={tableColumns.length + 1} className="text-center p-8">No records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            <CustomObjectEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                definition={definition}
                record={selectedRecord}
            />
        </PageWrapper>
    );
};

export default CustomObjectListPage;