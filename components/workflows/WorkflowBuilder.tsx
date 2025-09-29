import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
// FIX: Imported the Workflow type.
import { Workflow } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface WorkflowBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    workflow: Workflow | null;
    organizationId: string;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ isOpen, onClose, workflow, organizationId }) => {
    
    const getInitialState = (): Omit<Workflow, 'id' | 'organizationId'> => {
        if (workflow) return { ...workflow };
        return {
            name: '',
            isActive: true,
            // FIX: Removed invalid 'conditions' empty object, as it's an optional property.
            trigger: { type: 'contactCreated' },
            actions: [{ type: 'createTask', params: { title: 'Follow up with new contact', dueInDays: 3 }}],
        };
    };
    
    const [data, setData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setData(getInitialState());
        }
    }, [isOpen, workflow]);

    const handleSave = () => {
        // Mock save
        toast.success("Workflow saved!");
        console.log("Saving workflow:", { ...data, organizationId });
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={workflow ? `Edit Workflow: ${workflow.name}` : 'Create New Workflow'} size="3xl">
            <div className="space-y-6">
                <Input id="wf-name" label="Workflow Name" value={data.name} onChange={e => setData(d => ({...d, name: e.target.value}))} />
                
                {/* Trigger */}
                <div className="p-4 border rounded-lg dark:border-dark-border">
                    <h4 className="font-semibold mb-2">Trigger</h4>
                     {/* FIX: Removed invalid 'conditions' empty object from state update. */}
                     <Select id="wf-trigger" label="When this happens..." value={data.trigger.type} onChange={e => setData(d => ({...d, trigger: { type: e.target.value as any }}))}>
                        <option value="contactCreated">A New Contact is Created</option>
                    </Select>
                </div>

                {/* Actions */}
                <div className="p-4 border rounded-lg dark:border-dark-border">
                     <h4 className="font-semibold mb-2">Do this...</h4>
                     <div className="space-y-3">
                        {data.actions.map((action, index) => (
                             <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                <p className="font-medium text-sm">Action: {action.type === 'createTask' ? 'Create a Task' : 'Send an Email'}</p>
                                {/* Add inputs for action params here */}
                            </div>
                        ))}
                     </div>
                </div>

            </div>
             <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Workflow</Button>
            </div>
        </Modal>
    );
};

export default WorkflowBuilder;
