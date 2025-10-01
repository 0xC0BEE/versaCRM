import React, { useState, useEffect } from 'react';
// FIX: Imported correct types.
import { AnyContact, StructuredRecord, CustomField } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
// FIX: Corrected import path for useApp.
import { useApp } from '../../../contexts/AppContext';
import toast from 'react-hot-toast';

interface StructuredRecordEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
    record: StructuredRecord | undefined;
}

const StructuredRecordEditModal: React.FC<StructuredRecordEditModalProps> = ({ isOpen, onClose, contact, record }) => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();
    
    const getInitialState = () => {
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
        };
    };
    
    const [data, setData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setData(getInitialState());
        }
    }, [isOpen, record]);

    const handleFieldChange = (fieldId: string, value: any) => {
        setData(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldId]: value,
            }
        }));
    };
    
    const handleSave = () => {
        // Mock save
        toast.success("Record saved successfully!");
        console.log("Saving record: ", data);
        onClose();
    };

    const currentRecordType = industryConfig.structuredRecordTypes.find(rt => rt.id === data.type);

    const renderField = (field: CustomField) => {
        const value = data.fields[field.id] || '';
        switch(field.type) {
            case 'text':
            case 'number':
            case 'date':
                return <Input key={field.id} id={field.id} label={field.label} type={field.type} value={value} onChange={e => handleFieldChange(field.id, e.target.value)} />;
            case 'textarea':
                return <Textarea key={field.id} id={field.id} label={field.label} value={value} onChange={e => handleFieldChange(field.id, e.target.value)} />;
             case 'select':
                return <Select key={field.id} id={field.id} label={field.label} value={value} onChange={e => handleFieldChange(field.id, e.target.value)}>
                    <option value="">Select...</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>;
            default:
                return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={record ? `Edit ${record.title}` : 'Add New Record'}>
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select id="record-type" label="Record Type" value={data.type} onChange={e => setData(d => ({ ...d, type: e.target.value, fields: {} }))} disabled={!!record}>
                         {industryConfig.structuredRecordTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                         ))}
                    </Select>
                    <Input id="record-date" label="Record Date" type="date" value={new Date(data.recordDate).toISOString().split('T')[0]} onChange={e => setData(d => ({...d, recordDate: e.target.value}))} />
                </div>
                <Input id="record-title" label="Title / Subject" value={data.title} onChange={e => setData(d => ({...d, title: e.target.value}))} />
                
                <div className="pt-4 border-t dark:border-dark-border space-y-3">
                    {currentRecordType?.fields.map(field => renderField(field))}
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Record</Button>
            </div>
        </Modal>
    );
};

export default StructuredRecordEditModal;