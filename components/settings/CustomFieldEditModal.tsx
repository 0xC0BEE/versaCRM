import React from 'react';
import { CustomField } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface CustomFieldEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    field: CustomField | null;
    onSave: (field: CustomField) => void;
}

const CustomFieldEditModal: React.FC<CustomFieldEditModalProps> = ({ isOpen, onClose, field, onSave }) => {
    const isNew = !field;
    
    const getInitialState = (): CustomField => {
        return {
            id: field?.id || '',
            label: field?.label || '',
            type: field?.type || 'text',
            options: field?.options || [],
        };
    };

    const { formData, setFormData, handleChange } = useForm<CustomField>(getInitialState(), field);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };
    
    const addOption = () => {
        setFormData(prev => ({ ...prev, options: [...(prev.options || []), ''] }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({ ...prev, options: (prev.options || []).filter((_, i) => i !== index) }));
    };

    const handleSave = () => {
        if (!formData.label.trim()) {
            toast.error("Field label is required.");
            return;
        }
        if (formData.type === 'select' && (!formData.options || formData.options.length === 0)) {
            toast.error("Select fields must have at least one option.");
            return;
        }
        
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Add New Custom Field' : `Edit Field: ${field?.label}`}>
            <div className="space-y-4">
                <Input
                    id="field-label"
                    label="Field Label"
                    value={formData.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                    required
                />
                <Select
                    id="field-type"
                    label="Field Type"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value as CustomField['type'])}
                >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="textarea">Textarea</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File Upload</option>
                </Select>

                {formData.type === 'select' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
                        <div className="space-y-2 mt-1 max-h-48 overflow-y-auto pr-2">
                            {(formData.options || []).map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        id={`option-${index}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="flex-grow"
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    <Button variant="danger" size="sm" onClick={() => removeOption(index)}>
                                        <Trash2 size={14}/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={addOption} leftIcon={<Plus size={14} />} className="mt-2">
                            Add Option
                        </Button>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Field</Button>
            </div>
        </Modal>
    );
};

export default CustomFieldEditModal;