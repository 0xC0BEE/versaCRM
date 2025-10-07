import React, { useState, useEffect, useCallback } from 'react';
import { AnyContact, StructuredRecord, CustomField } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
import { useApp } from '../../../contexts/AppContext';
// FIX: Corrected import path for DataContext.
import { useData } from '../../../contexts/DataContext';
import toast from 'react-hot-toast';

interface StructuredRecordEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
    record: StructuredRecord | undefined;
}

const StructuredRecordEditModal: React.FC<StructuredRecordEditModalProps> = ({ isOpen, onClose, contact, record }) => {
    const { industryConfig } = useApp();
    const { updateContactMutation } = useData();
    
    const getInitialState = useCallback(() => {
        if (record) return { ...record };
        
        const defaultType = industryConfig.structuredRecordTypes.length > 0 
            ? industryConfig.structuredRecordTypes[0] 
            : null;

        return {
            id: `new-${Date.now()}`,
            type: defaultType?.id || '',
            title: '',
            recordDate: new Date().toISOString().split('T')[0],
            fields: {},
        } as StructuredRecord;
    }, [record, industryConfig.structuredRecordTypes]);
    
    const [data, setData] = useState<StructuredRecord>(getInitialState);

    useEffect(() => {
        if (isOpen) {
            setData(getInitialState());
        }
    }, [isOpen, getInitialState]);


    const handleChange = (field: keyof StructuredRecord, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleFieldChange = (fieldId: string, value: any) => {
        setData(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldId]: value,
            }
        }));
    };

    const selectedRecordType = industryConfig.structuredRecordTypes.find(rt => rt.id === data.type);

    const handleSave = () => {
        if (!data.title.trim()) {
            toast.error("Title is required.");
            return;
        }
        if (!data.type) {
            toast.error("Please select a record type.");
            return;
        }

        const existingRecords = contact.structuredRecords || [];
        let updatedRecords;

        if (record) { // Editing existing
            updatedRecords = existingRecords.map(r => r.id === record.id ? data : r);
        } else { // Adding new
            updatedRecords = [...existingRecords, data];
        }

        updateContactMutation.mutate({ ...contact, structuredRecords: updatedRecords }, {
            onSuccess: () => {
                toast.success("Record saved successfully!");
                onClose();
            }
        });
    };

    const renderField = (field: CustomField) => {
        const value = data.fields[field.id] || '';
        const props = {
            key: field.id,
            id: field.id,
            label: field.label,
            value: value,
            onChange: (e: React.ChangeEvent<any>) => handleFieldChange(field.id, e.target.value),
        };
        switch (field.type) {
            case 'textarea':
                return <Textarea {...props} rows={4} />;
            default:
                return <Input {...props} type={field.type} />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={record ? `Edit ${record.title}` : `Add New ${industryConfig.structuredRecordTabName}`}>
            <div className="space-y-4">
                <Input
                    id="record-title"
                    label="Title / Subject"
                    value={data.title}
                    onChange={e => handleChange('title', e.target.value)}
                    required
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="record-date"
                        label="Date"
                        type="date"
                        value={data.recordDate}
                        onChange={e => handleChange('recordDate', e.target.value)}
                        required
                    />
                    <Select
                        id="record-type"
                        label="Record Type"
                        value={data.type}
                        onChange={e => handleChange('type', e.target.value)}
                    >
                        {industryConfig.structuredRecordTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                    </Select>
                 </div>

                {selectedRecordType && (
                    <div className="pt-4 border-t dark:border-dark-border space-y-4">
                        {selectedRecordType.fields.map(field => renderField(field))}
                    </div>
                )}
            </div>
             <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={updateContactMutation.isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={updateContactMutation.isPending}>
                    {updateContactMutation.isPending ? 'Saving...' : 'Save Record'}
                </Button>
            </div>
        </Modal>
    );
};

export default StructuredRecordEditModal;
