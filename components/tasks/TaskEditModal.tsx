import React, { useMemo, useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';
import { Task, CustomObjectDefinition, CustomObjectRecord } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import { format } from 'date-fns';

interface TaskEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, onClose, task }) => {
    const { updateTaskMutation, customObjectDefsQuery } = useData();
    const { data: customObjectDefs = [] } = customObjectDefsQuery;

    const [selectedDefId, setSelectedDefId] = useState(task?.relatedObjectDefId || '');
    const { data: relatedRecords = [] } = useData().customObjectRecordsQuery(selectedDefId);

    const initialState = useMemo(() => ({
        title: '',
        dueDate: new Date().toISOString().split('T')[0],
        relatedObjectDefId: '',
        relatedObjectRecordId: '',
    }), []);
    
    const formDependency = useMemo(() => {
        if (!task) return null;
        return {
            ...initialState,
            ...task,
            dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
        };
    }, [task, initialState]);

    const { formData, handleChange } = useForm(initialState, formDependency);
    
     useEffect(() => {
        if (task?.relatedObjectDefId) {
            setSelectedDefId(task.relatedObjectDefId);
        }
    }, [task]);

    const handleDefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDefId = e.target.value;
        setSelectedDefId(newDefId);
        handleChange('relatedObjectDefId', newDefId);
        handleChange('relatedObjectRecordId', ''); // Reset record selection
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            toast.error("Task title cannot be empty.");
            return;
        }

        updateTaskMutation.mutate({ ...task!, ...formData }, {
            onSuccess: onClose
        });
    };

    const isPending = updateTaskMutation.isPending;
    const primaryFieldId = customObjectDefs.find((d: CustomObjectDefinition) => d.id === selectedDefId)?.fields[0]?.id;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
            <div className="space-y-4">
                <Input
                    id="task-title"
                    label="Task Title"
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    required
                    disabled={isPending}
                />
                <Input
                    id="task-due-date"
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={e => handleChange('dueDate', e.target.value)}
                    required
                    disabled={isPending}
                />

                <div className="pt-4 border-t border-border-subtle">
                     <label className="block text-sm font-medium text-text-primary mb-1">Link to Record (Optional)</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            id="related-object-def"
                            label=""
                            value={formData.relatedObjectDefId}
                            onChange={handleDefChange}
                        >
                            <option value="">Select Object Type...</option>
                            {customObjectDefs.map((def: CustomObjectDefinition) => <option key={def.id} value={def.id}>{def.nameSingular}</option>)}
                        </Select>
                        {selectedDefId && (
                            <Select
                                id="related-object-record"
                                label=""
                                value={formData.relatedObjectRecordId}
                                onChange={e => handleChange('relatedObjectRecordId', e.target.value)}
                                disabled={relatedRecords.isLoading}
                            >
                                <option value="">Select Record...</option>
                                {primaryFieldId && relatedRecords.map((rec: CustomObjectRecord) => (
                                    <option key={rec.id} value={rec.id}>{rec.fields[primaryFieldId]}</option>
                                ))}
                            </Select>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </Modal>
    );
};

export default TaskEditModal;
